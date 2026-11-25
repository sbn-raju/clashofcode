import { Badge, HStack, Icon, Text } from "@chakra-ui/react"
import { CheckCircle2, Clock, XCircle, AlertTriangle, Cpu, ServerCrash } from "lucide-react"
import type { Difficulty, Verdict } from "../lib/api"

const DIFFICULTY_PALETTE: Record<Difficulty, string> = {
  Easy: "green",
  Medium: "yellow",
  Hard: "orange",
  Expert: "red",
}

export function DifficultyBadge({ difficulty, size = "sm" }: { difficulty: Difficulty; size?: "xs" | "sm" | "md" }) {
  return (
    <Badge colorPalette={DIFFICULTY_PALETTE[difficulty]} variant="subtle" size={size}>
      {difficulty}
    </Badge>
  )
}

const VERDICT_META: Record<Verdict, { color: string; icon: typeof CheckCircle2 }> = {
  Accepted: { color: "green.400", icon: CheckCircle2 },
  "Wrong Answer": { color: "red.400", icon: XCircle },
  "Time Limit Exceeded": { color: "yellow.400", icon: Clock },
  "Compilation Error": { color: "red.400", icon: Cpu },
  "Runtime Error": { color: "red.400", icon: AlertTriangle },
  "Internal Error": { color: "fg.muted", icon: ServerCrash },
}

/** Verdict with icon + label: never color alone (design.md §12). */
export function VerdictLabel({ verdict, size = "sm" }: { verdict: Verdict; size?: "sm" | "md" | "lg" }) {
  const meta = VERDICT_META[verdict]
  return (
    <HStack gap="1.5" color={meta.color} fontWeight="600">
      <Icon as={meta.icon} boxSize={size === "lg" ? "5" : "4"} />
      <Text fontSize={size}>{verdict}</Text>
    </HStack>
  )
}
