// Fn 2.5 — Auth store (Role-Based Access Control state, synced with backend)
import { create } from 'zustand'
import axiosInstance from '../api/axiosInstance'

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  // Start as loading so initial render doesn't redirect before session check completes
  isLoading: true,
  error: null,

  // Login — receives JWT via HttpOnly cookie (Fn 5.3)
  login: async (credentials) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await axiosInstance.post('/auth/login', credentials)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await axiosInstance.post('/auth/register', payload)
      set({ user: data.user, isAuthenticated: true, isLoading: false })
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed'
      set({ error: message, isLoading: false })
      return { success: false, message }
    }
  },

  // Fn 5.5 — Token Blacklisting logout
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (_) { /* ignore */ }
    set({ user: null, isAuthenticated: false, error: null })
  },

  // Fn 5.3 — Re-check current user status from server
  checkAuth: async () => {
    set({ isLoading: true })
    try {
      const { data } = await axiosInstance.get('/auth/me')
      set({ user: data.user, isAuthenticated: true, isLoading: false })
    } catch (_) {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
