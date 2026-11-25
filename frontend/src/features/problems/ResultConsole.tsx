import { Box, Button, Center, Grid, HStack, Icon, Spinner, Stack, Text } from "@chakra-ui/react"
import { CheckCircle2, EyeOff, XCircle } from "lucide-react"
import { useState } from "react"
import { VerdictLabel } from "../../components/Badges"
import { OutputBlock } from "../../components/OutputBlock"
import type { FailedTest, RunCaseResult, RunResponse, SubmissionSummary } from "../../lib/api"

export type ConsoleState =
  | { kind: "idle" }
  | { kind: "running"; label: string }
  | { kind: "error"; message: string }
  | { kind: "run"; data: RunResponse }
  | { kind: "submit"; submission: SubmissionSummary; failedTest: FailedTest | null }

function Metrics({ time, memory }: { time: number | null; memory: number | null }) {
  if (time == null && memory == null) return null
  return (
    <HStack gap="4" fontSize="xs" color="fg.muted" fontFamily="mono">
      {time != null && <Text>Runtime {time.toFixed(3)}s</Text>}
      {memory != null && <Text>Memory {(memory / 1024).toFixed(1)} MB</Text>}
    </HStack>
  )
}

function CaseDetail({ r, showExpected = true }: { r: RunCaseResult; showExpected?: boolean }) {
  return (
    <Stack gap="3">
      {r.compileOutput && <OutputBlock label="Compiler output" value={r.compileOutput} tone="error" />}
      <OutputBlock label="Input" value={r.input} />
      {!r.compileOutput && (
        <OutputBlock
          label="Your output"
          value={r.stdout}
          tone={r.verdict === "Accepted" ? "success" : r.verdict ? "error" : "default"}
        />
      )}
      {showExpected && r.expectedOutput != null && <OutputBlock label="Expected output" value={r.expectedOutput} />}
      {r.stderr && <OutputBlock label="stderr" value={r.stderr} tone="error" />}
    </Stack>
  )
}

function SampleResults({ data }: { data: Extract<RunResponse, { mode: "samples" }> }) {
  const [selected, setSelected] = useState(() => Math.max(0, data.results.findIndex((r) => r.verdict !== "Accepted")))
  const r = data.results[selected]
  return (
    <Stack gap="4">
      <HStack justify="space-between" wrap="wrap" gap="2">
        <VerdictLabel verdict={data.verdict} size="lg" />
        <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
          {data.passed}/{data.total} sample tests passed
        </Text>
      </HStack>
      <HStack gap="2" wrap="wrap" role="tablist" aria-label="Sample cases">
        {data.results.map((c, i) => {
          const pass = c.verdict === "Accepted"
          return (
            <Button
              key={i}
              size="xs"
              role="tab"
              aria-selected={i === selected}
              variant={i === selected ? "subtle" : "ghost"}
              color={i === selected ? "fg" : "fg.muted"}
              onClick={() => setSelected(i)}
            >
              <Icon as={pass ? CheckCircle2 : XCircle} color={pass ? "green.400" : "red.400"} />
              Case {i + 1}
            </Button>
          )
        })}
      </HStack>
      {r && <CaseDetail r={r} />}
    </Stack>
  )
}

function CustomResult({ data }: { data: Extract<RunResponse, { mode: "custom" }> }) {
  const r = data.results[0]
  return (
    <Stack gap="4">
      <HStack justify="space-between" wrap="wrap" gap="2">
        {r.verdict ? (
          <VerdictLabel verdict={r.verdict} size="lg" />
        ) : (
          <Text fontWeight="600">Finished · {r.status}</Text>
        )}
        <Metrics time={r.time} memory={r.memory} />
      </HStack>
      {data.referenceFailed && (
        <Text fontSize="xs" color="yellow.400">
          The reference solution couldn't produce an expected output for this input. Check that it satisfies the problem's input format and constraints.
        </Text>
      )}
      <CaseDetail r={r} />
    </Stack>
  )
}

function SubmitResult({ submission, failedTest }: { submission: SubmissionSummary; failedTest: FailedTest | null }) {
  const accepted = submission.verdict === "Accepted"
  return (
    <Stack gap="4">
      <Stack gap="1.5">
        <HStack justify="space-between" wrap="wrap" gap="2">
          <VerdictLabel verdict={submission.verdict} size="lg" />
          <Text fontSize="sm" color="fg.muted" fontVariantNumeric="tabular-nums">
            {submission.passed}/{submission.total} tests passed
          </Text>
        </HStack>
        {accepted ? (
          <Text fontSize="sm" color="fg.muted">Solution accepted.</Text>
        ) : (
          <Text fontSize="sm" color="fg.muted">Some test cases did not pass.</Text>
        )}
        <Metrics time={submission.time} memory={submission.memory} />
      </Stack>

      {failedTest && (
        <Stack gap="3" borderTopWidth="1px" borderColor="border.muted" pt="4">
          <Text fontSize="sm" fontWeight="600">
            First failure: test {failedTest.number} · {failedTest.verdict}
          </Text>
          {failedTest.compileOutput && <OutputBlock label="Compiler output" value={failedTest.compileOutput} tone="error" />}
          {failedTest.isSample ? (
            <CaseDetail
              r={{
                input: failedTest.input ?? "",
                expectedOutput: failedTest.expectedOutput ?? null,
                stdout: failedTest.stdout ?? null,
                stderr: failedTest.stderr ?? null,
                compileOutput: null,
                verdict: failedTest.verdict,
                status: failedTest.verdict,
                time: null,
                memory: null,
              }}
            />
          ) : (
            !failedTest.compileOutput && (
              <HStack gap="2" color="fg.muted" fontSize="sm">
                <Icon as={EyeOff} boxSize="4" />
                <Text>This is a hidden test, so its input and output aren't shown.</Text>
              </HStack>
            )
          )}
        </Stack>
      )}
    </Stack>
  )
}

export function ResultConsole({ state }: { state: ConsoleState }) {
  return (
    <Box p="4" aria-live="polite">
      {state.kind === "idle" && (
        <Center py="8" color="fg.muted" fontSize="sm" textAlign="center">
          Run tests to check your code against the examples, or submit to judge it against every test.
        </Center>
      )}
      {state.kind === "running" && (
        <HStack py="8" justify="center" color="fg.muted" fontSize="sm" gap="3">
          <Spinner size="sm" color="brand.500" /> <Text>{state.label}</Text>
        </HStack>
      )}
      {state.kind === "error" && (
        <Grid py="6" placeItems="center">
          <Text color="red.300" fontSize="sm">{state.message}</Text>
        </Grid>
      )}
      {state.kind === "run" &&
        (state.data.mode === "samples" ? <SampleResults data={state.data} /> : <CustomResult data={state.data} />)}
      {state.kind === "submit" && <SubmitResult submission={state.submission} failedTest={state.failedTest} />}
    </Box>
  )
}
