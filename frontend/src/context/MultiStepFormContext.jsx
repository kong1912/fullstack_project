// Fn 6.3 — Multi-step Form Context: Centralized State + Persistence across steps
import { createContext, useContext, useState, useCallback } from 'react'
import { z } from 'zod'

const MultiStepContext = createContext(null)

// Step schemas for Zod validation (Fn 6.3)
export const stepSchemas = [
  // Step 0 — Basic info
  z.object({
    name:  z.string().min(3, 'Build name must be at least 3 characters'),
    style: z.enum(['aggressive', 'defensive', 'balanced', 'support']),
  }),
  // Step 1 — Weapon + Armor (combined)
  z.object({
    weaponId:   z.number().int().min(1, 'Select a weapon'),
    weaponName: z.string().optional(),
    helmId:     z.number().int().min(1).nullable().optional(),
    chestId:    z.number().int().min(1).nullable().optional(),
    glovesId:   z.number().int().min(1).nullable().optional(),
    waistId:    z.number().int().min(1).nullable().optional(),
    legsId:     z.number().int().min(1).nullable().optional(),
  }),
  // Step 2 — Finalize
  z.object({
    notes: z.string().max(500, 'Notes max 500 characters').optional(),
  }),
]

const INITIAL_DATA = {
  name: '', style: 'balanced',
  weaponId: 0, weaponName: '',
  helmId: null, chestId: null, glovesId: null, waistId: null, legsId: null,
  notes: '',
}

const STORAGE_KEY = 'mhw-multistep-draft'

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : INITIAL_DATA
  } catch {
    return INITIAL_DATA
  }
}

export function MultiStepProvider({ children, onSubmit }) {
  const [step, setStep]    = useState(0)
  const [data, setData]    = useState(loadPersisted)
  const [errors, setErrors] = useState({})

  const updateData = useCallback((fields) => {
    setData((prev) => {
      const next = { ...prev, ...fields }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) // Fn 6.3 persistence
      return next
    })
  }, [])

  const nextStep = useCallback(async (fields) => {
    try {
      const parsed = await stepSchemas[step].parseAsync({ ...data, ...fields })
      updateData(parsed)
      setErrors({})
      setStep((s) => s + 1)
      return true
    } catch (err) {
      const flat = {}
      err.errors?.forEach((e) => { flat[e.path[0]] = e.message })
      setErrors(flat)
      return false
    }
  }, [step, data, updateData])

  const prevStep = useCallback(() => setStep((s) => Math.max(s - 1, 0)), [])

  const reset = useCallback(() => {
    setData(INITIAL_DATA)
    setStep(0)
    setErrors({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const submit = useCallback(async (fields = {}) => {
    const finalData = { ...data, ...fields }
    if (onSubmit) await onSubmit(finalData)
    reset()
  }, [data, onSubmit, reset])

  return (
    <MultiStepContext.Provider
      value={{ step, data, errors, updateData, nextStep, prevStep, submit, reset,
               totalSteps: stepSchemas.length }}
    >
      {children}
    </MultiStepContext.Provider>
  )
}

export function useMultiStep() {
  const ctx = useContext(MultiStepContext)
  if (!ctx) throw new Error('useMultiStep must be used inside <MultiStepProvider>')
  return ctx
}
