import { Center, Spinner } from "@chakra-ui/react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { homeFor } from "./AuthContext"
import { useAuth } from "./useAuth"

export function FullPageSpinner() {
  return (
    <Center minH="100dvh">
      <Spinner color="brand.500" size="lg" aria-label="Loading" />
    </Center>
  )
}

/** Developer area: any signed-in account. */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Admin area: admins only. Everyone else goes to the admin sign-in. */
export function RequireAdmin() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  if (user.role !== "admin") return <Navigate to="/problems" replace />
  return <Outlet />
}

/** Login/signup are only for signed-out visitors. */
export function GuestOnly() {
  const { user, loading } = useAuth()
  if (loading) return <FullPageSpinner />
  if (user) return <Navigate to={homeFor(user)} replace />
  return <Outlet />
}
