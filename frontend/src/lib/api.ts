export type Role = "professional" | "admin"

export type User = {
  id: string
  name: string
  handle: string
  email: string
  role: Role
  rating: number
  createdAt: string
}

export type FieldErrors = Partial<Record<string, string>>

export class ApiError extends Error {
  status: number
  fields: FieldErrors
  data: Record<string, unknown>

  constructor(status: number, message: string, fields: FieldErrors = {}, data: Record<string, unknown> = {}) {
    super(message)
    this.status = status
    this.fields = fields
    this.data = data
  }
}

const BASE = import.meta.env.VITE_API_URL ?? "/api"

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init.headers },
      ...init,
    })
  } catch {
    throw new ApiError(0, "Connection interrupted. Check your network and try again.")
  }

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new ApiError(res.status, data.message ?? "Something went wrong.", data.fields, data)
  }
  return data as T
}

const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) })
const put = <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) })

/* ---------- Auth ---------- */

export type SignupInput = { name: string; handle: string; email: string; password: string }
export type LoginInput = { identifier: string; password: string }

export const authApi = {
  me: () => request<{ user: User }>("/auth/me"),
  signup: (body: SignupInput) => post<{ user: User }>("/auth/signup", body),
  login: (body: LoginInput) => post<{ user: User }>("/auth/login", body),
  adminLogin: (body: LoginInput) => post<{ user: User }>("/auth/admin/login", body),
  logout: () => post<void>("/auth/logout"),
}

/* ---------- Shared problem types ---------- */

export type Difficulty = "Easy" | "Medium" | "Hard" | "Expert"
export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard", "Expert"]

export type Language = { id: number; key: string; name: string; template: string }

export type Verdict =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Compilation Error"
  | "Runtime Error"
  | "Internal Error"

export type ExecResult = {
  status: string
  stdout: string | null
  stderr: string | null
  compileOutput: string | null
  time: number | null
  memory: number | null
}

export const languagesApi = {
  list: () => request<{ languages: Language[] }>("/languages"),
}

/* ---------- Developer ---------- */

export type ProblemListItem = {
  id: string
  number: number
  title: string
  slug: string
  difficulty: Difficulty
  tags: string[]
  status: "todo" | "attempted" | "solved"
  submissions: number
  acceptanceRate: number | null
}

export type ProblemDetail = {
  id: string
  title: string
  slug: string
  difficulty: Difficulty
  tags: string[]
  description: string
  inputFormat: string
  outputFormat: string
  constraints: string
  timeLimit: number
  memoryLimit: number
  samples: { input: string; expectedOutput: string; explanation: string }[]
  hiddenTestCount: number
  solved: boolean
}

export type RunCaseResult = ExecResult & {
  input: string
  expectedOutput: string | null
  verdict: Verdict | null
}

export type RunResponse =
  | { mode: "samples"; verdict: Verdict; passed: number; total: number; results: RunCaseResult[] }
  | { mode: "custom"; results: RunCaseResult[]; referenceFailed: boolean }

export type SubmissionSummary = {
  id: string
  languageId: number
  language: string
  code: string
  verdict: Verdict
  passed: number
  total: number
  time: number | null
  memory: number | null
  createdAt: string
}

export type FailedTest = {
  number: number
  verdict: Verdict
  isSample: boolean
  compileOutput: string | null
  input?: string
  expectedOutput?: string
  stdout?: string | null
  stderr?: string | null
}

type CodeBody = { languageId: number; code: string }

export const problemsApi = {
  list: () => request<{ problems: ProblemListItem[] }>("/problems"),
  get: (slug: string) => request<{ problem: ProblemDetail }>(`/problems/${encodeURIComponent(slug)}`),
  run: (slug: string, body: CodeBody & { customInput?: string }) =>
    post<RunResponse>(`/problems/${encodeURIComponent(slug)}/run`, body),
  submit: (slug: string, body: CodeBody) =>
    post<{ submission: SubmissionSummary; failedTest: FailedTest | null }>(
      `/problems/${encodeURIComponent(slug)}/submit`,
      body,
    ),
  submissions: (slug: string) =>
    request<{ submissions: SubmissionSummary[] }>(`/problems/${encodeURIComponent(slug)}/submissions`),
}

/* ---------- Admin ---------- */

export type AdminTestCase = {
  _id?: string
  input: string
  expectedOutput: string
  isSample: boolean
  explanation: string
}

export type AdminProblem = {
  id: string
  title: string
  slug: string
  difficulty: Difficulty
  tags: string[]
  description: string
  inputFormat: string
  outputFormat: string
  constraints: string
  timeLimit: number
  memoryLimit: number
  referenceSolution: { languageId: number; code: string }
  testCases: AdminTestCase[]
  status: "draft" | "published"
  publishedAt?: string
  verifiedAt?: string
  createdAt: string
  updatedAt: string
}

export type AdminProblemInput = Omit<AdminProblem, "id" | "status" | "publishedAt" | "verifiedAt" | "createdAt" | "updatedAt">

export type AdminProblemListItem = {
  id: string
  title: string
  slug: string
  difficulty: Difficulty
  tags: string[]
  status: "draft" | "published"
  updatedAt: string
  publishedAt?: string
  verifiedAt?: string
  testCount: number
  sampleCount: number
}

export type AdminRunResult = ExecResult & { ok: boolean; matchesExpected: boolean | null }

export type VerificationFailure = {
  index: number
  verdict: Verdict
  stdout: string | null
  stderr: string | null
  compileOutput: string | null
}

export const adminApi = {
  list: () => request<{ problems: AdminProblemListItem[] }>("/admin/problems"),
  get: (id: string) => request<{ problem: AdminProblem }>(`/admin/problems/${id}`),
  create: (body: AdminProblemInput) => post<{ problem: AdminProblem }>("/admin/problems", body),
  update: (id: string, body: AdminProblemInput) => put<{ problem: AdminProblem }>(`/admin/problems/${id}`, body),
  remove: (id: string) => request<void>(`/admin/problems/${id}`, { method: "DELETE" }),
  publish: (id: string) =>
    post<{ problem: AdminProblem; verification: { passed: number; total: number } }>(`/admin/problems/${id}/publish`),
  unpublish: (id: string) => post<{ problem: AdminProblem }>(`/admin/problems/${id}/unpublish`),
  run: (body: {
    languageId: number
    code: string
    inputs: string[]
    expectedOutputs?: string[]
    timeLimit?: number
    memoryLimit?: number
  }) => post<{ results: AdminRunResult[] }>("/admin/run", body),
}
