import {
  Alert,
  Badge,
  Box,
  Button,
  Center,
  CloseButton,
  Container,
  Dialog,
  Flex,
  Heading,
  HStack,
  Link,
  NativeSelect,
  Portal,
  Spinner,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react"
import { ArrowLeft, ExternalLink, Play, Plus, Save, Send, Trash2, Undo2, Wand2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { CodeEditor } from "../../components/CodeEditor"
import { StatementForm } from "../../features/admin/StatementForm"
import { TestCaseCard } from "../../features/admin/TestCaseCard"
import {
  blankTestCase,
  emptyProblem,
  toEditable,
  toPayload,
  type EditableProblem,
  type EditableTestCase,
  type RunState,
} from "../../features/admin/types"
import { useLanguages } from "../../features/problems/useLanguages"
import { adminApi, ApiError, type AdminProblem, type FieldErrors, type Language, type VerificationFailure } from "../../lib/api"

type Notice = { tone: "success" | "error" | "info"; title: string; items?: string[] } | null

const RUN_CHUNK = 50 // server's per-request limit for /admin/run

/**
 * Loads languages (+ the problem when editing), then mounts the editor with
 * complete initial state.
 */
export default function AdminProblemEditorPage() {
  const { id } = useParams()
  const isNew = !id || id === "new"
  const { languages, error: languagesError } = useLanguages()
  const [loaded, setLoaded] = useState<AdminProblem | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  // A problem created by the editor on this screen: after the URL changes from
  // /new to /:id we keep the same editor mounted instead of refetching.
  const [createdId, setCreatedId] = useState<string | null>(null)
  const fetchedId = useRef<string | null>(null)

  useEffect(() => {
    if (isNew || id === createdId || fetchedId.current === id) return
    fetchedId.current = id!
    adminApi
      .get(id!)
      .then(({ problem }) => setLoaded(problem))
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : "Could not load problem."))
  }, [id, isNew, createdId])

  const error = loadError ?? languagesError
  if (error)
    return (
      <Container maxW="7xl" py="10">
        <Alert.Root status="error"><Alert.Indicator /><Alert.Title>{error}</Alert.Title></Alert.Root>
      </Container>
    )

  const editing = loaded?.id === id ? loaded : null
  if (!languages.length || (!isNew && id !== createdId && !editing))
    return (
      <Center py="24">
        <Spinner color="brand.500" />
      </Center>
    )

  return (
    <ProblemEditor
      languages={languages}
      initialMeta={editing}
      initial={editing ? toEditable(editing) : emptyProblem(languages.find((l) => l.id === 71)?.template ?? "")}
      onCreated={setCreatedId}
    />
  )
}

type EditorProps = {
  languages: Language[]
  initial: EditableProblem
  initialMeta: AdminProblem | null
  onCreated: (id: string) => void
}

function ProblemEditor({ languages, initial, initialMeta, onCreated }: EditorProps) {
  const navigate = useNavigate()

  const [problem, setProblem] = useState<EditableProblem>(initial)
  const [meta, setMeta] = useState<AdminProblem | null>(initialMeta)
  const isNew = !meta
  const [dirty, setDirty] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState<null | "save" | "publish" | "unpublish" | "delete" | "runAll">(null)
  const [runs, setRuns] = useState<Record<string, RunState>>({})
  const [tab, setTab] = useState<string>("statement")
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Warn before leaving with unsaved edits
  useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  const language = languages.find((l) => l.id === problem.referenceSolution.languageId)

  const update = useCallback((patch: Partial<EditableProblem>) => {
    setProblem((p) => ({ ...p, ...patch }))
    setDirty(true)
  }, [])

  const setCode = (code: string) => {
    update({ referenceSolution: { ...problem.referenceSolution, code } })
    setRuns({}) // results no longer describe this code
  }

  const setLanguage = (languageId: number) => {
    const current = problem.referenceSolution
    const oldTemplate = languages.find((l) => l.id === current.languageId)?.template
    const untouched = !current.code.trim() || current.code === oldTemplate
    update({
      referenceSolution: {
        languageId,
        code: untouched ? languages.find((l) => l.id === languageId)?.template ?? "" : current.code,
      },
    })
    setRuns({})
  }

  const updateTest = (key: string, patch: Partial<EditableTestCase>) => {
    update({ testCases: problem.testCases.map((t) => (t.key === key ? { ...t, ...patch } : t)) })
    if ("input" in patch) {
      setRuns((r) => {
        const next = { ...r }
        delete next[key]
        return next
      })
    }
  }

  const addTest = () => update({ testCases: [...problem.testCases, blankTestCase(false)] })
  const removeTest = (key: string) => update({ testCases: problem.testCases.filter((t) => t.key !== key) })

  /* ---------- Running the reference solution ---------- */

  /** Runs the reference solution on the given tests. Returns an error message if any chunk failed. */
  async function runTests(tests: EditableTestCase[]): Promise<string | null> {
    if (!tests.length) return null
    let failure: string | null = null
    const { referenceSolution, timeLimit, memoryLimit } = problem
    setRuns((r) => ({ ...r, ...Object.fromEntries(tests.map((t) => [t.key, { status: "running" } as RunState])) }))
    for (let i = 0; i < tests.length; i += RUN_CHUNK) {
      const chunk = tests.slice(i, i + RUN_CHUNK)
      try {
        const { results } = await adminApi.run({
          languageId: referenceSolution.languageId,
          code: referenceSolution.code,
          inputs: chunk.map((t) => t.input),
          expectedOutputs: chunk.map((t) => t.expectedOutput),
          timeLimit,
          memoryLimit,
        })
        setRuns((r) => ({
          ...r,
          ...Object.fromEntries(chunk.map((t, j) => [t.key, { status: "done", result: results[j] } as RunState])),
        }))
      } catch (e) {
        const message = e instanceof ApiError ? e.message : "Run failed."
        failure = message
        setRuns((r) => ({ ...r, ...Object.fromEntries(chunk.map((t) => [t.key, { status: "error", message } as RunState])) }))
      }
    }
    return failure
  }

  async function runAll() {
    setBusy("runAll")
    setNotice(null)
    const failure = await runTests(problem.testCases)
    if (failure) setNotice({ tone: "error", title: failure })
    setBusy(null)
  }

  /** Copy every successful reference output into the expected-output field. */
  function fillExpectedFromRuns() {
    let filled = 0
    update({
      testCases: problem.testCases.map((t) => {
        const run = runs[t.key]
        if (run?.status === "done" && run.result.ok) {
          filled++
          return { ...t, expectedOutput: (run.result.stdout ?? "").replace(/\n+$/, "") }
        }
        return t
      }),
    })
    setNotice({ tone: "info", title: `Filled expected output for ${filled} test${filled === 1 ? "" : "s"}. Save to keep them.` })
  }

  const doneRuns = problem?.testCases.filter((t) => runs[t.key]?.status === "done") ?? []
  const fillable = doneRuns.filter((t) => {
    const r = runs[t.key]
    return r?.status === "done" && r.result.ok && r.result.matchesExpected !== true
  }).length

  /* ---------- Persistence ---------- */

  function showVerificationError(e: ApiError) {
    const failures = (e.data.failures as VerificationFailure[] | undefined) ?? []
    const issues = (e.data.issues as string[] | undefined) ?? []
    setNotice({
      tone: "error",
      title: issues.length ? "Not ready to publish yet:" : e.message,
      items: issues.length
        ? issues
        : failures.map((f) => `Test ${f.index + 1}: ${f.verdict}${f.compileOutput ? " — see compiler output" : ""}`),
    })
    if (failures.length) setTab("tests")
  }

  async function save(): Promise<AdminProblem | null> {
    setFieldErrors({})
    setNotice(null)
    try {
      const payload = toPayload({ ...problem, tags: problem.tags.map((t) => t.trim()).filter(Boolean) })
      const { problem: saved } = meta ? await adminApi.update(meta.id, payload) : await adminApi.create(payload)
      setMeta(saved)
      setProblem(toEditableKeepingKeys(saved, problem))
      setDirty(false)
      if (isNew) {
        onCreated(saved.id)
        navigate(`/admin/problems/${saved.id}`, { replace: true })
      }
      return saved
    } catch (e) {
      if (e instanceof ApiError) {
        setFieldErrors(e.fields ?? {})
        if (e.status === 422) showVerificationError(e)
        else setNotice({ tone: "error", title: e.message })
        if (e.fields && Object.keys(e.fields).length) setTab("statement")
      } else setNotice({ tone: "error", title: "Could not save." })
      return null
    }
  }

  async function handleSave() {
    setBusy("save")
    const saved = await save()
    setBusy(null)
    if (saved) {
      setNotice({
        tone: "success",
        title: saved.status === "published" ? "Saved. Changes re-verified and live." : "Draft saved.",
      })
    }
  }

  async function handlePublish() {
    setBusy("publish")
    const saved = dirty || isNew ? await save() : meta
    if (!saved) return setBusy(null)
    try {
      const { problem: published, verification } = await adminApi.publish(saved.id)
      setMeta(published)
      setNotice({
        tone: "success",
        title: `Published. Reference solution passed all ${verification.total} tests.`,
      })
    } catch (e) {
      if (e instanceof ApiError) showVerificationError(e)
      else setNotice({ tone: "error", title: "Could not publish." })
    }
    setBusy(null)
  }

  async function handleUnpublish() {
    if (!meta) return
    setBusy("unpublish")
    try {
      const { problem: p } = await adminApi.unpublish(meta.id)
      setMeta(p)
      setNotice({ tone: "info", title: "Unpublished. Developers can no longer see this problem." })
    } catch (e) {
      setNotice({ tone: "error", title: e instanceof ApiError ? e.message : "Could not unpublish." })
    }
    setBusy(null)
  }

  async function handleDelete() {
    if (!meta) return
    setBusy("delete")
    try {
      await adminApi.remove(meta.id)
      setDirty(false)
      navigate("/admin/problems", { replace: true })
    } catch (e) {
      setNotice({ tone: "error", title: e instanceof ApiError ? e.message : "Could not delete." })
      setBusy(null)
      setConfirmDelete(false)
    }
  }

  /* ---------- Render ---------- */

  const published = meta?.status === "published"
  const sampleCount = problem.testCases.filter((t) => t.isSample).length

  return (
    <>
      {/* Action bar */}
      <Box position="sticky" top="0" zIndex="sticky" bg="bg/90" backdropFilter="blur(8px)" borderBottomWidth="1px" borderColor="border.muted">
        <Container maxW="7xl" py="3">
          <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap="3" direction={{ base: "column", md: "row" }}>
            <HStack gap="3" minW="0">
              <Link asChild color="fg.muted" _hover={{ color: "fg" }} aria-label="All problems">
                <RouterLink to="/admin/problems"><ArrowLeft size={18} /></RouterLink>
              </Link>
              <Heading as="h1" fontSize="lg" truncate>
                {problem.title || (isNew ? "New problem" : "Untitled problem")}
              </Heading>
              {published ? (
                <Badge colorPalette="green" variant="subtle">Published</Badge>
              ) : (
                <Badge variant="outline" color="fg.muted">Draft</Badge>
              )}
              {dirty && <Text fontSize="xs" color="yellow.400" whiteSpace="nowrap">Unsaved changes</Text>}
            </HStack>
            <HStack gap="2" wrap="wrap">
              {published && meta && (
                <Button asChild size="sm" variant="ghost" color="fg.muted">
                  <RouterLink to={`/problems/${meta.slug}`} target="_blank"><ExternalLink /> View live</RouterLink>
                </Button>
              )}
              {meta && (
                <Button size="sm" variant="ghost" color="fg.muted" _hover={{ color: "red.400" }} onClick={() => setConfirmDelete(true)} disabled={!!busy}>
                  <Trash2 /> Delete
                </Button>
              )}
              {published && (
                <Button size="sm" variant="outline" color="fg" onClick={handleUnpublish} loading={busy === "unpublish"} disabled={!!busy}>
                  <Undo2 /> Unpublish
                </Button>
              )}
              <Button size="sm" variant={published ? "solid" : "outline"} colorPalette={published ? "brand" : undefined} color={published ? undefined : "fg"} onClick={handleSave} loading={busy === "save"} disabled={!!busy || (!dirty && !isNew)}>
                <Save /> {published ? "Save & re-verify" : "Save draft"}
              </Button>
              {!published && (
                <Button size="sm" colorPalette="brand" fontWeight="600" onClick={handlePublish} loading={busy === "publish"} loadingText="Verifying…" disabled={!!busy}>
                  <Send /> Verify & publish
                </Button>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="7xl" py="6">
        <Stack gap="5">
          {notice && (
            <Alert.Root status={notice.tone} variant="subtle" rounded="lg">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{notice.title}</Alert.Title>
                {notice.items && notice.items.length > 0 && (
                  <Alert.Description>
                    <Stack as="ul" gap="0.5" mt="1" ps="4" listStyleType="disc" fontSize="sm">
                      {notice.items.map((item) => <li key={item}>{item}</li>)}
                    </Stack>
                  </Alert.Description>
                )}
              </Alert.Content>
              <CloseButton size="sm" onClick={() => setNotice(null)} />
            </Alert.Root>
          )}

          <Tabs.Root value={tab} onValueChange={(e) => setTab(e.value)} variant="line" colorPalette="brand">
            <Tabs.List borderColor="border">
              <Tabs.Trigger value="statement">Statement</Tabs.Trigger>
              <Tabs.Trigger value="tests">
                Solution & tests
                <Badge size="sm" variant="subtle" ms="1">{problem.testCases.length}</Badge>
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="statement" pt="6">
              <StatementForm value={problem} onChange={update} errors={fieldErrors} />
            </Tabs.Content>

            <Tabs.Content value="tests" pt="6">
              <Stack gap="6">
                {/* Reference solution */}
                <Box bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" overflow="hidden">
                  <HStack justify="space-between" px="4" py="3" borderBottomWidth="1px" borderColor="border.muted" gap="3" wrap="wrap">
                    <Stack gap="0">
                      <Text fontWeight="600" fontSize="sm">Reference solution</Text>
                      <Text fontSize="xs" color="fg.muted">Generates expected outputs and must pass every test before publishing. Never shown to developers.</Text>
                    </Stack>
                    <NativeSelect.Root size="sm" w="200px">
                      <NativeSelect.Field
                        aria-label="Reference solution language"
                        value={problem.referenceSolution.languageId}
                        onChange={(e) => setLanguage(Number(e.target.value))}
                      >
                        {languages.map((l) => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </HStack>
                  <Box h="380px">
                    <CodeEditor
                      value={problem.referenceSolution.code}
                      onChange={setCode}
                      languageKey={language?.key ?? "python"}
                      ariaLabel="Reference solution"
                    />
                  </Box>
                </Box>

                {/* Test toolbar */}
                <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} gap="3" direction={{ base: "column", md: "row" }}>
                  <Stack gap="0.5">
                    <Heading as="h2" fontSize="md">Test cases</Heading>
                    <Text fontSize="xs" color="fg.muted">
                      {problem.testCases.length} total · {sampleCount} sample · {problem.testCases.length - sampleCount} hidden.
                      Outputs are compared after trimming leading/trailing whitespace.
                    </Text>
                  </Stack>
                  <HStack gap="2" wrap="wrap">
                    <Button size="sm" variant="outline" color="fg" onClick={addTest}>
                      <Plus /> Add test
                    </Button>
                    <Button size="sm" variant="subtle" colorPalette="brand" onClick={fillExpectedFromRuns} disabled={fillable === 0}>
                      <Wand2 /> Use outputs as expected{fillable ? ` (${fillable})` : ""}
                    </Button>
                    <Button size="sm" colorPalette="brand" onClick={runAll} loading={busy === "runAll"} loadingText="Running…" disabled={!!busy || !problem.referenceSolution.code.trim()}>
                      <Play /> Run all tests
                    </Button>
                  </HStack>
                </Flex>

                <Stack gap="4">
                  {problem.testCases.map((t, i) => (
                    <TestCaseCard
                      key={t.key}
                      index={i}
                      test={t}
                      run={runs[t.key]}
                      onChange={(patch) => updateTest(t.key, patch)}
                      onRemove={() => removeTest(t.key)}
                      onRun={() => runTests([t])}
                      canRemove={problem.testCases.length > 1}
                      runDisabled={!!busy || runs[t.key]?.status === "running" || !problem.referenceSolution.code.trim()}
                    />
                  ))}
                </Stack>

                <Button alignSelf="flex-start" size="sm" variant="ghost" color="fg.muted" onClick={addTest}>
                  <Plus /> Add another test
                </Button>
              </Stack>
            </Tabs.Content>
          </Tabs.Root>
        </Stack>
      </Container>

      <Dialog.Root open={confirmDelete} onOpenChange={(e) => setConfirmDelete(e.open)} role="alertdialog">
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content bg="bg.panel">
              <Dialog.Header>
                <Dialog.Title>Delete “{problem.title}”?</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text color="fg.muted" fontSize="sm">
                  This permanently deletes the problem, its test cases, and every developer submission for it. This cannot be undone.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline" size="sm" color="fg">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button colorPalette="red" size="sm" onClick={handleDelete} loading={busy === "delete"}>
                  Delete problem
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

/** Keep client keys stable across saves so run results stay attached to their tests. */
function toEditableKeepingKeys(saved: AdminProblem, previous: EditableProblem): EditableProblem {
  const next = toEditable(saved)
  next.testCases = next.testCases.map((t, i) => ({ ...t, key: previous.testCases[i]?.key ?? t.key }))
  return next
}
