import { Button, Field, Input, InputGroup, Link, SimpleGrid, Stack } from "@chakra-ui/react"
import { useState, type FormEvent } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { AuthLayout } from "../components/AuthLayout"
import { FormAlert } from "../components/FormAlert"
import { PasswordInput } from "../components/PasswordInput"
import { useAuth } from "../features/auth/useAuth"
import { ApiError, type FieldErrors, type SignupInput } from "../lib/api"

const EMPTY: SignupInput = { name: "", handle: "", email: "", password: "" }

// Mirrors the server rules so most mistakes are caught before a round trip.
function validate(v: SignupInput): FieldErrors {
  const e: FieldErrors = {}
  if (v.name.trim().length < 2) e.name = "Enter your name (at least 2 characters)."
  if (!/^[a-zA-Z0-9_]{3,24}$/.test(v.handle.trim())) {
    e.handle = "Use 3–24 letters, numbers, or underscores."
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address."
  if (v.password.length < 8) e.password = "Use at least 8 characters."
  else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password)) {
    e.password = "Include at least one letter and one number."
  }
  return e
}

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [values, setValues] = useState<SignupInput>(EMPTY)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = (key: keyof SignupInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((v) => ({ ...v, [key]: e.target.value }))
    if (fieldErrors[key]) setFieldErrors((f) => ({ ...f, [key]: undefined }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const errors = validate(values)
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setSubmitting(true)
    try {
      await signup({
        name: values.name.trim(),
        handle: values.handle.trim(),
        email: values.email.trim(),
        password: values.password,
      })
      navigate("/problems", { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fields)
        setError(err.message)
      } else {
        setError("Something went wrong. Please try again.")
      }
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Join the arena"
      subtitle="Create your developer account to start solving."
      footer={
        <>
          Already have an account?{" "}
          <Link asChild color="brand.400" fontWeight="500">
            <RouterLink to="/login">Sign in</RouterLink>
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="5">
          <FormAlert message={error} />

          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="5">
            <Field.Root required invalid={!!fieldErrors.name}>
              <Field.Label>Full name</Field.Label>
              <Input name="name" autoComplete="name" autoFocus size="lg" value={values.name} onChange={set("name")} />
              <Field.ErrorText>{fieldErrors.name}</Field.ErrorText>
            </Field.Root>

            <Field.Root required invalid={!!fieldErrors.handle}>
              <Field.Label>Handle</Field.Label>
              <InputGroup startElement="@" startElementProps={{ color: "fg.subtle", fontFamily: "mono" }}>
                <Input
                  name="handle"
                  autoComplete="username"
                  size="lg"
                  fontFamily="mono"
                  spellCheck={false}
                  autoCapitalize="none"
                  value={values.handle}
                  onChange={set("handle")}
                />
              </InputGroup>
              <Field.ErrorText>{fieldErrors.handle}</Field.ErrorText>
            </Field.Root>
          </SimpleGrid>

          <Field.Root required invalid={!!fieldErrors.email}>
            <Field.Label>Work email</Field.Label>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              size="lg"
              placeholder="you@company.com"
              value={values.email}
              onChange={set("email")}
            />
            <Field.ErrorText>{fieldErrors.email}</Field.ErrorText>
          </Field.Root>

          <Field.Root required invalid={!!fieldErrors.password}>
            <Field.Label>Password</Field.Label>
            <PasswordInput
              name="password"
              autoComplete="new-password"
              size="lg"
              value={values.password}
              onChange={set("password")}
            />
            {fieldErrors.password ? (
              <Field.ErrorText>{fieldErrors.password}</Field.ErrorText>
            ) : (
              <Field.HelperText color="fg.subtle">At least 8 characters, with a letter and a number.</Field.HelperText>
            )}
          </Field.Root>

          <Button type="submit" colorPalette="brand" size="lg" fontWeight="600" loading={submitting} loadingText="Creating account…">
            Create account
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  )
}
