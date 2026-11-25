/**
 * Turns raw townhall results into clashofcode verdicts.
 * We compare outputs ourselves (same trim rule as townhall) so the logic is
 * identical for admin verification and developer submissions.
 */
const { STATUS, runAgainstInputs, outputsMatch } = require("./townhall");

function verdictFor(result, expectedOutput) {
  switch (result.statusId) {
    case STATUS.ACCEPTED:
    case STATUS.WRONG_ANSWER:
      return outputsMatch(result.stdout, expectedOutput) ? "Accepted" : "Wrong Answer";
    case STATUS.TIME_LIMIT:
      return "Time Limit Exceeded";
    case STATUS.COMPILATION_ERROR:
      return "Compilation Error";
    case STATUS.INTERNAL_ERROR:
    case 14: // Exec Format Error
      return "Internal Error";
    default:
      return "Runtime Error"; // 7–12: SIGSEGV, SIGXFSZ, SIGFPE, SIGABRT, NZEC, Other
  }
}

/** Did the program run to completion (regardless of correctness)? */
function ranSuccessfully(result) {
  return result.statusId === STATUS.ACCEPTED || result.statusId === STATUS.WRONG_ANSWER;
}

/**
 * Judge code against a list of test cases.
 * @returns {{verdict:string, passed:number, total:number, time:number|null, memory:number|null, results:object[]}}
 */
async function judge({ languageId, code, testCases, limits }) {
  const raw = await runAgainstInputs({
    languageId,
    sourceCode: code,
    inputs: testCases.map((t) => t.input),
    limits,
  });

  const results = raw.map((r, i) => ({
    ...r,
    verdict: verdictFor(r, testCases[i].expectedOutput),
  }));

  const firstFail = results.find((r) => r.verdict !== "Accepted");
  const times = results.map((r) => r.time).filter((t) => t != null);
  const mems = results.map((r) => r.memory).filter((m) => m != null);

  return {
    verdict: firstFail ? firstFail.verdict : "Accepted",
    passed: results.filter((r) => r.verdict === "Accepted").length,
    total: results.length,
    time: times.length ? Math.max(...times) : null,
    memory: mems.length ? Math.max(...mems) : null,
    results,
  };
}

module.exports = { judge, verdictFor, ranSuccessfully };
