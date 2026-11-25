import { Badge, Box, Button, Center, Container, Flex, Heading, HStack, Icon, Spinner, Stack, Table, Text } from "@chakra-ui/react"
import { FilePlus2, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { DifficultyBadge } from "../../components/Badges"
import { FormAlert } from "../../components/FormAlert"
import { adminApi, ApiError, type AdminProblemListItem } from "../../lib/api"

const fmt = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })

export default function AdminProblemsPage() {
  const navigate = useNavigate()
  const [problems, setProblems] = useState<AdminProblemListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi
      .list()
      .then(({ problems }) => setProblems(problems))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Could not load problems."))
  }, [])

  const published = problems?.filter((p) => p.status === "published").length ?? 0

  return (
    <Container maxW="7xl" py={{ base: "8", md: "10" }}>
      <Stack gap="6">
        <Flex justify="space-between" align={{ base: "flex-start", sm: "center" }} gap="4" direction={{ base: "column", sm: "row" }}>
          <Stack gap="1">
            <Heading as="h1" fontSize="2xl" letterSpacing="-0.02em">
              Problems
            </Heading>
            <Text color="fg.muted" fontSize="sm">
              {problems
                ? `${problems.length} total · ${published} published · ${problems.length - published} draft`
                : "Write statements, verify with a reference solution, then publish."}
            </Text>
          </Stack>
          <Button asChild colorPalette="brand" size="sm" fontWeight="600">
            <RouterLink to="/admin/problems/new">
              <FilePlus2 /> New problem
            </RouterLink>
          </Button>
        </Flex>

        <FormAlert message={error} />

        {!problems && !error && (
          <Center py="20">
            <Spinner color="brand.500" />
          </Center>
        )}

        {problems && problems.length === 0 && (
          <Stack align="center" textAlign="center" gap="3" py="16" rounded="xl" borderWidth="1px" borderStyle="dashed" borderColor="border.emphasized" bg="bg.panel">
            <Heading as="h2" fontSize="lg" fontWeight="600">
              No problems yet
            </Heading>
            <Text color="fg.muted" fontSize="sm" maxW="md">
              Create your first problem. Add a reference solution and test inputs, run it to generate expected outputs, then publish.
            </Text>
            <Button asChild colorPalette="brand" size="sm" mt="2">
              <RouterLink to="/admin/problems/new">Create a problem</RouterLink>
            </Button>
          </Stack>
        )}

        {problems && problems.length > 0 && (
          <Box borderWidth="1px" borderColor="border" rounded="xl" overflow="hidden" bg="bg.panel">
            <Table.ScrollArea>
              <Table.Root size="sm" interactive>
                <Table.Header>
                  <Table.Row bg="bg.muted">
                    <Table.ColumnHeader color="fg.muted" py="3">Title</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted">Difficulty</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted">Status</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" textAlign="end">Tests</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" display={{ base: "none", md: "table-cell" }}>Updated</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {problems.map((p) => (
                    <Table.Row
                      key={p.id}
                      cursor="pointer"
                      bg="bg.panel"
                      _hover={{ bg: "bg.muted" }}
                      onClick={() => navigate(`/admin/problems/${p.id}`)}
                    >
                      <Table.Cell py="3">
                        <Stack gap="0.5">
                          <RouterLink to={`/admin/problems/${p.id}`} onClick={(e) => e.stopPropagation()}>
                            <Text fontWeight="500" _hover={{ color: "brand.400" }}>
                              {p.title}
                            </Text>
                          </RouterLink>
                          <Text fontFamily="mono" fontSize="xs" color="fg.subtle">
                            {p.slug}
                          </Text>
                        </Stack>
                      </Table.Cell>
                      <Table.Cell>
                        <DifficultyBadge difficulty={p.difficulty} />
                      </Table.Cell>
                      <Table.Cell>
                        {p.status === "published" ? (
                          <HStack gap="1.5">
                            <Badge colorPalette="green" variant="subtle" size="sm">Published</Badge>
                            {p.verifiedAt && <Icon as={ShieldCheck} boxSize="3.5" color="green.400" aria-label="Verified" />}
                          </HStack>
                        ) : (
                          <Badge variant="outline" size="sm" color="fg.muted">Draft</Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell textAlign="end" fontVariantNumeric="tabular-nums">
                        {p.testCount}
                        <Text as="span" color="fg.subtle" fontSize="xs"> ({p.sampleCount} sample)</Text>
                      </Table.Cell>
                      <Table.Cell color="fg.muted" fontSize="xs" display={{ base: "none", md: "table-cell" }}>
                        {fmt.format(new Date(p.updatedAt))}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Box>
        )}
      </Stack>
    </Container>
  )
}
