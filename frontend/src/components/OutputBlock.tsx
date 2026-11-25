import { Box, Stack, Text } from "@chakra-ui/react"

type OutputBlockProps = {
  label: string
  value: string | null | undefined
  tone?: "default" | "error" | "success"
  emptyText?: string
  maxH?: string
}

/** Labelled monospace block for stdin/stdout/stderr. Preserves whitespace exactly. */
export function OutputBlock({ label, value, tone = "default", emptyText = "(empty)", maxH = "220px" }: OutputBlockProps) {
  const borderColor = tone === "error" ? "red.500/50" : tone === "success" ? "green.500/40" : "border"
  const empty = value == null || value === ""
  return (
    <Stack gap="1.5" minW="0">
      <Text fontSize="xs" color="fg.muted" fontWeight="500">
        {label}
      </Text>
      <Box
        as="pre"
        fontFamily="mono"
        fontSize="xs"
        lineHeight="1.6"
        bg="bg.muted"
        borderWidth="1px"
        borderColor={borderColor}
        rounded="md"
        px="3"
        py="2"
        maxH={maxH}
        overflow="auto"
        whiteSpace="pre"
        color={empty ? "fg.subtle" : tone === "error" ? "red.300" : "fg"}
        fontStyle={empty ? "italic" : undefined}
      >
        {empty ? emptyText : value}
      </Box>
    </Stack>
  )
}
