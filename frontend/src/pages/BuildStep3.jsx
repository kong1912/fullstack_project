// Fn 2.4 — C5: Full data review before submit; C2: reads all persisted Zustand state
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stepSchemas } from '../context/MultiStepFormContext'
import useBuildFormStore from '../store/useBuildFormStore'
import axiosInstance from '../api/axiosInstance'

const RESIST_COLORS = { fire: 'text-red-400', water: 'text-blue-400', thunder: 'text-yellow-400', ice: 'text-sky-300', dragon: 'text-purple-400' }
const ARMOR_LABELS  = { helm: 'Helm', chest: 'Chest', gloves: 'Gloves', waist: 'Waist', legs: 'Legs' }

export default function BuildStep3() {
  const { data, reset } = useBuildFormStore()
  const navigate = useNavigate()
  const [saving,     setSaving]    = useState(false)
  const [saveError,  setSaveError] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(stepSchemas[2]),
    // C2: restore draft notes from Zustand
    defaultValues: { notes: data.notes },
  })

  const onSubmit = async (fields) => {
    setSaveError(null)
    setSaving(true)
    try {
      await axiosInstance.post('/builds', { ...data, notes: fields.notes })
      reset()
      navigate('/builds')
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || 'Failed to save build')
    } finally {
      setSaving(false)
    }
  }

  // Collect equipped armor pieces for summary
  const armorPieces = Object.entries(ARMOR_LABELS)
    .map(([key, label]) => ({ label, piece: data[key] }))
    .filter(({ piece }) => piece)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* ── C5: Full data review ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-mhw-gold">Review Your Build</h3>

        {/* Step 1 summary */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm space-y-1.5">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Basic Info</p>
          <p>
            <span className="text-gray-400">Name  </span>
            <span className="text-white font-medium">{data.name}</span>
          </p>
          <p>
            <span className="text-gray-400">Style </span>
            <span className="text-white capitalize">{data.style}</span>
          </p>
        </div>

        {/* Step 2 summary */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Gear Selection</p>

          {data.weapon ? (
            <div className="space-y-0.5">
              <p className="text-xs text-gray-500">Weapon</p>
              <p className="text-mhw-gold font-medium">{data.weapon.name}</p>
              <p className="text-xs text-gray-400 capitalize">
                {data.weapon.weaponType?.replace(/-/g, ' ')}
                {data.weapon.attack?.display ? ` · ATK ${data.weapon.attack.display}` : ''}
                {data.weapon.attributes?.affinity ? ` · Affinity ${data.weapon.attributes.affinity}%` : ''}
              </p>
              {data.weapon.elements?.length > 0 && (
                <div className="flex gap-2 mt-0.5">
                  {data.weapon.elements.map((el, i) => (
                    <span key={i} className={`text-xs capitalize ${RESIST_COLORS[el.type] || 'text-gray-300'}`}>
                      {el.type} {el.damage}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No weapon selected</p>
          )}

          {armorPieces.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">Armor</p>
              {armorPieces.map(({ label, piece }) => (
                <div key={label} className="flex items-baseline justify-between">
                  <span className="text-xs text-gray-500 w-14">{label}</span>
                  <span className="text-xs text-white flex-1">{piece.name}</span>
                  <span className="text-xs text-sky-400">DEF {piece.defense?.base}</span>
                </div>
              ))}
            </div>
          )}
          {armorPieces.length === 0 && (
            <p className="text-xs text-gray-500 italic">No armor selected</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-sm text-gray-300">
          Notes <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent transition-all resize-none text-sm"
          placeholder="Strategy, tips, target monster…"
        />
        {errors.notes && <p className="text-xs text-mhw-accent">{errors.notes.message}</p>}
      </div>

      {saveError && <p className="text-sm text-red-400">⚠ {saveError}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => navigate('/builds/create/step2')}
          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 px-4 py-2 bg-mhw-accent hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-all"
        >
          {saving ? 'Saving…' : '💾 Save Build'}
        </button>
      </div>
    </form>
  )
}
