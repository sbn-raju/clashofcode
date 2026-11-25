import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  ArrowRight,
  Binary,
  Braces,
  Cpu,
  GitBranch,
  Layers,
  Network,
  ShieldCheck,
  Target,
  Terminal,
  TrendingUp,
  Workflow,
  type LucideIcon,
} from "lucide-react"
import { Link as RouterLink } from "react-router-dom"
import { LogoMark } from "../components/Logo"
import { SiteFooter } from "../components/SiteFooter"
import { SiteHeader } from "../components/SiteHeader"
import { homeFor } from "../features/auth/AuthContext"
import { useAuth } from "../features/auth/useAuth"

const LANGUAGES = ["Python", "JavaScript", "TypeScript", "Java", "C", "C++"]

const PILLARS: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Target,
    title: "Problems built for experienced engineers",
    body: "Skip the warm-ups. Work through problems that demand real algorithmic judgment and clean implementation.",
  },
  {
    icon: ShieldCheck,
    title: "Sandboxed, honest evaluation",
    body: "Every submission runs in an isolated environment against hidden tests. Verdicts are explicit, never ambiguous.",
  },
  {
    icon: Terminal,
    title: "A distraction-free workspace",
    body: "Problem, editor, and results side by side. Keyboard-first controls designed for people who code every day.",
  },
  {
    icon: TrendingUp,
    title: "Progress that means something",
    body: "Your rating moves with demonstrated performance, and the methodology behind it stays transparent.",
  },
]

const TRACKS: { icon: LucideIcon; title: string; body: string; level: "Medium" | "Hard" | "Expert" }[] = [
  { icon: Network, title: "Graphs", body: "Shortest paths, flows, and topological reasoning.", level: "Hard" },
  { icon: Layers, title: "Dynamic programming", body: "State design, optimization, and memory trade-offs.", level: "Expert" },
  { icon: Workflow, title: "Concurrency", body: "Scheduling, ordering, and safe shared state.", level: "Expert" },
  { icon: Braces, title: "Strings & parsing", body: "Tokenizers, pattern matching, and grammars.", level: "Medium" },
  { icon: GitBranch, title: "Trees & data structures", body: "Segment trees, tries, heaps, and balanced structures.", level: "Hard" },
  { icon: Binary, title: "Bits & math", body: "Number theory, bitmasks, and combinatorics.", level: "Hard" },
]

const LEVEL_PALETTE = { Medium: "yellow", Hard: "orange", Expert: "red" } as const

const STEPS = [
  { title: "Create your account", body: "Pick a handle. It's how other engineers will know you in the arena." },
  { title: "Solve under real constraints", body: "Write in your language of choice, run tests, and submit against hidden cases." },
  { title: "Build your record", body: "Accepted solutions and your rating accumulate into a visible track record." },
]

function SectionHeading({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <Stack gap="3" maxW="2xl" mb={{ base: "8", md: "12" }}>
      <Text fontFamily="mono" fontSize="xs" color="brand.400" textTransform="uppercase" letterSpacing="0.12em">
        {eyebrow}
      </Text>
      <Heading as="h2" fontSize={{ base: "2xl", md: "4xl" }} lineHeight="1.15" letterSpacing="-0.02em">
        {title}
      </Heading>
      {body && (
        <Text color="fg.muted" fontSize={{ base: "md", md: "lg" }}>
          {body}
        </Text>
      )}
    </Stack>
  )
}

function CodePreview() {
  const line = (n: number, content: React.ReactNode) => (
    <Flex key={n} gap="4">
      <Text as="span" color="fg.subtle" w="5" textAlign="right" userSelect="none" flexShrink={0}>
        {n}
      </Text>
      <Text as="span" whiteSpace="pre">
        {content}
      </Text>
    </Flex>
  )
  const kw = (s: string) => <Text as="span" color="#C792EA">{s}</Text>
  const fn = (s: string) => <Text as="span" color="#82AAFF">{s}</Text>
  const num = (s: string) => <Text as="span" color="#F78C6C">{s}</Text>
  const cm = (s: string) => <Text as="span" color="fg.subtle">{s}</Text>

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      borderColor="border"
      rounded="xl"
      overflow="hidden"
      shadow="0 24px 60px -20px rgba(0,0,0,0.6)"
      aria-label="Example of the clashofcode editor"
      role="img"
    >
      <HStack px="4" py="2.5" borderBottomWidth="1px" borderColor="border" justify="space-between">
        <HStack gap="2">
          <Icon as={Cpu} boxSize="4" color="brand.400" />
          <Text fontSize="sm" fontWeight="600">
            Sliding window maximum
          </Text>
          <Badge colorPalette="red" variant="subtle" size="sm">
            Expert
          </Badge>
        </HStack>
        <Text fontFamily="mono" fontSize="xs" color="fg.muted">
          python3
        </Text>
      </HStack>

      <Box px="4" py="4" fontFamily="mono" fontVariantLigatures="none" fontSize={{ base: "xs", md: "sm" }} lineHeight="1.8" overflowX="auto">
        {line(1, <>{kw("from")} collections {kw("import")} deque</>)}
        {line(2, "")}
        {line(3, <>{kw("def")} {fn("solve")}(nums, k):</>)}
        {line(4, <>    q, out = deque(), []  {cm("# O(n) monotonic queue")}</>)}
        {line(5, <>    {kw("for")} i, x {kw("in")} {fn("enumerate")}(nums):</>)}
        {line(6, <>        {kw("while")} q {kw("and")} nums[q[-{num("1")}]] {"<"}= x:</>)}
        {line(7, <>            q.{fn("pop")}()</>)}
        {line(8, <>        q.{fn("append")}(i)</>)}
        {line(9, <>        {kw("if")} q[{num("0")}] {"<"}= i - k:</>)}
        {line(10, <>            q.{fn("popleft")}()</>)}
        {line(11, <>        {kw("if")} i {">"}= k - {num("1")}:</>)}
        {line(12, <>            out.{fn("append")}(nums[q[{num("0")}]])</>)}
        {line(13, <>    {kw("return")} out</>)}
      </Box>

      <HStack px="4" py="3" borderTopWidth="1px" borderColor="border" justify="space-between" bg="bg.muted">
        <HStack gap="2" color="green.400" fontSize="sm" fontWeight="600">
          <Icon as={ShieldCheck} boxSize="4" />
          <Text>Solution accepted.</Text>
        </HStack>
        <HStack gap="2">
          <Box px="3" py="1" rounded="md" borderWidth="1px" borderColor="border" fontSize="xs" color="fg.muted">
            Run tests
          </Box>
          <Box px="3" py="1" rounded="md" bg="brand.500" color="#101114" fontSize="xs" fontWeight="600">
            Submit solution
          </Box>
        </HStack>
      </HStack>
    </Box>
  )
}

export default function LandingPage() {
  const { user } = useAuth()
  const primaryTo = user ? homeFor(user) : "/signup"

  return (
    <Flex direction="column" minH="100dvh">
      <SiteHeader />

      <Box as="main" flex="1">
        {/* Hero */}
        <Box
          as="section"
          position="relative"
          overflow="hidden"
          borderBottomWidth="1px"
          borderColor="border.muted"
          _before={{
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 30%, black 30%, transparent 75%)",
            pointerEvents: "none",
          }}
        >
          <Container maxW="7xl" py={{ base: "16", md: "24" }} position="relative">
            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: "12", lg: "16" }} alignItems="center">
              <Stack gap="7">
                <HStack
                  alignSelf="flex-start"
                  gap="2"
                  px="3"
                  py="1"
                  rounded="full"
                  borderWidth="1px"
                  borderColor="brand.500/40"
                  bg="brand.500/10"
                >
                  <Box w="1.5" h="1.5" rounded="full" bg="brand.500" />
                  <Text fontSize="xs" fontWeight="500" color="brand.300">
                    For professional developers only
                  </Text>
                </HStack>

                <Heading
                  as="h1"
                  fontSize={{ base: "4xl", md: "5xl", xl: "6xl" }}
                  lineHeight="1.05"
                  letterSpacing="-0.03em"
                  fontWeight="700"
                >
                  The coding arena{" "}
                  <Text as="span" color="brand.500">
                    for professionals.
                  </Text>
                </Heading>

                <Text fontSize={{ base: "md", md: "lg" }} color="fg.muted" maxW="xl">
                  Advanced problems, sandboxed evaluation, and a rating that reflects what you can actually build.
                  clashofcode is where experienced engineers come to practice and sharpen their edge.
                </Text>

                <Stack direction={{ base: "column", sm: "row" }} gap="3">
                  <Button asChild colorPalette="brand" size="lg" fontWeight="600">
                    <RouterLink to={primaryTo}>
                      {user ? "Enter the arena" : "Start solving"} <ArrowRight />
                    </RouterLink>
                  </Button>
                  <Button asChild variant="outline" size="lg" color="fg" borderColor="border">
                    <a href="#how">How it works</a>
                  </Button>
                </Stack>

                <Stack gap="2.5" pt="2">
                  <Text fontSize="xs" color="fg.subtle" textTransform="uppercase" letterSpacing="0.1em">
                    Solve in
                  </Text>
                  <HStack gap="2" wrap="wrap">
                    {LANGUAGES.map((lang) => (
                      <Box
                        key={lang}
                        px="2.5"
                        py="1"
                        rounded="md"
                        bg="bg.panel"
                        borderWidth="1px"
                        borderColor="border"
                        fontFamily="mono"
                        fontSize="xs"
                        color="fg.muted"
                      >
                        {lang}
                      </Box>
                    ))}
                  </HStack>
                </Stack>
              </Stack>

              <CodePreview />
            </SimpleGrid>
          </Container>
        </Box>

        {/* Why */}
        <Box as="section" id="why" scrollMarginTop="20" py={{ base: "16", md: "24" }}>
          <Container maxW="7xl">
            <SectionHeading
              eyebrow="Why clashofcode"
              title="Practice that respects the craft."
              body="No gamified noise. Just hard problems, fair evaluation, and a workspace that stays out of your way."
            />
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="5">
              {PILLARS.map((p) => (
                <Stack
                  key={p.title}
                  gap="4"
                  p={{ base: "5", md: "7" }}
                  bg="bg.panel"
                  borderWidth="1px"
                  borderColor="border"
                  rounded="xl"
                  transition="border-color 0.15s"
                  _hover={{ borderColor: "border.emphasized" }}
                >
                  <Flex
                    w="10"
                    h="10"
                    rounded="lg"
                    bg="brand.500/10"
                    color="brand.400"
                    align="center"
                    justify="center"
                  >
                    <Icon as={p.icon} boxSize="5" />
                  </Flex>
                  <Heading as="h3" fontSize="xl" fontWeight="600">
                    {p.title}
                  </Heading>
                  <Text color="fg.muted">{p.body}</Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* Skill tracks */}
        <Box
          as="section"
          id="tracks"
          scrollMarginTop="20"
          py={{ base: "16", md: "24" }}
          bg="bg.subtle"
          borderYWidth="1px"
          borderColor="border.muted"
        >
          <Container maxW="7xl">
            <SectionHeading
              eyebrow="Skill tracks"
              title="Go deep where it matters."
              body="Focused problem collections that build on each other, from solid fundamentals to expert-level technique."
            />
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="4">
              {TRACKS.map((t) => (
                <HStack
                  key={t.title}
                  align="flex-start"
                  gap="4"
                  p="5"
                  bg="bg"
                  borderWidth="1px"
                  borderColor="border"
                  rounded="xl"
                >
                  <Icon as={t.icon} boxSize="5" color="brand.400" mt="0.5" flexShrink={0} />
                  <Stack gap="1.5" flex="1">
                    <HStack justify="space-between" gap="2">
                      <Heading as="h3" fontSize="md" fontWeight="600" fontFamily="body">
                        {t.title}
                      </Heading>
                      <Badge colorPalette={LEVEL_PALETTE[t.level]} variant="subtle" size="sm">
                        {t.level}
                      </Badge>
                    </HStack>
                    <Text fontSize="sm" color="fg.muted">
                      {t.body}
                    </Text>
                  </Stack>
                </HStack>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* How it works */}
        <Box as="section" id="how" scrollMarginTop="20" py={{ base: "16", md: "24" }}>
          <Container maxW="7xl">
            <SectionHeading eyebrow="How it works" title="From sign-up to accepted in minutes." />
            <SimpleGrid as="ol" columns={{ base: 1, md: 3 }} gap={{ base: "8", md: "6" }} listStyleType="none">
              {STEPS.map((s, i) => (
                <Stack as="li" key={s.title} gap="3" borderTopWidth="2px" borderColor={i === 0 ? "brand.500" : "border"} pt="5">
                  <Text fontFamily="mono" fontSize="sm" color="brand.400">
                    {String(i + 1).padStart(2, "0")}
                  </Text>
                  <Heading as="h3" fontSize="xl" fontWeight="600">
                    {s.title}
                  </Heading>
                  <Text color="fg.muted">{s.body}</Text>
                </Stack>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* CTA */}
        <Box as="section" pb={{ base: "16", md: "24" }}>
          <Container maxW="7xl">
            <Stack
              direction={{ base: "column", md: "row" }}
              align={{ base: "flex-start", md: "center" }}
              justify="space-between"
              gap="8"
              p={{ base: "7", md: "12" }}
              rounded="2xl"
              bg="bg.panel"
              borderWidth="1px"
              borderColor="border"
            >
              <HStack gap="5" align="center">
                <Box display={{ base: "none", sm: "block" }}>
                  <LogoMark size={56} />
                </Box>
                <Stack gap="2">
                  <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
                    Code. Compete. Conquer.
                  </Heading>
                  <Text color="fg.muted">Your first problem is one sign-up away.</Text>
                </Stack>
              </HStack>
              <Button asChild colorPalette="brand" size="lg" fontWeight="600" flexShrink={0}>
                <RouterLink to={primaryTo}>
                  {user ? "Enter the arena" : "Join the arena"} <ArrowRight />
                </RouterLink>
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>

      <SiteFooter />
    </Flex>
  )
}
