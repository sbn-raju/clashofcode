import { Button, Center, Heading, Stack, Text } from "@chakra-ui/react"
import { Component, type ReactNode } from "react"

type State = { error: Error | null }

/**
 * Catches render errors, including lazy-loaded chunks that fail to download
 * (e.g. after a new deploy), so the app shows a recovery action instead of a blank page.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error(error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <Center minH="100dvh" px="4">
        <Stack gap="4" align="center" textAlign="center" maxW="md">
          <Heading as="h1" fontSize="xl">Something went wrong</Heading>
          <Text color="fg.muted" fontSize="sm">
            This page failed to load. Reloading usually fixes it. Any code in the editor is kept as a draft in this browser.
          </Text>
          <Button colorPalette="brand" size="sm" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </Stack>
      </Center>
    )
  }
}
