import { Box, Flex, Heading, HStack, Icon, Stack, Text } from "@chakra-ui/react"
import { Check } from "lucide-react"
import type { ReactNode } from "react"
import { Logo, LogoMark } from "./Logo"

const POINTS = [
  "Problems built for experienced engineers",
  "Sandboxed evaluation in six languages",
  "A rating that tracks demonstrated skill",
]

type AuthLayoutProps = {
  title: string
  subtitle: ReactNode
  children: ReactNode
  footer: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <Flex minH="100dvh">
      {/* Brand panel (desktop only) */}
      <Flex
        display={{ base: "none", lg: "flex" }}
        direction="column"
        justify="space-between"
        w="45%"
        maxW="640px"
        p="12"
        bg="bg.subtle"
        borderRightWidth="1px"
        borderColor="border.muted"
        position="relative"
        overflow="hidden"
        _before={{
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
          pointerEvents: "none",
        }}
      >
        <Box position="relative">
          <Logo />
        </Box>

        <Stack gap="8" position="relative">
          <LogoMark size={88} />
          <Stack gap="3">
            <Heading as="p" fontSize="4xl" lineHeight="1.1" letterSpacing="-0.03em">
              Code. Compete.{" "}
              <Text as="span" color="brand.500">
                Conquer.
              </Text>
            </Heading>
            <Text color="fg.muted" fontSize="lg" maxW="md">
              The competitive arena built for professional developers.
            </Text>
          </Stack>
          <Stack as="ul" gap="3" listStyleType="none">
            {POINTS.map((p) => (
              <HStack as="li" key={p} gap="3" color="fg.muted">
                <Flex w="5" h="5" rounded="full" bg="brand.500/15" align="center" justify="center" flexShrink={0}>
                  <Icon as={Check} boxSize="3" color="brand.400" />
                </Flex>
                <Text fontSize="sm">{p}</Text>
              </HStack>
            ))}
          </Stack>
        </Stack>

        <Text fontSize="xs" color="fg.subtle" position="relative">
          © {new Date().getFullYear()} clashofcode
        </Text>
      </Flex>

      {/* Form panel */}
      <Flex as="main" flex="1" align="center" justify="center" px={{ base: "5", sm: "8" }} py="12">
        <Stack w="full" maxW="420px" gap="8">
          <Box display={{ base: "block", lg: "none" }}>
            <Logo />
          </Box>

          <Stack gap="2">
            <Heading as="h1" fontSize={{ base: "2xl", md: "3xl" }} letterSpacing="-0.02em">
              {title}
            </Heading>
            <Text color="fg.muted">{subtitle}</Text>
          </Stack>

          {children}

          <Text fontSize="sm" color="fg.muted" textAlign="center">
            {footer}
          </Text>
        </Stack>
      </Flex>
    </Flex>
  )
}
