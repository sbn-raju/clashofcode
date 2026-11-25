const Problem = require("../models/Problem");
const Submission = require("../models/Submission");
const HttpError = require("../utils/HttpError");
const { LANGUAGES, getLanguage } = require("../config/languages");
const { runAgainstInputs } = require("../services/townhall");
const { judge, verdictFor, ranSuccessfully } = require("../services/judge");

const MAX_CODE = 65_536;
const MAX_CUSTOM_INPUT = 100_000;

async function findPublishedOr404(slug) {
  const problem = await Problem.findOne({ slug: String(slug).toLowerCase(), status: "published" });
  if (!problem) throw new HttpError(404, "Problem not found.");
  return problem;
}

function parseCode(body = {}) {
  const languageId = Number(body.languageId);
  if (!getLanguage(languageId)) throw new HttpError(400, "Choose a supported language.");
  if (typeof body.code !== "string" || !body.code.trim()) throw new HttpError(400, "Write some code first.");
  if (body.code.length > MAX_CODE) throw new HttpError(400, "Code must be under 64 KB.");
  return { languageId, code: body.code };
}

// GET /api/languages
function listLanguages(_req, res) {
  res.json({ languages: LANGUAGES.map(({ id, key, name, template }) => ({ id, key, name, template })) });
}

// GET /api/problems
async function listProblems(req, res) {
  const [problems, mine, stats] = await Promise.all([
    Problem.find({ status: "published" })
      .select("title slug difficulty tags publishedAt")
      .sort({ publishedAt: 1, _id: 1 })
      .lean(),
    Submission.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: "$problem", solved: { $max: { $eq: ["$verdict", "Accepted"] } } } },
    ]),
    Submission.aggregate([
      {
        $group: {
          _id: "$problem",
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ["$verdict", "Accepted"] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const mineById = new Map(mine.map((m) => [m._id.toString(), m.solved ? "solved" : "attempted"]));
  const statsById = new Map(stats.map((s) => [s._id.toString(), s]));

  res.json({
    problems: problems.map((p, i) => {
      const s = statsById.get(p._id.toString());
      return {
        id: p._id.toString(),
        number: i + 1,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        tags: p.tags,
        status: mineById.get(p._id.toString()) ?? "todo",
        submissions: s?.total ?? 0,
        acceptanceRate: s?.total ? Math.round((s.accepted / s.total) * 1000) / 10 : null,
      };
    }),
  });
}

// GET /api/problems/:slug
async function getProblem(req, res) {
  const problem = await findPublishedOr404(req.params.slug);
  const solved = await Submission.exists({ user: req.user._id, problem: problem._id, verdict: "Accepted" });

  res.json({
    problem: {
      id: problem._id.toString(),
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      tags: problem.tags,
      description: problem.description,
      inputFormat: problem.inputFormat,
      outputFormat: problem.outputFormat,
      constraints: problem.constraints,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      // Only sample tests ever leave the server.
      samples: problem.testCases
        .filter((t) => t.isSample)
        .map((t) => ({ input: t.input, expectedOutput: t.expectedOutput, explanation: t.explanation })),
      hiddenTestCount: problem.testCases.filter((t) => !t.isSample).length,
      solved: Boolean(solved),
    },
  });
}

/**
 * POST /api/problems/:slug/run
 * Body: { languageId, code, customInput? }
 * Without customInput: runs against the sample tests.
 * With customInput: runs the developer's code and the reference solution on it,
 * so the expected output comes from the reference.
 */
async function runProblem(req, res) {
  const problem = await findPublishedOr404(req.params.slug);
  const { languageId, code } = parseCode(req.body);
  const customInput = req.body?.customInput;

  if (typeof customInput === "string") {
    if (customInput.length > MAX_CUSTOM_INPUT) throw new HttpError(400, "Custom input must be under 100 KB.");
    const input = customInput.replace(/\r\n/g, "\n");
    const [[mine], [ref]] = await Promise.all([
      runAgainstInputs({ languageId, sourceCode: code, inputs: [input], limits: problem }),
      runAgainstInputs({
        languageId: problem.referenceSolution.languageId,
        sourceCode: problem.referenceSolution.code,
        inputs: [input],
        limits: problem,
      }),
    ]);
    const expected = ranSuccessfully(ref) ? ref.stdout ?? "" : null;
    return res.json({
      mode: "custom",
      results: [
        {
          input,
          expectedOutput: expected,
          ...publicResult(mine),
          verdict: expected == null ? (ranSuccessfully(mine) ? null : verdictFor(mine, "")) : verdictFor(mine, expected),
        },
      ],
      // e.g. the custom input violates the problem's constraints
      referenceFailed: expected == null,
    });
  }

  const samples = problem.testCases.filter((t) => t.isSample);
  const outcome = await judge({ languageId, code, testCases: samples, limits: problem });
  res.json({
    mode: "samples",
    verdict: outcome.verdict,
    passed: outcome.passed,
    total: outcome.total,
    results: outcome.results.map((r, i) => ({
      input: samples[i].input,
      expectedOutput: samples[i].expectedOutput,
      ...publicResult(r),
      verdict: r.verdict,
    })),
  });
}

// POST /api/problems/:slug/submit
async function submitProblem(req, res) {
  const problem = await findPublishedOr404(req.params.slug);
  const { languageId, code } = parseCode(req.body);

  const outcome = await judge({ languageId, code, testCases: problem.testCases, limits: problem });

  const submission = await Submission.create({
    user: req.user._id,
    problem: problem._id,
    languageId,
    code,
    verdict: outcome.verdict,
    passed: outcome.passed,
    total: outcome.total,
    time: outcome.time ?? undefined,
    memory: outcome.memory ?? undefined,
  });

  // Report the first failing test. Hidden test data (input, expected and the
  // program's output on it) is never returned.
  let failedTest = null;
  const failIndex = outcome.results.findIndex((r) => r.verdict !== "Accepted");
  if (failIndex !== -1) {
    const tc = problem.testCases[failIndex];
    const r = outcome.results[failIndex];
    failedTest = {
      number: failIndex + 1,
      verdict: r.verdict,
      isSample: tc.isSample,
      compileOutput: r.compileOutput,
      ...(tc.isSample && {
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        stdout: r.stdout,
        stderr: r.stderr,
      }),
    };
  }

  res.status(201).json({ submission: toSubmissionJSON(submission), failedTest });
}

// GET /api/problems/:slug/submissions
async function listSubmissions(req, res) {
  const problem = await findPublishedOr404(req.params.slug);
  const submissions = await Submission.find({ user: req.user._id, problem: problem._id })
    .sort({ createdAt: -1 })
    .limit(25);
  res.json({ submissions: submissions.map(toSubmissionJSON) });
}

function publicResult(r) {
  return {
    status: r.status,
    stdout: r.stdout,
    stderr: r.stderr,
    compileOutput: r.compileOutput,
    time: r.time,
    memory: r.memory,
  };
}

function toSubmissionJSON(s) {
  return {
    id: s._id.toString(),
    languageId: s.languageId,
    language: getLanguage(s.languageId)?.name ?? `Language ${s.languageId}`,
    code: s.code,
    verdict: s.verdict,
    passed: s.passed,
    total: s.total,
    time: s.time ?? null,
    memory: s.memory ?? null,
    createdAt: s.createdAt,
  };
}

module.exports = { listLanguages, listProblems, getProblem, runProblem, submitProblem, listSubmissions };
