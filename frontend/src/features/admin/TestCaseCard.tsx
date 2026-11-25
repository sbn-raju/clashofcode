import { Badge, Box, Button, Checkbox, Field, Grid, HStack, IconButton, Spinner, Stack, Text, Textarea } from "@chakra-ui/react"
import { ArrowDownToLine, Play, Trash2 } from "lucide-react"
import { OutputBlock } from "../../components/OutputBlock"
import type { EditableTestCase, RunState } from "./types"

type Props = {
  index: number
  test: EditableTestCase
  run?: RunState
  onChange: (patch: Partial<EditableTestCase>) => void
  onRemove: () => void
  onRun: () => void
  canRemove: boolean
  runDisabled: boolean
}

const mono = { fontFamily: "mono", fontSize: "xs", lineHeight: "1.6" } as const

function RunStatus({ run }: { run?: RunState }) {
  if (!run) return null
  if (run.status === "running")
    return (
      <HStack gap="1.5" color="fg.muted" fontSize="xs">
        <Spinner size="xs" /> Running…
      </HStack>
    )
  if (run.status === "error") return <Badge colorPalette="red" variant="subtle">Error</Badge>
  const r = run.result
  if (!r.ok) return <Badge colorPalette="red" variant="subtle">{r.status}</Badge>
  if (r.matchesExpected === true) return <Badge colorPalette="green" variant="subtle">Matches expected</Badge>
  if (r.matchesExpected === false) return <Badge colorPalette="yellow" variant="subtle">Differs from expected</Badge>
  return <Badge colorPalette="blue" variant="subtle">Ran · no expected yet</Badge>
}

export function TestCaseCard({ index, test, run, onChange, onRemove, onRun, canRemove, runDisabled }: Props) {
  const result = run?.status === "done" ? run.result : null

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor={test.isSample ? "brand.500/40" : "border"}
      rounded="xl"
      overflow="hidden"
    >
      <HStack justify="space-between" px="4" py="2.5" borderBottomWidth="1px" borderColor="border.muted" bg="bg.subtle" gap="3" wrap="wrap">
        <HStack gap="3">
          <Text fontWeight="600" fontSize="sm" fontVariantNumeric="tabular-nums">
            Test {index + 1}
          </Text>
          <Checkbox.Root
            size="sm"
            colorPalette="brand"
            checked={test.isSample}
            onCheckedChange={(e) => onChange({ isSample: !!e.checked })}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
            <Checkbox.Label fontSize="xs" color="fg.muted">
              Sample (visible to developers)
            </Checkbox.Label>
          </Checkbox.Root>
        </HStack>
        <HStack gap="2">
          <RunStatus run={run} />
          <Button size="xs" variant="outline" color="fg" onClick={onRun} disabled={runDisabled}>
            <Play /> Run
          </Button>
          <IconButton
            size="xs"
            variant="ghost"
            color="fg.muted"
            _hover={{ color: "red.400" }}
            aria-label={`Delete test ${index + 1}`}
            onClick={onRemove}
            disabled={!canRemove}
          >
            <Trash2 />
          </IconButton>
        </HStack>
      </HStack>

      <Stack gap="4" p="4">
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="4">
          <Field.Root>
            <Field.Label fontSize="xs" color="fg.muted">Input (stdin)</Field.Label>
            <Textarea {...mono} minH="96px" autoresize maxH="320px" value={test.input} onChange={(e) => onChange({ input: e.target.value })} spellCheck={false} />
          </Field.Root>
          <Field.Root invalid={!test.expectedOutput.trim() && result?.ok === true}>
            <Field.Label fontSize="xs" color="fg.muted">Expected output</Field.Label>
            <Textarea
              {...mono}
              minH="96px"
              autoresize
              maxH="320px"
              value={test.expectedOutput}
              onChange={(e) => onChange({ expectedOutput: e.target.value })}
              placeholder="Run the reference solution to fill this in"
              spellCheck={false}
            />
          </Field.Root>
        </Grid>

        {test.isSample && (
          <Field.Root>
            <Field.Label fontSize="xs" color="fg.muted">Explanation (optional, shown with the sample)</Field.Label>
            <Textarea fontSize="sm" autoresize minH="48px" value={test.explanation} onChange={(e) => onChange({ explanation: e.target.value })} />
          </Field.Root>
        )}

        {run?.status === "error" && (
          <Text fontSize="sm" color="red.300">
            {run.message}
          </Text>
        )}

        {result && (
          <Stack gap="3" borderTopWidth="1px" borderColor="border.muted" pt="4">
            <HStack justify="space-between" wrap="wrap" gap="2">
              <HStack gap="3" fontSize="xs" color="fg.muted" fontFamily="mono">
                <Text>Reference output · {result.status}</Text>
                {result.time != null && <Text>{result.time.toFixed(3)}s</Text>}
                {result.memory != null && <Text>{Math.round(result.memory / 1024)} MB</Text>}
              </HStack>
              {result.ok && result.matchesExpected !== true && (
                <Button size="xs" variant="subtle" colorPalette="brand" onClick={() => onChange({ expectedOutput: (result.stdout ?? "").replace(/\n+$/, "") })}>
                  <ArrowDownToLine /> Use as expected
                </Button>
              )}
            </HStack>
            {result.compileOutput && <OutputBlock label="Compiler output" value={result.compileOutput} tone="error" />}
            {result.ok && (
              <OutputBlock
                label="stdout"
                value={result.stdout}
                tone={result.matchesExpected === true ? "success" : result.matchesExpected === false ? "error" : "default"}
              />
            )}
            {result.stderr && <OutputBlock label="stderr" value={result.stderr} tone="error" />}
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
