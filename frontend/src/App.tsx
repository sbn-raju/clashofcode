import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { FullPageSpinner, GuestOnly, RequireAdmin, RequireAuth } from "./features/auth/RouteGuards"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import SignupPage from "./pages/SignupPage"

// Heavier screens (editor, markdown, admin) load on demand.
const ProblemsPage = lazy(() => import("./pages/ProblemsPage"))
const ProblemWorkspacePage = lazy(() => import("./pages/ProblemWorkspacePage"))
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"))
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"))
const AdminProblemsPage = lazy(() => import("./pages/admin/AdminProblemsPage"))
const AdminProblemEditorPage = lazy(() => import("./pages/admin/AdminProblemEditorPage"))

export default function App() {
  return (
    <ErrorBoundary>
    <Suspense fallback={<FullPageSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* Developer area */}
        <Route element={<RequireAuth />}>
          <Route path="/problems" element={<ProblemsPage />} />
          <Route path="/problems/:slug" element={<ProblemWorkspacePage />} />
          <Route path="/arena" element={<Navigate to="/problems" replace />} />
        </Route>

        {/* Admin area */}
        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/problems" replace />} />
            <Route path="problems" element={<AdminProblemsPage />} />
            <Route path="problems/:id" element={<AdminProblemEditorPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
    </ErrorBoundary>
  )
}
