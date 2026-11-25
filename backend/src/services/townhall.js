/**
 * Client for the townhall code-execution service (Judge0-compatible API).
 *
 * Uses the batch endpoints: POST /submissions/batch creates up to 20 submissions,
 * GET /submissions/batch?tokens=... polls them until every one has finished.
 */
const { townhallUrl, townhallToken } = require("../config/env");
const HttpError = require("../utils/HttpError");

const BATCH_SIZE = 20; // townhall's per-request maximum
const POLL_INTERVAL_MS = 400;
const MAX_WAIT_MS = 90_000;
const FIELDS = "token,stdout,stderr,compile_output,message,status,time,memory,exit_code";

// townhall status IDs (townhall/src/languages/index.js)
const STATUS = {
  IN_QUEUE: 1,
  PROCESSING: 2,
  ACCEPTED: 3,
  WRONG_ANSWER: 4,
  TIME_LIMIT: 5,
  COMPILATION_ERROR: 6,
  INTERNAL_ERROR: 13,
};

const b64 = (s) => Buffer.from(s ?? "", "utf8").toString("base64");
const unb64 = (s) => (s == null ? null : Buffer.from(s, "base64").toString("utf8"));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(path, init = {}) {
  let res;
  try {
    res = await fetch(`${townhallUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(townhallToken && { "X-Auth-Token": townhallToken }),
        ...init.headers,
      },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new HttpError(503, "The code execution service is unavailable. Please try again shortly.");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("townhall error", res.status, body);
    if (res.status === 401) throw new HttpError(502, "Execution service rejected our credentials.");
    if (res.status === 429) throw new HttpError(429, "Too many runs right now. Please wait a moment.");
    throw new HttpError(502, body.message || "The code execution service returned an error.");
  }
  return body;
}

/**
 * Convert problem limits into townhall submission limits.
 * timeLimit is seconds, memoryLimit is MB (townhall expects KB).
 */
function limitsFor({ timeLimit = 2, memoryLimit = 256 } = {}) {
  const cpu = Math.min(Math.max(Number(timeLimit) || 2, 0.5), 15);
  return {
    cpu_time_limit: cpu,
    wall_time_limit: Math.min(Math.max(cpu * 3, 5), 30),
    memory_limit: Math.min(Math.max(Number(memoryLimit) || 256, 32) * 1024, 512000),
  };
}

function decodeResult(r) {
  return {
    statusId: r.status?.id ?? STATUS.INTERNAL_ERROR,
    status: r.status?.description ?? "Internal Error",
    stdout: unb64(r.stdout),
    stderr: unb64(r.stderr),
    compileOutput: unb64(r.compile_output),
    message: r.message ?? null,
    time: r.time != null ? Number(r.time) : null,
    memory: r.memory != null ? Number(r.memory) : null,
  };
}

async function runChunk(jobs, limits) {
  const created = await call("/submissions/batch?base64_encoded=true", {
    method: "POST",
    body: JSON.stringify({
      submissions: jobs.map((j) => ({
        source_code: b64(j.sourceCode),
        language_id: j.languageId,
        stdin: b64(j.stdin),
        ...(j.expectedOutput != null && { expected_output: b64(j.expectedOutput) }),
        ...limits,
      })),
    }),
  });

  const tokens = created.map((c) => c.token);
  if (tokens.some((t) => !t)) throw new HttpError(502, "Execution service did not accept the submission.");

  const results = new Map();
  const deadline = Date.now() + MAX_WAIT_MS;
  while (results.size < tokens.length) {
    if (Date.now() > deadline) throw new HttpError(504, "Code execution timed out. Please try again.");
    await sleep(POLL_INTERVAL_MS);
    const pending = tokens.filter((t) => !results.has(t));
    const { submissions = [] } = await call(
      `/submissions/batch?base64_encoded=true&fields=${FIELDS}&tokens=${pending.join(",")}`,
    );
    for (const s of submissions) {
      if (s.token && s.status && s.status.id > STATUS.PROCESSING) results.set(s.token, s);
    }
  }
  return tokens.map((t) => decodeResult(results.get(t)));
}

/**
 * Run one program against many stdin inputs.
 * @param {{languageId:number, sourceCode:string, inputs:string[], expectedOutputs?:(string|null)[], limits?:object}} opts
 * @returns {Promise<ReturnType<typeof decodeResult>[]>} one result per input, same order
 */
async function runAgainstInputs({ languageId, sourceCode, inputs, expectedOutputs = [], limits }) {
  const jobs = inputs.map((stdin, i) => ({
    languageId,
    sourceCode,
    stdin,
    expectedOutput: expectedOutputs[i] ?? null,
  }));
  const lim = limitsFor(limits);
  const chunks = [];
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) chunks.push(jobs.slice(i, i + BATCH_SIZE));
  const results = await Promise.all(chunks.map((c) => runChunk(c, lim)));
  return results.flat();
}

/** Same rule townhall uses to decide Accepted vs Wrong Answer. */
function outputsMatch(actual, expected) {
  return (actual ?? "").trim() === (expected ?? "").trim();
}

module.exports = { STATUS, runAgainstInputs, outputsMatch };
