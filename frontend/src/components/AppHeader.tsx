import { Avatar, Badge, Box, Button, Container, HStack, Link, Text } from "@chakra-ui/react"
import { LogOut } from "lucide-react"
import { useState } from "react"
import { NavLink } from "react-router-dom"
import { useAuth } from "../features/auth/useAuth"
import { Logo } from "./Logo"

type NavItem = { label: string; to: string }

type AppHeaderProps = {
  area: "developer" | "admin"
  maxW?: string
}

const NAV: Record<AppHeaderProps["area"], NavItem[]> = {
  developer: [{ label: "Problems", to: "/problems" }],
  admin: [{ label: "Problems", to: "/admin/problems" }],
}

export function AppHeader({ area, maxW = "7xl" }: AppHeaderProps) {
  const { user, logout } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  async function handleLogout() {
    setSigningOut(true)
    try {
      await logout()
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <Box as="header" borderBottomWidth="1px" borderColor="border.muted" bg="bg" flexShrink={0}>
      <Container maxW={maxW} py="2.5">
        <HStack justify="space-between" gap="4">
          <HStack gap={{ base: "4", md: "8" }}>
            <HStack gap="2.5">
              <Logo to={area === "admin" ? "/admin/problems" : "/problems"} size={32} compactOnMobile />
              {area === "admin" && (
                <Badge colorPalette="brand" variant="surface" size="sm">
                  Admin
                </Badge>
              )}
            </HStack>
            <HStack as="nav" aria-label="Main" gap="1">
              {NAV[area].map((item) => (
                <Link
                  key={item.to}
                  asChild
                  px="3"
                  py="1.5"
                  rounded="md"
                  fontSize="sm"
                  fontWeight="500"
                  color="fg.muted"
                  _hover={{ color: "fg", bg: "bg.muted", textDecoration: "none" }}
                  css={{ "&[aria-current=page]": { color: "fg", bg: "bg.muted" } }}
                >
                  <NavLink to={item.to} end={false}>
                    {item.label}
                  </NavLink>
                </Link>
              ))}
            </HStack>
          </HStack>

          <HStack gap="3">
            {user && (
              <HStack gap="2" display={{ base: "none", sm: "flex" }}>
                <Avatar.Root size="xs" colorPalette="brand">
                  <Avatar.Fallback name={user.name} />
                </Avatar.Root>
                <Text fontFamily="mono" fontSize="xs" color="fg.muted">
                  @{user.handle}
                </Text>
              </HStack>
            )}
            <Button variant="outline" size="xs" color="fg" onClick={handleLogout} loading={signingOut}>
              <LogOut /> Sign out
            </Button>
          </HStack>
        </HStack>
      </Container>
    </Box>
  )
}
