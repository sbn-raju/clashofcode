import {
  Box,
  Center,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  NativeSelect,
  Spinner,
  Stack,
  Table,
  Tag,
  Text,
} from "@chakra-ui/react"
import { CheckCircle2, CircleDashed, Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { AppHeader } from "../components/AppHeader"
import { DifficultyBadge } from "../components/Badges"
import { FormAlert } from "../components/FormAlert"
import { useAuth } from "../features/auth/useAuth"
import { ApiError, DIFFICULTIES, problemsApi, type ProblemListItem } from "../lib/api"

function StatusIcon({ status }: { status: ProblemListItem["status"] }) {
  if (status === "solved")
    return <Icon as={CheckCircle2} boxSize="4" color="green.400" aria-label="Solved" />
  if (status === "attempted")
    return <Icon as={CircleDashed} boxSize="4" color="yellow.400" aria-label="Attempted" />
  return <Box boxSize="4" aria-label="Not attempted" />
}

export default function ProblemsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [problems, setProblems] = useState<ProblemListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    problemsApi
      .list()
      .then(({ problems }) => setProblems(problems))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load problems."))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (problems ?? []).filter(
      (p) =>
        (!q || p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q))) &&
        (!difficulty || p.difficulty === difficulty) &&
        (!status || p.status === status),
    )
  }, [problems, query, difficulty, status])

  const solved = problems?.filter((p) => p.status === "solved").length ?? 0

  return (
    <Flex direction="column" minH="100dvh">
      <AppHeader area="developer" />
      <Container as="main" maxW="7xl" py={{ base: "8", md: "10" }} flex="1">
        <Stack gap="6">
          <Flex justify="space-between" align={{ base: "flex-start", md: "flex-end" }} gap="4" direction={{ base: "column", md: "row" }}>
            <Stack gap="1">
              <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
                Problems
              </Heading>
              <Text color="fg.muted">
                {user ? `Welcome back, ${user.name.split(" ")[0]}. ` : ""}
                {problems && problems.length > 0 && (
                  <Text as="span" fontVariantNumeric="tabular-nums">
                    {solved} of {problems.length} solved.
                  </Text>
                )}
              </Text>
            </Stack>

            <HStack gap="2" w={{ base: "full", md: "auto" }} wrap={{ base: "wrap", sm: "nowrap" }}>
              <InputGroup startElement={<Search size={16} />} w={{ base: "full", sm: "64" }}>
                <Input size="sm" placeholder="Search title or tag" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search problems" />
              </InputGroup>
              <NativeSelect.Root size="sm" w="36">
                <NativeSelect.Field aria-label="Difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="">All levels</option>
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <NativeSelect.Root size="sm" w="36">
                <NativeSelect.Field aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">Any status</option>
                  <option value="todo">Not attempted</option>
                  <option value="attempted">Attempted</option>
                  <option value="solved">Solved</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </HStack>
          </Flex>

          <FormAlert message={error} />

          {!problems && !error && (
            <Center py="20"><Spinner color="brand.500" /></Center>
          )}

          {problems && problems.length === 0 && (
            <Stack align="center" textAlign="center" gap="2" py="16" rounded="xl" borderWidth="1px" borderStyle="dashed" borderColor="border.emphasized" bg="bg.panel">
              <Heading as="h2" fontSize="lg" fontWeight="600">No problems published yet</Heading>
              <Text color="fg.muted" fontSize="sm">New problems will appear here as soon as they're published.</Text>
            </Stack>
          )}

          {problems && problems.length > 0 && (
            <Box borderWidth="1px" borderColor="border" rounded="xl" overflow="hidden" bg="bg.panel">
              <Table.ScrollArea>
                <Table.Root size="sm" interactive>
                  <Table.Header>
                    <Table.Row bg="bg.muted">
                      <Table.ColumnHeader w="10" py="3"><Text srOnly>Status</Text></Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted">Title</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted">Difficulty</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" display={{ base: "none", md: "table-cell" }}>Tags</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" textAlign="end" display={{ base: "none", sm: "table-cell" }}>Acceptance</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {filtered.map((p) => (
                      <Table.Row key={p.id} bg="bg.panel" cursor="pointer" _hover={{ bg: "bg.muted" }} onClick={() => navigate(`/problems/${p.slug}`)}>
                        <Table.Cell py="3"><StatusIcon status={p.status} /></Table.Cell>
                        <Table.Cell>
                          <RouterLink to={`/problems/${p.slug}`} onClick={(e) => e.stopPropagation()}>
                            <Text fontWeight="500" _hover={{ color: "brand.400" }}>
                              <Text as="span" color="fg.subtle" fontVariantNumeric="tabular-nums" me="2">{p.number}.</Text>
                              {p.title}
                            </Text>
                          </RouterLink>
                        </Table.Cell>
                        <Table.Cell><DifficultyBadge difficulty={p.difficulty} /></Table.Cell>
                        <Table.Cell display={{ base: "none", md: "table-cell" }}>
                          <HStack gap="1.5" wrap="wrap">
                            {p.tags.slice(0, 3).map((t) => (
                              <Tag.Root key={t} size="sm" variant="outline" color="fg.muted"><Tag.Label>{t}</Tag.Label></Tag.Root>
                            ))}
                          </HStack>
                        </Table.Cell>
                        <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums" color="fg.muted" display={{ base: "none", sm: "table-cell" }}>
                          {p.acceptanceRate == null ? "—" : `${p.acceptanceRate}%`}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    {filtered.length === 0 && (
                      <Table.Row bg="bg.panel">
                        <Table.Cell colSpan={5} py="10" textAlign="center" color="fg.muted">No problems match these filters.</Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Box>
          )}
        </Stack>
      </Container>
    </Flex>
  )
}
