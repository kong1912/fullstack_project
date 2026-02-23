// Fn 2.5 — Auth Context: provides auth state + RBAC to entire tree
import { createContext, useContext, useEffect } from 'react'
import useAuthStore from '../store/authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { user, isAuthenticated, isLoading, error, checkAuth, logout, clearError } =
    useAuthStore()

  // Verify session on initial load (Fn 5.3)
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    clearError,
    // Helper for RBAC checks in components
    hasRole: (role) => user?.roles?.includes(role) ?? false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

export default AuthContext
