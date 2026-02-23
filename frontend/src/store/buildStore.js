// Fn 2.4 — Build store with Persistence (state survives page refresh via localStorage)
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

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

      // Save draft to server
      saveBuild: async () => {
        const { draft } = get()
        set({ isLoading: true })
        try {
          const { data } = await axiosInstance.post('/builds', draft)
          set((s) => ({
            builds: [...s.builds, data.build],
            isLoading: false,
          }))
          return { success: true }
        } catch (err) {
          set({ error: err.response?.data?.message, isLoading: false })
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
