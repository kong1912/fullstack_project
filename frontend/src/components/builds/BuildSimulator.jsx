// Fn 2.3 — Complex calculation logic + Fn 2.4 Zustand state
import { useMemo } from 'react'
import useBuildStore from '../../store/buildStore'

const SLOT_LABELS = {
  helm: '🪖 Helm', chest: '🧥 Chest', gloves: '🧤 Gloves',
  waist: '👖 Waist', legs: '👢 Legs',
}

// Fn 2.3 — Complex gear stat aggregation
function calcBuildStats(draft) {
  const pieces = [draft.helm, draft.chest, draft.gloves, draft.waist, draft.legs]
  const filled = pieces.filter(Boolean)
  const totalDefense = filled.reduce((sum, p) => sum + (p?.defense?.base ?? 0), 0)
  const allResistances = filled.reduce(
    (acc, p) => {
      if (!p?.resistances) return acc
      Object.entries(p.resistances).forEach(([k, v]) => {
        acc[k] = (acc[k] ?? 0) + v
      })
      return acc
    },
    {}
  )
  const skills = filled.flatMap((p) => p?.skills ?? [])
  const skillMap = skills.reduce((acc, s) => {
    acc[s.skill?.name ?? s.skillName] = (acc[s.skill?.name ?? s.skillName] ?? 0) + s.level
    return acc
  }, {})

  return { totalDefense, allResistances, skillMap, pieceCount: filled.length }
}

export default function BuildSimulator() {
  const { draft, setDraftField, resetDraft, saveBuild, isLoading } = useBuildStore()
  const stats = useMemo(() => calcBuildStats(draft), [draft])

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-mhw-gold">Build Simulator</h2>
        <div className="flex gap-2">
          <button onClick={resetDraft} className="px-4 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20 text-xs">Reset</button>
          <button onClick={saveBuild} disabled={isLoading || !draft.name}
            className="px-4 py-1 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs">
            {isLoading ? 'Saving…' : 'Save Build'}
          </button>
        </div>
      </div>

      {/* Build name */}
      <input
        value={draft.name}
        onChange={(e) => setDraftField('name', e.target.value)}
        placeholder="Build name…"
        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm"
      />

      {/* Armor slots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(SLOT_LABELS).map(([slot, label]) => (
          <div key={slot} className="space-y-1">
            <label className="text-xs text-gray-400">{label}</label>
            <div className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white transition-all backdrop-blur-sm text-sm text-gray-300 min-h-[40px] flex items-center">
              {draft[slot]?.name ?? <span className="text-gray-500">Empty</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Aggregated stats */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 space-y-2 text-sm">
        <p className="text-mhw-gold font-semibold text-xs uppercase tracking-wider">
          Calculated Stats
        </p>
        <div className="flex gap-4">
          <span className="text-gray-300">🛡 Defense: <strong className="text-white">{stats.totalDefense}</strong></span>
          <span className="text-gray-300">Pieces: <strong className="text-white">{stats.pieceCount}/5</strong></span>
        </div>
        {Object.keys(stats.skillMap).length > 0 && (
          <div>
            <p className="text-gray-400 text-xs mb-1">Skills:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(stats.skillMap).map(([name, lvl]) => (
                <span key={name} className="text-xs bg-mhw-card/60 px-2 py-0.5 rounded text-mhw-green">
                  {name} Lv.{lvl}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
