import { Box, Button, Container, HStack, Link } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
import { homeFor } from "../features/auth/AuthContext"
import { useAuth } from "../features/auth/useAuth"
import { Logo } from "./Logo"

const NAV = [
  { label: "Why clashofcode", href: "#why" },
  { label: "Skill tracks", href: "#tracks" },
  { label: "How it works", href: "#how" },
]

export function SiteHeader() {
  const { user, loading } = useAuth()

  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="sticky"
      bg="bg/85"
      backdropFilter="blur(10px)"
      borderBottomWidth="1px"
      borderColor="border.muted"
    >
      <Container maxW="7xl" py="3">
        <HStack justify="space-between" gap="6">
          <Logo compactOnMobile />

          <HStack as="nav" aria-label="Primary" gap="7" display={{ base: "none", md: "flex" }}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                fontSize="sm"
                color="fg.muted"
                _hover={{ color: "fg", textDecoration: "none" }}
                transition="color 0.12s"
              >
                {item.label}
              </Link>
            ))}
          </HStack>

          <HStack gap="2" visibility={loading ? "hidden" : "visible"}>
            {user ? (
              <Button asChild colorPalette="brand" size="sm">
                <RouterLink to={homeFor(user)}>{user.role === "admin" ? "Admin console" : "Enter the arena"}</RouterLink>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" color="fg">
                  <RouterLink to="/login">Sign in</RouterLink>
                </Button>
                <Button asChild colorPalette="brand" size="sm">
                  <RouterLink to="/signup">Join the arena</RouterLink>
                </Button>
              </>
            )}
          </HStack>
        </HStack>
      </Container>
    </Box>
  )
}
