import { Badge, Grid, Heading, HStack, Icon, Stack, Tag, Text } from "@chakra-ui/react"
import { CheckCircle2 } from "lucide-react"
import { DifficultyBadge } from "../../components/Badges"
import { Markdown } from "../../components/Markdown"
import { OutputBlock } from "../../components/OutputBlock"
import type { ProblemDetail } from "../../lib/api"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap="2">
      <Heading as="h2" fontSize="sm" fontWeight="600" fontFamily="body">
        {title}
      </Heading>
      {children}
    </Stack>
  )
}

export function ProblemStatement({ problem }: { problem: ProblemDetail }) {
  return (
    <Stack gap="6" p={{ base: "4", md: "5" }}>
      <Stack gap="3">
        <Heading as="h1" fontSize="xl" letterSpacing="-0.01em">
          {problem.title}
        </Heading>
        <HStack gap="2" wrap="wrap">
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.solved && (
            <Badge colorPalette="green" variant="subtle" size="sm">
              <Icon as={CheckCircle2} boxSize="3" /> Solved
            </Badge>
          )}
          {problem.tags.map((t) => (
            <Tag.Root key={t} size="sm" variant="outline" color="fg.muted">
              <Tag.Label>{t}</Tag.Label>
            </Tag.Root>
          ))}
        </HStack>
        <HStack gap="4" fontSize="xs" color="fg.muted" fontFamily="mono">
          <Text>Time: {problem.timeLimit}s</Text>
          <Text>Memory: {problem.memoryLimit} MB</Text>
        </HStack>
      </Stack>

      <Markdown>{problem.description}</Markdown>

      {problem.inputFormat && (
        <Section title="Input">
          <Markdown>{problem.inputFormat}</Markdown>
        </Section>
      )}
      {problem.outputFormat && (
        <Section title="Output">
          <Markdown>{problem.outputFormat}</Markdown>
        </Section>
      )}

      {problem.samples.map((s, i) => (
        <Section key={i} title={`Example ${i + 1}`}>
          <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3">
            <OutputBlock label="Input" value={s.input} />
            <OutputBlock label="Output" value={s.expectedOutput} />
          </Grid>
          {s.explanation && (
            <Text fontSize="sm" color="fg.muted">
              <Text as="span" fontWeight="600" color="fg">Explanation: </Text>
              {s.explanation}
            </Text>
          )}
        </Section>
      ))}

      {problem.constraints && (
        <Section title="Constraints">
          <Markdown>{problem.constraints}</Markdown>
        </Section>
      )}

      <Text fontSize="xs" color="fg.subtle">
        Submissions are judged against {problem.samples.length + problem.hiddenTestCount} tests
        ({problem.hiddenTestCount} hidden). Output is compared after trimming leading and trailing whitespace.
      </Text>
    </Stack>
  )
}
