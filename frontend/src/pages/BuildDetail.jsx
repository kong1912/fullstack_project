import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/formatters'

// ── Helpers ──────────────────────────────────────────────────────────────────
const RESIST_COLORS = {
  fire: 'text-red-400', water: 'text-blue-400',
  thunder: 'text-yellow-300', ice: 'text-cyan-400', dragon: 'text-purple-400',
}
const ARMOR_SLOTS = ['helm', 'chest', 'gloves', 'waist', 'legs']

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-bold text-mhw-gold uppercase tracking-widest">{title}</h2>
      {children}
    </div>
  )
}

function StatPill({ label, value, color }) {
  return (
    <span className="flex items-center gap-1 text-xs bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color ?? 'text-white'}`}>{value}</span>
    </span>
  )
}

// ── Weapon card ───────────────────────────────────────────────────────────────
function WeaponCard({ weapon }) {
  if (!weapon) return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-600 italic">No weapon selected</div>
  )
  const affinity = weapon.attributes?.affinity ?? 0
  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="font-bold text-white text-base">{weapon.name}</p>
        <span className="text-mhw-gold text-sm">★{weapon.rarity}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <StatPill label="ATK" value={weapon.attack?.display} color="text-red-400" />
        <StatPill label="Raw" value={weapon.attack?.raw} />
        {weapon.damageType && <StatPill label="Type" value={weapon.damageType} color="text-orange-400" />}
        {affinity !== 0 && (
          <StatPill label="Affinity" value={`${affinity > 0 ? '+' : ''}${affinity}%`}
            color={affinity > 0 ? 'text-green-400' : 'text-red-400'} />
        )}
        {weapon.elderseal && <StatPill label="Elderseal" value={weapon.elderseal} color="text-purple-400" />}
        {weapon.slots?.length > 0 && (
          <StatPill label="Slots" value={'◯'.repeat(weapon.slots.length)} color="text-yellow-400" />
        )}
      </div>
      {weapon.elements?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {weapon.elements.map((el, i) => (
            <span key={i} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded text-xs capitalize">
              {el.type} {el.damage}{el.hidden ? ' ⦿' : ''}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-600 capitalize">{weapon.weaponType?.replace(/-/g, ' ')}</p>
    </div>
  )
}

// ── Armor piece card ──────────────────────────────────────────────────────────
function ArmorCard({ slot, armor }) {
  if (!armor) return (
    <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
      <p className="text-xs text-gray-500 capitalize mb-1">{slot}</p>
      <p className="text-sm text-gray-700 italic">Empty</p>
    </div>
  )
  const nonZeroRes = Object.entries(armor.resistances || {}).filter(([, v]) => v !== 0)
  return (
    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
      <div className="flex items-center justify-between gap-1 flex-wrap">
        <p className="text-xs text-gray-400 capitalize font-semibold">{slot}</p>
        <span className="text-mhw-gold text-xs">★{armor.rarity}</span>
      </div>
      <p className="text-sm text-white font-medium">{armor.name}</p>
      <div className="flex flex-wrap gap-1.5">
        <StatPill label="DEF" value={armor.defense?.base} color="text-sky-400" />
        {nonZeroRes.map(([el, val]) => (
          <StatPill key={el} label={el} value={`${val > 0 ? '+' : ''}${val}`} color={RESIST_COLORS[el]} />
        ))}
        {armor.slots?.length > 0 && (
          <StatPill label="Slots" value={'◯'.repeat(armor.slots.length)} color="text-yellow-400" />
        )}
      </div>
      {armor.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {armor.skills.map((s, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
              {s.skillName} Lv{s.level}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Build totals panel ────────────────────────────────────────────────────────
function BuildTotals({ build }) {
  const pieces = ARMOR_SLOTS.map(s => build[s]).filter(Boolean)
  const totalDef    = pieces.reduce((n, a) => n + (a.defense?.base ?? 0), 0)
  const totalDefMax = pieces.reduce((n, a) => n + (a.defense?.max  ?? 0), 0)
  const weaponSlots = build.weapon?.slots?.length ?? 0
  const armorSlots  = pieces.reduce((n, a) => n + (a.slots?.length ?? 0), 0)

  const RES = ['fire', 'water', 'thunder', 'ice', 'dragon']
  const totalRes = RES.reduce((acc, k) => {
    acc[k] = pieces.reduce((n, a) => n + (a.resistances?.[k] ?? 0), 0)
    return acc
  }, {})
  const nonZeroRes = RES.filter(k => totalRes[k] !== 0)

  const skillMap = {}
  pieces.forEach(a => (a.skills || []).forEach(s => {
    skillMap[s.skillName] = (skillMap[s.skillName] ?? 0) + s.level
  }))
  const skills = Object.entries(skillMap).sort((a, b) => b[1] - a[1])

  return (
    <div className="p-4 bg-mhw-panel border border-mhw-accent/20 rounded-xl space-y-4">
      <div className="flex flex-wrap gap-2">
        {build.weapon && (
          <>
            <StatPill label="ATK" value={build.weapon.attack?.display} color="text-red-400" />
            <StatPill label="Raw" value={build.weapon.attack?.raw} />
          </>
        )}
        <StatPill label="Total DEF" value={totalDef || '—'} color="text-sky-400" />
        {totalDefMax > 0 && <StatPill label="Max DEF" value={totalDefMax} color="text-sky-300" />}
        <StatPill label="Total Slots" value={weaponSlots + armorSlots} color="text-yellow-400" />
      </div>

      {nonZeroRes.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-1.5">Elemental Resistance</p>
          <div className="flex flex-wrap gap-2">
            {nonZeroRes.map(k => (
              <StatPill key={k} label={k} value={`${totalRes[k] > 0 ? '+' : ''}${totalRes[k]}`}
                color={RESIST_COLORS[k]} />
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <p className="text-xs text-gray-600 mb-1.5">Active Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map(([name, level]) => (
              <span key={name} className="px-2 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
                {name} Lv{level}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BuildDetail() {
  const { id } = useParams()
  const [build,     setBuild]     = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)

  useEffect(() => {
    axiosInstance.get(`/builds/${id}`)
      .then(({ data }) => { setBuild(data.build); setIsLoading(false) })
      .catch((err) => { setError(err.response?.data?.message ?? err.message); setIsLoading(false) })
  }, [id])

  if (isLoading) return <LoadingSpinner text="Loading build…" />
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <p className="text-mhw-accent mb-4">⚠ {error}</p>
      <Link to="/builds" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20">← My Builds</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/builds" className="text-gray-400 hover:text-white text-sm">← My Builds</Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-mhw-gold">{build.name}</h1>
          {build.style && (
            <span className="text-sm capitalize text-mhw-green">{build.style} style</span>
          )}
        </div>
        <span className="text-xs text-gray-500">{formatDate(build.createdAt)}</span>
      </div>

      {/* Build totals */}
      <Section title="📊 Build Summary">
        <BuildTotals build={build} />
      </Section>

      {/* Weapon */}
      <Section title="⚔ Weapon">
        <WeaponCard weapon={build.weapon} />
      </Section>

      {/* Armor */}
      <Section title="🛡 Armor">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ARMOR_SLOTS.map(slot => (
            <ArmorCard key={slot} slot={slot} armor={build[slot]} />
          ))}
        </div>
      </Section>

      {/* Notes */}
      {build.notes && (
        <Section title="📝 Notes">
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">
            {build.notes}
          </div>
        </Section>
      )}
    </div>
  )
}
