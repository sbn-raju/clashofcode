import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { authApi, type LoginInput, type SignupInput, type User } from "../../lib/api"

export type AuthState = {
  user: User | null
  loading: boolean
  login: (input: LoginInput) => Promise<User>
  adminLogin: (input: LoginInput) => Promise<User>
  signup: (input: SignupInput) => Promise<User>
  logout: () => Promise<void>
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthState | null>(null)

/** Where a signed-in user belongs by default. */
// eslint-disable-next-line react-refresh/only-export-components
export function homeFor(user: User) {
  return user.role === "admin" ? "/admin/problems" : "/problems"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const { user } = await authApi.login(input)
    setUser(user)
    return user
  }, [])

  const adminLogin = useCallback(async (input: LoginInput) => {
    const { user } = await authApi.adminLogin(input)
    setUser(user)
    return user
  }, [])

  const signup = useCallback(async (input: SignupInput) => {
    const { user } = await authApi.signup(input)
    setUser(user)
    return user
  }, [])

  // Hard-navigate home after the session cookie is cleared. This drops all in-memory
  // state and avoids route guards bouncing the user to /login mid-transition.
  const logout = useCallback(async () => {
    await authApi.logout()
    window.location.replace("/")
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, adminLogin, signup, logout }),
    [user, loading, login, adminLogin, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
