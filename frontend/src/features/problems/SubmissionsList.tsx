import { Button, Center, HStack, Spinner, Stack, Text } from "@chakra-ui/react"
import { VerdictLabel } from "../../components/Badges"
import type { SubmissionSummary } from "../../lib/api"

const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })

type Props = {
  submissions: SubmissionSummary[] | null
  onLoadCode: (s: SubmissionSummary) => void
}

export function SubmissionsList({ submissions, onLoadCode }: Props) {
  if (!submissions)
    return (
      <Center py="10">
        <Spinner size="sm" color="brand.500" />
      </Center>
    )
  if (submissions.length === 0)
    return (
      <Center py="10" color="fg.muted" fontSize="sm">
        Your submissions will appear here.
      </Center>
    )

  return (
    <Stack gap="0" as="ul" listStyleType="none">
      {submissions.map((s) => (
        <HStack
          as="li"
          key={s.id}
          justify="space-between"
          px={{ base: "4", md: "5" }}
          py="3"
          borderBottomWidth="1px"
          borderColor="border.muted"
          gap="3"
        >
          <Stack gap="0.5" minW="0">
            <VerdictLabel verdict={s.verdict} />
            <Text fontSize="xs" color="fg.muted">
              {fmt.format(new Date(s.createdAt))} · {s.language}
            </Text>
          </Stack>
          <HStack gap="4">
            <Stack gap="0" align="flex-end" fontFamily="mono" fontSize="xs" color="fg.muted" fontVariantNumeric="tabular-nums">
              <Text>{s.passed}/{s.total} tests</Text>
              {s.time != null && <Text>{s.time.toFixed(3)}s</Text>}
            </Stack>
            <Button size="xs" variant="outline" color="fg" onClick={() => onLoadCode(s)}>
              Load code
            </Button>
          </HStack>
        </HStack>
      ))}
    </Stack>
  )
}
