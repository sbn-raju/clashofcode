import { Alert } from "@chakra-ui/react"

export function FormAlert({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <Alert.Root status="error" variant="subtle" rounded="md" role="alert">
      <Alert.Indicator />
      <Alert.Title fontWeight="500">{message}</Alert.Title>
    </Alert.Root>
  )
}
