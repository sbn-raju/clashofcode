import { Flex } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import { AppHeader } from "../../components/AppHeader"

export default function AdminLayout() {
  return (
    <Flex direction="column" minH="100dvh">
      <AppHeader area="admin" />
      <Flex as="main" direction="column" flex="1">
        <Outlet />
      </Flex>
    </Flex>
  )
}
