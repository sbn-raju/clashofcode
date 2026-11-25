import { Box, HStack, Image, Text } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"

type LogoProps = {
  /** Height of the symbol tile in px. */
  size?: number
  withWordmark?: boolean
  /** Hide the wordmark below the `sm` breakpoint to save header space. */
  compactOnMobile?: boolean
  to?: string
}

/**
 * The approved logo is orange-on-white artwork, so on dark surfaces it sits in a
 * white app-icon tile (design.md §3, variant 8) rather than being recolored.
 */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Box
      bg="white"
      w={`${size}px`}
      h={`${size}px`}
      rounded={size >= 48 ? "xl" : "lg"}
      overflow="hidden"
      flexShrink={0}
      display="grid"
      placeItems="center"
    >
      {/* The source PNG has generous white margins; scale slightly to fill the tile. */}
      <Image
        src="/brand/clashofcode-logo-256.png"
        alt=""
        w="full"
        h="full"
        transform="scale(1.35)"
        draggable={false}
      />
    </Box>
  )
}

export function Logo({ size = 36, withWordmark = true, compactOnMobile = false, to = "/" }: LogoProps) {
  return (
    <HStack
      asChild
      gap="2.5"
      rounded="md"
      _focusVisible={{ outline: "2px solid", outlineColor: "brand.500", outlineOffset: "4px" }}
    >
      <RouterLink to={to} aria-label="clashofcode home">
        <LogoMark size={size} />
        {withWordmark && (
          <Text
            as="span"
            fontFamily="heading"
            fontWeight="700"
            fontSize={size >= 48 ? "2xl" : "lg"}
            letterSpacing="-0.02em"
            color="fg"
            display={compactOnMobile ? { base: "none", sm: "inline" } : undefined}
          >
            clash<Text as="span" color="brand.500">of</Text>code
          </Text>
        )}
      </RouterLink>
    </HStack>
  )
}
