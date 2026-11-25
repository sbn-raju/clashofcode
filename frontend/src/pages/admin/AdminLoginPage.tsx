import { Button, Field, Input, Link, Stack } from "@chakra-ui/react"
import { useState, type FormEvent } from "react"
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom"
import { AuthLayout } from "../../components/AuthLayout"
import { FormAlert } from "../../components/FormAlert"
import { PasswordInput } from "../../components/PasswordInput"
import { useAuth } from "../../features/auth/useAuth"
import { ApiError } from "../../lib/api"

export default function AdminLoginPage() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from
  const redirectTo = from?.startsWith("/admin") ? from : "/admin/problems"

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
      await adminLogin({ identifier: identifier.trim(), password })
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Admin sign in"
      subtitle="Manage problems, test cases, and publishing."
      footer={
        <>
          Not an admin?{" "}
          <Link asChild color="brand.400" fontWeight="500">
            <RouterLink to="/login">Developer sign in</RouterLink>
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
            Sign in to admin
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  )
}
