const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const HttpError = require("../utils/HttpError");
const { getLanguage } = require("../config/languages");
const { runAgainstInputs, outputsMatch } = require("../services/townhall");
const { judge, ranSuccessfully } = require("../services/judge");

const MAX_TESTS = 100;
const MAX_RUN_INPUTS = 50;

const str = (v, max = 50_000) => (typeof v === "string" ? v.slice(0, max) : "");
const normalizeNewlines = (s) => s.replace(/\r\n/g, "\n");

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Whitelist and normalize editable fields from the request body. */
function parseProblemInput(body = {}) {
  const fields = {};
  const title = str(body.title, 120).trim();
  if (!title) fields.title = "Title is required.";

  const slug = slugify(str(body.slug, 80) || title);
  if (!slug) fields.slug = "Slug is required.";

  const difficulty = Problem.DIFFICULTIES.includes(body.difficulty) ? body.difficulty : "Medium";

  const tags = (Array.isArray(body.tags) ? body.tags : str(body.tags).split(","))
    .map((t) => String(t).trim())
    .filter(Boolean)
    .slice(0, 10);

  const timeLimit = Number(body.timeLimit ?? 2);
  if (!(timeLimit >= 0.5 && timeLimit <= 15)) fields.timeLimit = "Time limit must be 0.5–15 seconds.";
  const memoryLimit = Number(body.memoryLimit ?? 256);
  if (!(memoryLimit >= 32 && memoryLimit <= 500)) fields.memoryLimit = "Memory limit must be 32–500 MB.";

  const ref = body.referenceSolution || {};
  const languageId = Number(ref.languageId ?? 71);
  if (!getLanguage(languageId)) fields.referenceSolution = "Unsupported language.";

  const rawTests = Array.isArray(body.testCases) ? body.testCases : [];
  if (rawTests.length > MAX_TESTS) fields.testCases = `At most ${MAX_TESTS} test cases.`;
  const testCases = rawTests.slice(0, MAX_TESTS).map((t) => ({
    ...(t._id && mongoose.isValidObjectId(t._id) && { _id: t._id }),
    input: normalizeNewlines(str(t.input, 1_000_000)),
    expectedOutput: normalizeNewlines(str(t.expectedOutput, 1_000_000)),
    isSample: Boolean(t.isSample),
    explanation: str(t.explanation, 2000),
  }));

  if (Object.keys(fields).length) throw new HttpError(400, "Please fix the highlighted fields.", fields);

  return {
    title,
    slug,
    difficulty,
    tags,
    description: str(body.description),
    inputFormat: str(body.inputFormat, 5000),
    outputFormat: str(body.outputFormat, 5000),
    constraints: str(body.constraints, 5000),
    timeLimit,
    memoryLimit,
    referenceSolution: { languageId, code: str(ref.code, 65_536) },
    testCases,
  };
}

/** Requirements a problem must meet before developers can see it. */
function publishIssues(p) {
  const issues = [];
  if (!p.description.trim()) issues.push("Add a problem description.");
  if (!p.referenceSolution.code.trim()) issues.push("Add a reference solution.");
  if (p.testCases.length === 0) issues.push("Add at least one test case.");
  if (!p.testCases.some((t) => t.isSample)) issues.push("Mark at least one test case as a sample.");
  const missing = p.testCases.findIndex((t) => !t.expectedOutput.trim());
  if (missing !== -1) issues.push(`Test case ${missing + 1} has no expected output.`);
  return issues;
}

/**
 * Run the reference solution against every stored test case.
 * Throws 422 with per-test details when anything fails.
 */
async function verifyOrThrow(problem) {
  const issues = publishIssues(problem);
  if (issues.length) {
    const err = new HttpError(422, issues[0]);
    err.details = { issues };
    throw err;
  }

  const outcome = await judge({
    languageId: problem.referenceSolution.languageId,
    code: problem.referenceSolution.code,
    testCases: problem.testCases,
    limits: problem,
  });

  if (outcome.verdict !== "Accepted") {
    const failures = outcome.results
      .map((r, index) => ({ index, ...r }))
      .filter((r) => r.verdict !== "Accepted")
      .slice(0, 10)
      .map((r) => ({
        index: r.index,
        verdict: r.verdict,
        stdout: r.stdout,
        stderr: r.stderr,
        compileOutput: r.compileOutput,
      }));
    const err = new HttpError(
      422,
      `Reference solution failed ${outcome.total - outcome.passed} of ${outcome.total} tests (${outcome.verdict}).`,
    );
    err.details = { failures };
    throw err;
  }
  return outcome;
}

async function findProblemOr404(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "Problem not found.");
  const problem = await Problem.findById(id);
  if (!problem) throw new HttpError(404, "Problem not found.");
  return problem;
}

async function ensureSlugFree(slug, exceptId) {
  const clash = await Problem.findOne({ slug, ...(exceptId && { _id: { $ne: exceptId } }) }).select("_id").lean();
  if (clash) throw new HttpError(409, "Slug is already in use.", { slug: "Another problem already uses this slug." });
}

// GET /api/admin/problems
async function listProblems(_req, res) {
  const problems = await Problem.aggregate([
    { $sort: { updatedAt: -1 } },
    {
      $project: {
        title: 1,
        slug: 1,
        difficulty: 1,
        tags: 1,
        status: 1,
        updatedAt: 1,
        publishedAt: 1,
        verifiedAt: 1,
        testCount: { $size: "$testCases" },
        sampleCount: {
          $size: { $filter: { input: "$testCases", as: "t", cond: "$$t.isSample" } },
        },
      },
    },
  ]);
  res.json({ problems: problems.map(({ _id, ...p }) => ({ id: _id.toString(), ...p })) });
}

// GET /api/admin/problems/:id
async function getProblem(req, res) {
  const problem = await findProblemOr404(req.params.id);
  res.json({ problem: toAdminJSON(problem) });
}

// POST /api/admin/problems
async function createProblem(req, res) {
  const input = parseProblemInput(req.body);
  await ensureSlugFree(input.slug);
  const problem = await Problem.create({ ...input, createdBy: req.user._id });
  res.status(201).json({ problem: toAdminJSON(problem) });
}

// PUT /api/admin/problems/:id
async function updateProblem(req, res) {
  const problem = await findProblemOr404(req.params.id);
  const input = parseProblemInput(req.body);
  await ensureSlugFree(input.slug, problem._id);

  problem.set(input);
  // Developers must never see a broken problem: re-verify live problems before saving.
  if (problem.status === "published") {
    await verifyOrThrow(problem);
    problem.verifiedAt = new Date();
  } else {
    problem.verifiedAt = undefined;
  }
  await problem.save();
  res.json({ problem: toAdminJSON(problem) });
}

// DELETE /api/admin/problems/:id
async function deleteProblem(req, res) {
  const problem = await findProblemOr404(req.params.id);
  await Submission.deleteMany({ problem: problem._id });
  await problem.deleteOne();
  res.status(204).end();
}

// POST /api/admin/problems/:id/publish
async function publishProblem(req, res) {
  const problem = await findProblemOr404(req.params.id);
  const outcome = await verifyOrThrow(problem);
  problem.status = "published";
  problem.publishedAt = problem.publishedAt || new Date();
  problem.verifiedAt = new Date();
  await problem.save();
  res.json({ problem: toAdminJSON(problem), verification: { passed: outcome.passed, total: outcome.total } });
}

// POST /api/admin/problems/:id/unpublish
async function unpublishProblem(req, res) {
  const problem = await findProblemOr404(req.params.id);
  problem.status = "draft";
  await problem.save();
  res.json({ problem: toAdminJSON(problem) });
}

/**
 * POST /api/admin/run
 * Run code (normally the reference solution) against a set of inputs and return
 * each output, so the admin can review it and use it as the expected output.
 * Body: { languageId, code, inputs: string[], expectedOutputs?: string[], timeLimit?, memoryLimit? }
 */
async function runCode(req, res) {
  const { languageId, code, inputs, expectedOutputs = [], timeLimit, memoryLimit } = req.body || {};
  if (!getLanguage(languageId)) throw new HttpError(400, "Unsupported language.");
  if (typeof code !== "string" || !code.trim()) throw new HttpError(400, "Write some code to run.");
  if (!Array.isArray(inputs) || inputs.length === 0) throw new HttpError(400, "Add at least one test input.");
  if (inputs.length > MAX_RUN_INPUTS) throw new HttpError(400, `Run at most ${MAX_RUN_INPUTS} inputs at a time.`);

  const results = await runAgainstInputs({
    languageId: Number(languageId),
    sourceCode: code,
    inputs: inputs.map((i) => normalizeNewlines(String(i ?? ""))),
    limits: { timeLimit, memoryLimit },
  });

  res.json({
    results: results.map((r, i) => {
      const expected = typeof expectedOutputs[i] === "string" ? expectedOutputs[i] : "";
      return {
        ...r,
        ok: ranSuccessfully(r),
        // null when there is nothing to compare against yet
        matchesExpected: expected.trim() && ranSuccessfully(r) ? outputsMatch(r.stdout, expected) : null,
      };
    }),
  });
}

function toAdminJSON(p) {
  const o = p.toObject({ versionKey: false });
  return {
    ...o,
    id: o._id.toString(),
    _id: undefined,
    testCases: o.testCases.map((t) => ({ ...t, _id: t._id.toString() })),
  };
}

module.exports = {
  listProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  publishProblem,
  unpublishProblem,
  runCode,
};
