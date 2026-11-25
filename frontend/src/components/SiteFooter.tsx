import { Box, Container, Stack, Text } from "@chakra-ui/react"
import { Logo } from "./Logo"

export function SiteFooter() {
  return (
    <Box as="footer" borderTopWidth="1px" borderColor="border.muted" py="10">
      <Container maxW="7xl">
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap="4"
        >
          <Stack gap="2">
            <Logo size={28} />
            <Text fontSize="sm" color="fg.muted">
              Code. Compete. Conquer.
            </Text>
          </Stack>
          <Text fontSize="xs" color="fg.subtle">
            © {new Date().getFullYear()} clashofcode. Built for professional developers.
          </Text>
        </Stack>
      </Container>
    </Box>
  )
}
