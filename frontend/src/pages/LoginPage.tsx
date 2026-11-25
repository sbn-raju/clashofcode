import { Button, Field, Input, Link, Stack } from "@chakra-ui/react"
import { useState, type FormEvent } from "react"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout"
import { FormAlert } from "../components/FormAlert"
import { PasswordInput } from "../components/PasswordInput"
import { homeFor } from "../features/auth/AuthContext"
import { useAuth } from "../features/auth/useAuth"
import { ApiError } from "../lib/api"

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!identifier.trim() || !password) {
      setError("Enter your email or handle and your password.")
      return
    }
    setSubmitting(true)
    try {
      const user = await login({ identifier: identifier.trim(), password })
      // Return to the page they came from, but never send a non-admin into /admin.
      const canReturn = from && (user.role === "admin" || !from.startsWith("/admin"))
      navigate(canReturn ? from : homeFor(user), { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      footer={
        <>
          New to clashofcode?{" "}
          <Link asChild color="brand.400" fontWeight="500">
            <RouterLink to="/signup">Create an account</RouterLink>
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="5">
          <FormAlert message={error} />

          <Field.Root required>
            <Field.Label>Email or handle</Field.Label>
            <Input
              name="identifier"
              autoComplete="username"
              autoFocus
              size="lg"
              placeholder="you@company.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Password</Field.Label>
            <PasswordInput
              name="password"
              autoComplete="current-password"
              size="lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field.Root>

          <Button type="submit" colorPalette="brand" size="lg" fontWeight="600" loading={submitting} loadingText="Signing in…">
            Sign in
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  )
}
