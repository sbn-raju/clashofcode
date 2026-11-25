import { Box, Field, Grid, Heading, Input, NativeSelect, Stack, Text, Textarea } from "@chakra-ui/react"
import { DifficultyBadge } from "../../components/Badges"
import { Markdown } from "../../components/Markdown"
import { DIFFICULTIES, type Difficulty, type FieldErrors } from "../../lib/api"
import type { EditableProblem } from "./types"

type Props = {
  value: EditableProblem
  onChange: (patch: Partial<EditableProblem>) => void
  errors: FieldErrors
}

const mono = { fontFamily: "mono", fontSize: "sm" } as const

export function StatementForm({ value, onChange, errors }: Props) {
  return (
    <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) minmax(0, 1fr)" }} gap="8" alignItems="start">
      <Stack gap="5">
        <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap="4">
          <Field.Root required invalid={!!errors.title}>
            <Field.Label>Title</Field.Label>
            <Input value={value.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="Sliding window maximum" />
            <Field.ErrorText>{errors.title}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.slug}>
            <Field.Label>Slug</Field.Label>
            <Input
              {...mono}
              value={value.slug}
              onChange={(e) => onChange({ slug: e.target.value })}
              placeholder="auto from title"
            />
            <Field.ErrorText>{errors.slug}</Field.ErrorText>
          </Field.Root>
        </Grid>

        <Grid templateColumns={{ base: "1fr 1fr", md: "1fr 2fr 1fr 1fr" }} gap="4">
          <Field.Root>
            <Field.Label>Difficulty</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field
                value={value.difficulty}
                onChange={(e) => onChange({ difficulty: e.target.value as Difficulty })}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          <Field.Root gridColumn={{ base: "span 2", md: "auto" }}>
            <Field.Label>Tags</Field.Label>
            <Input
              value={value.tags.join(", ")}
              onChange={(e) => onChange({ tags: e.target.value.split(",").map((t) => t.trimStart()) })}
              onBlur={() => onChange({ tags: value.tags.map((t) => t.trim()).filter(Boolean) })}
              placeholder="graphs, bfs"
            />
          </Field.Root>
          <Field.Root invalid={!!errors.timeLimit}>
            <Field.Label>Time limit (s)</Field.Label>
            <Input
              type="number"
              step="0.5"
              min={0.5}
              max={15}
              value={value.timeLimit}
              onChange={(e) => onChange({ timeLimit: Number(e.target.value) })}
            />
            <Field.ErrorText>{errors.timeLimit}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.memoryLimit}>
            <Field.Label>Memory (MB)</Field.Label>
            <Input
              type="number"
              step="32"
              min={32}
              max={500}
              value={value.memoryLimit}
              onChange={(e) => onChange({ memoryLimit: Number(e.target.value) })}
            />
            <Field.ErrorText>{errors.memoryLimit}</Field.ErrorText>
          </Field.Root>
        </Grid>

        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Textarea
            {...mono}
            minH="260px"
            autoresize
            value={value.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder={"Given an array of n integers and a window size k, print the maximum of every window.\n\nMarkdown is supported: **bold**, `code`, lists, tables."}
          />
          <Field.HelperText color="fg.subtle">Markdown supported. Preview on the right.</Field.HelperText>
        </Field.Root>

        <Field.Root>
          <Field.Label>Input format</Field.Label>
          <Textarea {...mono} autoresize minH="80px" value={value.inputFormat} onChange={(e) => onChange({ inputFormat: e.target.value })} placeholder="The first line contains n and k. The second line contains n integers." />
        </Field.Root>
        <Field.Root>
          <Field.Label>Output format</Field.Label>
          <Textarea {...mono} autoresize minH="64px" value={value.outputFormat} onChange={(e) => onChange({ outputFormat: e.target.value })} placeholder="Print n − k + 1 integers separated by spaces." />
        </Field.Root>
        <Field.Root>
          <Field.Label>Constraints</Field.Label>
          <Textarea {...mono} autoresize minH="64px" value={value.constraints} onChange={(e) => onChange({ constraints: e.target.value })} placeholder={"- 1 ≤ k ≤ n ≤ 10^5\n- -10^9 ≤ a_i ≤ 10^9"} />
        </Field.Root>
      </Stack>

      {/* Live preview of what developers will see */}
      <Box position={{ xl: "sticky" }} top="4" bg="bg.panel" borderWidth="1px" borderColor="border" rounded="xl" p="6">
        <Text fontSize="xs" color="fg.subtle" textTransform="uppercase" letterSpacing="0.1em" mb="4">
          Developer preview
        </Text>
        <Stack gap="4">
          <Stack gap="2">
            <Heading as="h2" fontSize="xl" fontWeight="600">
              {value.title || <Text as="span" color="fg.subtle">Untitled problem</Text>}
            </Heading>
            <Box alignSelf="flex-start">
              <DifficultyBadge difficulty={value.difficulty} />
            </Box>
          </Stack>
          {value.description ? (
            <Markdown>{value.description}</Markdown>
          ) : (
            <Text color="fg.subtle" fontSize="sm">The description will appear here.</Text>
          )}
          {value.inputFormat && (
            <Stack gap="1">
              <Heading as="h3" fontSize="sm">Input</Heading>
              <Markdown>{value.inputFormat}</Markdown>
            </Stack>
          )}
          {value.outputFormat && (
            <Stack gap="1">
              <Heading as="h3" fontSize="sm">Output</Heading>
              <Markdown>{value.outputFormat}</Markdown>
            </Stack>
          )}
          {value.constraints && (
            <Stack gap="1">
              <Heading as="h3" fontSize="sm">Constraints</Heading>
              <Markdown>{value.constraints}</Markdown>
            </Stack>
          )}
        </Stack>
      </Box>
    </Grid>
  )
}
