import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  HStack,
  Link,
  NativeSelect,
  Spinner,
  Stack,
  Tabs,
  Text,
  Textarea,
  useBreakpointValue,
} from "@chakra-ui/react"
import { ArrowLeft, Play, RotateCcw, Send } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Group, Panel, Separator } from "react-resizable-panels"
import { Link as RouterLink, useParams } from "react-router-dom"
import { AppHeader } from "../components/AppHeader"
import { CodeEditor } from "../components/CodeEditor"
import { FormAlert } from "../components/FormAlert"
import { ProblemStatement } from "../features/problems/ProblemStatement"
import { ResultConsole, type ConsoleState } from "../features/problems/ResultConsole"
import { SubmissionsList } from "../features/problems/SubmissionsList"
import { useLanguages } from "../features/problems/useLanguages"
import { ApiError, problemsApi, type ProblemDetail, type SubmissionSummary } from "../lib/api"

const LANG_KEY = "coc:lang"
const draftKey = (slug: string, languageId: number) => `coc:draft:${slug}:${languageId}`

// localStorage can throw (private mode, blocked storage); drafts are best-effort.
const storage = {
  get(key: string) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
  },
}

function ResizeHandle({ direction }: { direction: "horizontal" | "vertical" }) {
  const horizontal = direction === "horizontal"
  return (
    <Box
      asChild
      flexShrink={0}
      w={horizontal ? "6px" : "full"}
      h={horizontal ? "full" : "6px"}
      bg="bg"
      position="relative"
      transition="background 0.12s"
      _hover={{ bg: "brand.500/40" }}
      css={{ "&[data-separator=active], &:focus-visible": { background: "var(--chakra-colors-brand-500)", outline: "none" } }}
    >
      <Separator aria-label={horizontal ? "Resize problem and editor" : "Resize editor and results"} />
    </Box>
  )
}

function PanelFrame({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" h="full" bg="bg.panel" borderWidth="1px" borderColor="border.muted" rounded="lg" overflow="hidden">
      {children}
    </Flex>
  )
}

export default function ProblemWorkspacePage() {
  const { slug = "" } = useParams()
  const { languages } = useLanguages()
  const isDesktop = useBreakpointValue({ base: false, lg: true }, { ssr: false })

  const [problem, setProblem] = useState<ProblemDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [languageId, setLanguageId] = useState<number>(() => Number(storage.get(LANG_KEY)) || 71)
  const [code, setCode] = useState("")
  const [draftSaved, setDraftSaved] = useState<boolean | null>(null)
  const [consoleState, setConsoleState] = useState<ConsoleState>({ kind: "idle" })
  const [consoleSeq, setConsoleSeq] = useState(0)
  const [customInput, setCustomInput] = useState("")
  const [busy, setBusy] = useState<null | "run" | "custom" | "submit">(null)
  const [submissions, setSubmissions] = useState<SubmissionSummary[] | null>(null)
  const [leftTab, setLeftTab] = useState("description")
  const [consoleTab, setConsoleTab] = useState("result")
  const [mobileTab, setMobileTab] = useState("problem")
  const loadedFor = useRef<string | null>(null)

  const language = useMemo(() => languages.find((l) => l.id === languageId), [languages, languageId])

  useEffect(() => {
    problemsApi
      .get(slug)
      .then(({ problem }) => {
        setProblem(problem)
        setCustomInput(problem.samples[0]?.input ?? "")
      })
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : "Could not load problem."))
    problemsApi
      .submissions(slug)
      .then(({ submissions }) => setSubmissions(submissions))
      .catch(() => setSubmissions([]))
  }, [slug])

  // Load the saved draft (or the starter template) when the language changes.
  useEffect(() => {
    if (!language) return
    const key = draftKey(slug, language.id)
    if (loadedFor.current === key) return
    loadedFor.current = key
    const draft = storage.get(key)
    setCode(draft ?? language.template)
    setDraftSaved(draft != null ? true : null)
  }, [language, slug])

  const handleCodeChange = useCallback(
    (value: string) => {
      setCode(value)
      setDraftSaved(storage.set(draftKey(slug, languageId), value))
    },
    [slug, languageId],
  )

  function changeLanguage(id: number) {
    setLanguageId(id)
    storage.set(LANG_KEY, String(id))
  }

  function resetCode() {
    if (!language) return
    storage.remove(draftKey(slug, language.id))
    setCode(language.template)
    setDraftSaved(null)
  }

  function show(state: ConsoleState) {
    setConsoleState(state)
    setConsoleSeq((n) => n + 1)
    setConsoleTab("result")
    if (!isDesktop) setMobileTab("result")
  }

  async function run(custom: boolean) {
    setBusy(custom ? "custom" : "run")
    show({ kind: "running", label: custom ? "Running with your input…" : "Running against the examples…" })
    try {
      const data = await problemsApi.run(slug, { languageId, code, ...(custom && { customInput }) })
      show({ kind: "run", data })
    } catch (e) {
      show({ kind: "error", message: e instanceof ApiError ? e.message : "Connection interrupted." })
    }
    setBusy(null)
  }

  async function submit() {
    setBusy("submit")
    show({ kind: "running", label: "Judging your solution against all tests…" })
    try {
      const { submission, failedTest } = await problemsApi.submit(slug, { languageId, code })
      show({ kind: "submit", submission, failedTest })
      setSubmissions((s) => [submission, ...(s ?? [])])
      if (submission.verdict === "Accepted") setProblem((p) => (p ? { ...p, solved: true } : p))
    } catch (e) {
      show({ kind: "error", message: e instanceof ApiError ? e.message : "Connection interrupted." })
    }
    setBusy(null)
  }

  function loadSubmission(s: SubmissionSummary) {
    changeLanguage(s.languageId)
    loadedFor.current = draftKey(slug, s.languageId)
    setCode(s.code)
    setDraftSaved(storage.set(draftKey(slug, s.languageId), s.code))
    if (!isDesktop) setMobileTab("code")
  }

  // Ctrl/Cmd+Enter runs, Ctrl/Cmd+Shift+Enter submits.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key !== "Enter" || busy || !code.trim()) return
      e.preventDefault()
      if (e.shiftKey) submit()
      else run(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  if (loadError)
    return (
      <Flex direction="column" minH="100dvh">
        <AppHeader area="developer" />
        <Stack maxW="lg" mx="auto" py="16" px="4" gap="4">
          <FormAlert message={loadError} />
          <Button asChild variant="outline" color="fg" alignSelf="flex-start">
            <RouterLink to="/problems">Back to problems</RouterLink>
          </Button>
        </Stack>
      </Flex>
    )

  if (!problem || !languages.length)
    return (
      <Flex direction="column" minH="100dvh">
        <AppHeader area="developer" />
        <Center flex="1"><Spinner color="brand.500" /></Center>
      </Flex>
    )

  const disabled = !!busy || !code.trim()

  /* ---------- Pieces ---------- */

  const toolbar = (
    <HStack justify="space-between" px="3" py="2" gap="2" borderBottomWidth="1px" borderColor="border.muted" flexShrink={0} wrap="wrap">
      <HStack gap="2">
        <NativeSelect.Root size="xs" w="44">
          <NativeSelect.Field aria-label="Language" value={languageId} onChange={(e) => changeLanguage(Number(e.target.value))}>
            {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Button size="xs" variant="ghost" color="fg.muted" onClick={resetCode} aria-label="Reset to starter code" title="Reset to starter code">
          <RotateCcw />
        </Button>
        <Text fontSize="xs" color="fg.subtle" display={{ base: "none", md: "block" }}>
          {draftSaved === true ? "Draft saved in this browser" : draftSaved === false ? "Draft not saved (storage unavailable)" : ""}
        </Text>
      </HStack>
      <HStack gap="2">
        <Button size="xs" variant="outline" color="fg" onClick={() => run(false)} loading={busy === "run"} disabled={disabled} title="Run tests (Ctrl/⌘ + Enter)">
          <Play /> Run tests
        </Button>
        <Button size="xs" colorPalette="brand" fontWeight="600" onClick={submit} loading={busy === "submit"} disabled={disabled} title="Submit solution (Ctrl/⌘ + Shift + Enter)">
          <Send /> Submit solution
        </Button>
      </HStack>
    </HStack>
  )

  const editor = (
    <Box flex="1" minH="0" overflow="hidden">
      <CodeEditor value={code} onChange={handleCodeChange} languageKey={language?.key ?? "python"} ariaLabel={`${problem.title} solution`} />
    </Box>
  )

  const consolePanel = (
    <Tabs.Root value={consoleTab} onValueChange={(e) => setConsoleTab(e.value)} size="sm" variant="line" colorPalette="brand" display="flex" flexDirection="column" h="full">
      <Tabs.List borderColor="border.muted" px="2" flexShrink={0}>
        <Tabs.Trigger value="result">Result</Tabs.Trigger>
        <Tabs.Trigger value="custom">Custom input</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="result" p="0" flex="1" overflow="auto">
        <ResultConsole key={consoleSeq} state={consoleState} />
      </Tabs.Content>
      <Tabs.Content value="custom" p="4" flex="1" overflow="auto">
        <Stack gap="3">
          <Textarea
            fontFamily="mono"
            fontSize="xs"
            minH="120px"
            autoresize
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            aria-label="Custom input"
            spellCheck={false}
          />
          <HStack justify="space-between" gap="3" wrap="wrap">
            <Text fontSize="xs" color="fg.muted">The expected output is generated by the reference solution.</Text>
            <Button size="xs" variant="outline" color="fg" onClick={() => run(true)} loading={busy === "custom"} disabled={disabled}>
              <Play /> Run with this input
            </Button>
          </HStack>
        </Stack>
      </Tabs.Content>
    </Tabs.Root>
  )

  const leftPanel = (
    <Tabs.Root value={leftTab} onValueChange={(e) => setLeftTab(e.value)} size="sm" variant="line" colorPalette="brand" display="flex" flexDirection="column" h="full">
      <Tabs.List borderColor="border.muted" px="2" flexShrink={0}>
        <Tabs.Trigger value="description">Description</Tabs.Trigger>
        <Tabs.Trigger value="submissions">Submissions{submissions?.length ? ` (${submissions.length})` : ""}</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="description" p="0" flex="1" overflow="auto">
        <ProblemStatement problem={problem} />
      </Tabs.Content>
      <Tabs.Content value="submissions" p="0" flex="1" overflow="auto">
        <SubmissionsList submissions={submissions} onLoadCode={loadSubmission} />
      </Tabs.Content>
    </Tabs.Root>
  )

  const titleBar = (
    <HStack px={{ base: "3", lg: "4" }} py="2" gap="3" flexShrink={0}>
      <Link asChild color="fg.muted" _hover={{ color: "fg" }} aria-label="All problems">
        <RouterLink to="/problems"><ArrowLeft size={18} /></RouterLink>
      </Link>
      <Heading as="p" fontSize="sm" fontWeight="600" truncate>{problem.title}</Heading>
    </HStack>
  )

  return (
    <Flex direction="column" h="100dvh" overflow="hidden">
      <AppHeader area="developer" maxW="full" />
      {titleBar}

      {isDesktop ? (
        <Box flex="1" minH="0" px="2" pb="2">
          <Group orientation="horizontal" style={{ height: "100%" }}>
            <Panel defaultSize="42" minSize="25">
              <PanelFrame>{leftPanel}</PanelFrame>
            </Panel>
            <ResizeHandle direction="horizontal" />
            <Panel defaultSize="58" minSize="30">
              <Group orientation="vertical" style={{ height: "100%" }}>
                <Panel defaultSize="62" minSize="20">
                  <PanelFrame>
                    {toolbar}
                    {editor}
                  </PanelFrame>
                </Panel>
                <ResizeHandle direction="vertical" />
                <Panel defaultSize="38" minSize="12">
                  <PanelFrame>{consolePanel}</PanelFrame>
                </Panel>
              </Group>
            </Panel>
          </Group>
        </Box>
      ) : (
        <Tabs.Root value={mobileTab} onValueChange={(e) => setMobileTab(e.value)} size="sm" variant="enclosed" colorPalette="brand" display="flex" flexDirection="column" flex="1" minH="0" px="2" pb="2">
          <Tabs.List flexShrink={0} w="full">
            <Tabs.Trigger value="problem" flex="1">Problem</Tabs.Trigger>
            <Tabs.Trigger value="code" flex="1">Code</Tabs.Trigger>
            <Tabs.Trigger value="result" flex="1">Result</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="problem" flex="1" minH="0" pt="2">
            <PanelFrame>{leftPanel}</PanelFrame>
          </Tabs.Content>
          <Tabs.Content value="code" flex="1" minH="0" pt="2">
            <PanelFrame>
              {toolbar}
              {editor}
            </PanelFrame>
          </Tabs.Content>
          <Tabs.Content value="result" flex="1" minH="0" pt="2">
            <PanelFrame>{consolePanel}</PanelFrame>
          </Tabs.Content>
        </Tabs.Root>
      )}
    </Flex>
  )
}
