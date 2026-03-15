// Fn 2.4 — Zustand store for multi-step build creation form
// C2: Persists across navigation via zustand/persist middleware
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { stepSchemas } from '../context/MultiStepFormContext'

const INITIAL_DATA = {
  name: '', style: 'balanced',
  weaponId: 0, weaponName: '',
  helmId: null, chestId: null, glovesId: null, waistId: null, legsId: null,
  notes: '',
  weapon: null,
  helm: null, chest: null, gloves: null, waist: null, legs: null,
}

const useBuildFormStore = create(
  persist(
    (set, get) => ({
      data: INITIAL_DATA,
      errors: {},

      // Merge fields into data (C2: Zustand persist saves to localStorage automatically)
      updateData: (fields) =>
        set((state) => ({ data: { ...state.data, ...fields } })),

      // Validate the given step's schema, save on success, surface errors on failure
      validateAndSave: async (stepIdx, fields) => {
        try {
          const merged = { ...get().data, ...fields }
          await stepSchemas[stepIdx].parseAsync(merged)
          set({ data: merged, errors: {} })
          return true
        } catch (err) {
          const flat = {}
          err.errors?.forEach((e) => { flat[e.path[0]] = e.message })
          set({ errors: flat })
          return false
        }
      },

      reset: () => set({ data: INITIAL_DATA, errors: {} }),
    }),
    { name: 'mhw-build-draft' }  // localStorage key (C2)
  )
)

export default useBuildFormStore
