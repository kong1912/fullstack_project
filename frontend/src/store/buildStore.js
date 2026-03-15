// Fn 2.4 — Build store with Persistence (state survives page refresh via localStorage)
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'
import useSyncQueueStore from './syncQueueStore'
import { toastSuccess, toastError, toastInfo } from '../utils/toast'

const useBuildStore = create(
  persist(
    (set, get) => ({
      // Local draft build (Fn 2.4 — persisted)
      draft: {
        name: '',
        weapon: null,
        helm: null,
        chest: null,
        gloves: null,
        waist: null,
        legs: null,
        skills: [],
      },
      // Server-saved builds list
      builds: [],
      isLoading: false,
      error: null,

      setDraftField: (field, value) =>
        set((s) => ({ draft: { ...s.draft, [field]: value } })),

      resetDraft: () =>
        set({
          draft: {
            name: '', weapon: null, helm: null, chest: null,
            gloves: null, waist: null, legs: null, skills: [],
          },
        }),

      // Fetch user's builds from server
      fetchBuilds: async () => {
        set({ isLoading: true })
        try {
          const { data } = await axiosInstance.get('/builds')
          set({ builds: data.builds, isLoading: false })
        } catch (err) {
          set({ error: err.response?.data?.message, isLoading: false })
        }
      },

      // Save draft to server with optimistic UI and offline queueing
      saveBuild: async () => {
        const { draft } = get()
        set({ isLoading: true })

        // Backup previous state for robust rollback
        const previous = get().builds

        // Create an optimistic placeholder so UI is instant
        const optimisticId = `optimistic-${Date.now()}-${Math.random().toString(36).slice(2)}`
        const optimisticBuild = { ...draft, _id: optimisticId, createdAt: new Date().toISOString(), __optimistic: true }

        // Add immediately to local list
        set((s) => ({ builds: [...s.builds, optimisticBuild] }))
        // Inform user optimistically
        toastSuccess('Build added (pending confirmation)')

        try {
          // If offline, enqueue the mutation and keep optimistic item marked pending
          if (!navigator.onLine) {
            // mark optimistic item as queued so UI can reflect pending state
            set((s) => ({ builds: s.builds.map((b) => (b._id === optimisticId ? { ...b, __queued: true } : b)) }))
            useSyncQueueStore.getState().enqueue('post', '/builds', draft)
            set({ isLoading: false })
            toastInfo('You are offline — build queued for sync')
            return { success: true, queued: true }
          }

          // Online: attempt actual request
          const { data } = await axiosInstance.post('/builds', draft)

          // Replace optimistic entry with server-provided build
          set((s) => ({
            builds: s.builds.map((b) => (b._id === optimisticId ? data.build : b)),
            isLoading: false,
          }))
          toastSuccess('Build saved')

          return { success: true }
        } catch (err) {
          // On 4xx, remove optimistic and surface error. On network/server error, enqueue.
          const status = err.response?.status
          if (!navigator.onLine || !status) {
            // network/server issue: enqueue and leave optimistic item (marked queued)
            set((s) => ({ builds: s.builds.map((b) => (b._id === optimisticId ? { ...b, __queued: true } : b)) }))
            useSyncQueueStore.getState().enqueue('post', '/builds', draft)
            set({ isLoading: false })
            toastInfo('Network/server issue — build queued for background sync')
            return { success: true, queued: true }
          }

          // Client error: rollback to previous state and show message
          set({ builds: previous, error: err.response?.data?.message, isLoading: false })
          toastError('Failed to save build — changes reverted')
          return { success: false }
        }
      },

      deleteBuild: async (id) => {
        try {
          await axiosInstance.delete(`/builds/${id}`)
          set((s) => ({ builds: s.builds.filter((b) => b._id !== id) }))
        } catch (err) {
          set({ error: err.response?.data?.message })
        }
      },
    }),
    {
      name: 'mhw-build-draft',          // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ draft: state.draft }), // only persist draft
    }
  )
)

export default useBuildStore
