// Fn 2.5 — Protected Routes + RBAC (Role-Based Access Control)
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

/**
 * @param {string[]} roles  - required roles; empty = any authenticated user
 */
export default function ProtectedRoute({ roles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) return <LoadingSpinner text="Verifying session..." />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // RBAC check (Fn 2.5 / Fn 5.4)
  if (roles.length > 0 && !roles.some((r) => user?.roles?.includes(r))) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <span className="text-5xl">🚫</span>
        <h2 className="text-2xl font-bold text-mhw-accent">Access Denied</h2>
        <p className="text-gray-400">You don't have permission to view this page.</p>
      </div>
    )
  }

  return <Outlet />
}
