import type { AdminProblem, AdminProblemInput, AdminRunResult, AdminTestCase } from "../../lib/api"

/** Test case with a stable client-side key for React lists and run results. */
export type EditableTestCase = AdminTestCase & { key: string }

export type EditableProblem = Omit<AdminProblemInput, "testCases"> & { testCases: EditableTestCase[] }

export type RunState = { status: "running" } | { status: "done"; result: AdminRunResult } | { status: "error"; message: string }

const newKey = () => crypto.randomUUID()

export function blankTestCase(isSample = false): EditableTestCase {
  return { key: newKey(), input: "", expectedOutput: "", isSample, explanation: "" }
}

export function emptyProblem(defaultTemplate = ""): EditableProblem {
  return {
    title: "",
    slug: "",
    difficulty: "Medium",
    tags: [],
    description: "",
    inputFormat: "",
    outputFormat: "",
    constraints: "",
    timeLimit: 2,
    memoryLimit: 256,
    referenceSolution: { languageId: 71, code: defaultTemplate },
    testCases: [blankTestCase(true)],
  }
}

export function toEditable(p: AdminProblem): EditableProblem {
  return {
    title: p.title,
    slug: p.slug,
    difficulty: p.difficulty,
    tags: p.tags,
    description: p.description,
    inputFormat: p.inputFormat,
    outputFormat: p.outputFormat,
    constraints: p.constraints,
    timeLimit: p.timeLimit,
    memoryLimit: p.memoryLimit,
    referenceSolution: { ...p.referenceSolution },
    testCases: p.testCases.map((t) => ({ ...t, key: t._id ?? newKey() })),
  }
}

export function toPayload(p: EditableProblem): AdminProblemInput {
  return {
    ...p,
    testCases: p.testCases.map((t) => ({
      ...(t._id && { _id: t._id }),
      input: t.input,
      expectedOutput: t.expectedOutput,
      isSample: t.isSample,
      explanation: t.explanation,
    })),
  }
}
