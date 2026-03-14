// Fn 6.3 — Context API + Multi-step form + Searchable gear pickers + Stats
import { useState, useEffect, useRef, useCallback } from 'react'
import { useMultiStep } from '../../context/MultiStepFormContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stepSchemas } from '../../context/MultiStepFormContext'
import { fetchWeapons, fetchArmor } from '../../api/mhwApi'

const WEAPON_TYPES = [
  'great-sword', 'sword-and-shield', 'dual-blades', 'long-sword',
  'hammer', 'hunting-horn', 'lance', 'gunlance', 'switch-axe', 'charge-blade',
  'insect-glaive', 'bow', 'heavy-bowgun', 'light-bowgun',
]
const ARMOR_SLOTS = ['head', 'chest', 'gloves', 'waist', 'legs']

// ─── Searchable combobox ─────────────────────────────────────────────────────
function SearchableSelect({ items, value, onChange, placeholder, isLoading, onFirstOpen, renderStats, renderListStats }) {
  const [query, setQuery] = useState('')
  const [open,  setOpen]  = useState(false)
  const ref         = useRef(null)
  const firstOpened = useRef(false)

  const selected = value != null ? (items.find(i => i.id === value) ?? null) : null

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const handleFocus = () => {
    if (!firstOpened.current && onFirstOpen) { firstOpened.current = true; onFirstOpen() }
    setOpen(true)
  }

  const filtered = items
    .filter(i => !query || i.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 80)

  if (selected) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-mhw-accent/40 rounded-lg">
          <span className="flex-1 text-sm text-white truncate">{selected.name}</span>
          <button type="button" onClick={() => onChange(null)}
            className="shrink-0 text-xs text-gray-400 hover:text-white px-1">✕ change</button>
        </div>
        {renderStats && renderStats(selected)}
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={handleFocus}
        placeholder={isLoading ? 'Loading…' : placeholder}
        disabled={isLoading}
        className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all text-sm"
      />
      {open && (
        <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto bg-mhw-card border border-white/20 rounded-lg shadow-2xl">
          {isLoading
            ? <li className="px-3 py-2 text-gray-400 text-sm">Loading…</li>
            : filtered.length === 0
              ? <li className="px-3 py-2 text-gray-500 text-sm">No results{query ? ` for "${query}"` : ''}</li>
              : filtered.map(item => (
                <li key={item.id}>
                  <button type="button" tabIndex={-1}
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => { onChange(item.id); setQuery(''); setOpen(false) }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="shrink-0 text-xs text-gray-500 capitalize">
                        {item.type ? item.type.replace(/-/g, ' ') : (item.rank || '')}
                      </span>
                    </div>
                    {renderListStats && (
                      <div className="mt-1">{renderListStats(item)}</div>
                    )}
                  </button>
                </li>
              ))
          }
        </ul>
      )}
    </div>
  )
}

// ─── Compact list-row stats (shown inside each dropdown option) ───────────────
function WeaponListStats({ item: w }) {
  if (!w) return null
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
      <span>ATK <span className="text-gray-300">{w.attack?.display}</span></span>
      <span>Raw <span className="text-gray-300">{w.attack?.raw}</span></span>
      <span className="text-mhw-gold">★{w.rarity}</span>
      {w.damageType && <span className="capitalize text-gray-400">{w.damageType}</span>}
      {w.attributes?.affinity != null && w.attributes.affinity !== 0 && (
        <span className={w.attributes.affinity > 0 ? 'text-green-400' : 'text-red-400'}>
          {w.attributes.affinity > 0 ? '+' : ''}{w.attributes.affinity}%
        </span>
      )}
      {w.elements?.filter(el => !el.hidden).map((el, i) => (
        <span key={i} className="text-sky-400 capitalize">{el.type} {el.damage}</span>
      ))}
      {w.slots?.length > 0 && (
        <span className="text-yellow-400">{'◯'.repeat(w.slots.length)}</span>
      )}
    </div>
  )
}

function ArmorListStats({ item: a }) {
  if (!a) return null
  const nonZeroRes = Object.entries(a.resistances || {}).filter(([, v]) => v !== 0)
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500">
      <span>DEF <span className="text-sky-400">{a.defense?.base}</span></span>
      <span className="text-mhw-gold">★{a.rarity}</span>
      {nonZeroRes.map(([el, val]) => (
        <span key={el} className={`capitalize ${RESIST_COLORS[el] || 'text-gray-300'}`}>
          {el} {val > 0 ? '+' : ''}{val}
        </span>
      ))}
      {a.skills?.map(s => (
        <span key={s.id} className="text-green-400">{s.skillName} {s.level}</span>
      ))}
    </div>
  )
}

// ─── Weapon stats card ────────────────────────────────────────────────────────
function WeaponStats({ weapon }) {
  if (!weapon) return null
  return (
    <div className="mt-1.5 p-3 bg-white/5 border border-white/10 rounded-lg text-xs space-y-1.5">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-gray-400">ATK <span className="text-white font-semibold">{weapon.attack?.display}</span></span>
        <span className="text-gray-400">Raw <span className="text-white">{weapon.attack?.raw}</span></span>
        <span className="text-gray-400">Rarity <span className="text-mhw-gold">★{weapon.rarity}</span></span>
        <span className="text-gray-400 capitalize">Damage <span className="text-white">{weapon.damageType}</span></span>
        {weapon.elderseal && (
          <span className="text-gray-400">Elderseal <span className="text-purple-400 capitalize">{weapon.elderseal}</span></span>
        )}
      </div>
      {weapon.elements?.length > 0 && (
        <div className="flex flex-wrap gap-x-3">
          {weapon.elements.map((el, i) => (
            <span key={i} className="capitalize text-gray-400">
              {el.type} <span className="text-sky-400">{el.damage}{el.hidden ? ' ⦿' : ''}</span>
            </span>
          ))}
        </div>
      )}
      {weapon.slots?.length > 0 && (
        <span className="text-gray-400">Slots <span className="text-yellow-400">{'◯'.repeat(weapon.slots.length)}</span></span>
      )}
    </div>
  )
}

// ─── Armor stats card ─────────────────────────────────────────────────────────
const RESIST_COLORS = {
  fire: 'text-red-400', water: 'text-blue-400',
  thunder: 'text-yellow-300', ice: 'text-cyan-400', dragon: 'text-purple-400',
}

function ArmorStats({ armor }) {
  if (!armor) return null
  const nonZeroRes = Object.entries(armor.resistances || {}).filter(([, v]) => v !== 0)
  return (
    <div className="mt-1.5 p-3 bg-white/5 border border-white/10 rounded-lg text-xs space-y-1.5">
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-gray-400">DEF <span className="text-white font-semibold">{armor.defense?.base}</span>
          <span className="text-gray-500"> (max {armor.defense?.max})</span>
        </span>
        <span className="text-gray-400">Rarity <span className="text-mhw-gold">★{armor.rarity}</span></span>
        <span className="text-gray-400 capitalize">Rank <span className="text-white">{armor.rank}</span></span>
      </div>
      {nonZeroRes.length > 0 && (
        <div className="flex flex-wrap gap-x-3">
          {nonZeroRes.map(([el, val]) => (
            <span key={el} className={`capitalize ${RESIST_COLORS[el] || 'text-gray-300'}`}>
              {el} {val > 0 ? '+' : ''}{val}
            </span>
          ))}
        </div>
      )}
      {armor.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {armor.skills.map(s => (
            <span key={s.id} className="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-xs">
              {s.skillName} Lv{s.level}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Stat box helper ─────────────────────────────────────────────────────────
function StatBox({ label, value, sub, color, cap }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 space-y-0.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-base font-bold ${color ?? 'text-white'} ${cap ? 'capitalize' : ''}`}>{value ?? '\u2014'}</p>
      {sub && <p className="text-xs text-gray-600">{sub}</p>}
    </div>
  )
}

// ─── Build stats panel ────────────────────────────────────────────────────────
function BuildStatsPanel({ weapon, armorPieces }) {
  const pieces = armorPieces.filter(Boolean)
  if (!weapon && pieces.length === 0) return null

  const totalDef    = pieces.reduce((s, a) => s + (a.defense?.base || 0), 0)
  const totalDefMax = pieces.reduce((s, a) => s + (a.defense?.max  || 0), 0)

  const RES_KEYS = ['fire', 'water', 'thunder', 'ice', 'dragon']
  const totalRes = RES_KEYS.reduce((acc, k) => {
    acc[k] = pieces.reduce((s, a) => s + (a.resistances?.[k] || 0), 0)
    return acc
  }, {})
  const nonZeroRes = RES_KEYS.filter(k => totalRes[k] !== 0)

  const weaponSlots = weapon?.slots?.length || 0
  const armorSlots  = pieces.reduce((s, a) => s + (a.slots?.length || 0), 0)

  const skillMap = {}
  for (const a of pieces) {
    for (const sk of (a.skills || [])) {
      skillMap[sk.skillName] = (skillMap[sk.skillName] || 0) + sk.level
    }
  }
  const skills = Object.entries(skillMap).sort((a, b) => b[1] - a[1])

  return (
    <div className="p-4 bg-mhw-panel border border-mhw-accent/20 rounded-xl space-y-4">
      <h3 className="text-sm font-bold text-mhw-gold">Build Stats Summary</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {weapon && (
          <>
            <StatBox label="Attack" value={weapon.attack?.display} sub={`raw ${weapon.attack?.raw}`} color="text-red-400" />
            <StatBox label="Damage" value={weapon.damageType} color="text-orange-400" cap />
          </>
        )}
        <StatBox label="Total Defense" value={totalDef || '\u2014'} sub={pieces.length ? `max ${totalDefMax}` : null} color="text-sky-400" />
        <StatBox label="Total Slots" value={weaponSlots + armorSlots}
          sub={pieces.length ? `${weaponSlots}W + ${armorSlots}A` : `${weaponSlots} (weapon)`} color="text-yellow-400" />
      </div>

      {nonZeroRes.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Elemental Resistance</p>
          <div className="flex flex-wrap gap-3">
            {nonZeroRes.map(k => (
              <span key={k} className={`text-xs font-semibold capitalize ${RESIST_COLORS[k] || 'text-gray-300'}`}>
                {k} {totalRes[k] > 0 ? '+' : ''}{totalRes[k]}
              </span>
            ))}
          </div>
        </div>
      )}

      {weapon?.elements?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Weapon Elements</p>
          <div className="flex flex-wrap gap-2">
            {weapon.elements.map((el, i) => (
              <span key={i} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 rounded text-xs capitalize">
                {el.type} {el.damage}{el.hidden ? ' \u29bf' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Active Skills ({skills.length})</p>
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

// ─── Step 1: Basic Info ───────────────────────────────────────────────────────
function Step1() {
  const { data, nextStep } = useMultiStep()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(stepSchemas[0]),
    defaultValues: { name: data.name, style: data.style },
  })
  return (
    <form onSubmit={handleSubmit(nextStep)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-gray-300">Build Name</label>
        <input {...register('name')}
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all"
          placeholder="My Ultimate Build" />
        {errors.name && <p className="text-xs text-mhw-accent">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-300">Play Style</label>
        <select {...register('style')}
          className="w-full px-4 py-2 bg-mhw-dark border border-white/20 rounded-lg text-white focus:outline-none focus:border-mhw-accent transition-all">
          {['aggressive', 'defensive', 'balanced', 'support'].map(s => (
            <option key={s} value={s} className="bg-mhw-dark capitalize">{s}</option>
          ))}
        </select>
      </div>
      <button type="submit"
        className="w-full px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all">
        Next →
      </button>
    </form>
  )
}

// ─── Step 2: Weapon & Armor ───────────────────────────────────────────────────
function Step2() {
  const { data, nextStep, prevStep } = useMultiStep()

  const [weaponType,     setWeaponType]     = useState('great-sword')
  const [weapons,        setWeapons]        = useState([])
  const [weaponsLoading, setWeaponsLoading] = useState(false)
  const [weaponId,       setWeaponId]       = useState(data.weaponId > 0 ? data.weaponId : null)

  const [armorBySlot,  setArmorBySlot]  = useState({})
  const [armorLoading, setArmorLoading] = useState(() =>
    Object.fromEntries(ARMOR_SLOTS.map(s => [s, true]))
  )

  const [armorIds, setArmorIds] = useState({
    head: null, chest: null, gloves: null, waist: null, legs: null,
  })
  const [gearError, setGearError] = useState(null)

  // Init progress
  const INIT_TOTAL = ARMOR_SLOTS.length + 1   // 5 armor slots + 1 weapon fetch
  const [initCount,  setInitCount]  = useState(0)
  const [initStatus, setInitStatus] = useState('Connecting to MHW database…')
  const initReady = initCount >= INIT_TOTAL
  const isFirstWeaponLoad = useRef(true)

  // Load everything in parallel on mount
  useEffect(() => {
    let cancelled = false
    const done = (msg) => {
      if (!cancelled) { setInitCount(c => c + 1); setInitStatus(msg) }
    }

    setWeaponsLoading(true)
    fetchWeapons({ q: JSON.stringify({ type: 'great-sword' }) })
      .then(({ data: d }) => { if (!cancelled) setWeapons(d) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setWeaponsLoading(false); done('Weapons loaded') })

    ARMOR_SLOTS.forEach(slot => {
      fetchArmor({ q: JSON.stringify({ type: slot }) })
        .then(({ data: d }) => { if (!cancelled) setArmorBySlot(prev => ({ ...prev, [slot]: d })) })
        .catch(() => {})
        .finally(() => {
          if (!cancelled) {
            setArmorLoading(prev => ({ ...prev, [slot]: false }))
            done(`${slot.charAt(0).toUpperCase() + slot.slice(1)} armor loaded`)
          }
        })
    })
    return () => { cancelled = true }
  }, [])

  // Reload weapons when type changes — skip the very first render (handled above)
  useEffect(() => {
    if (isFirstWeaponLoad.current) { isFirstWeaponLoad.current = false; return }
    let cancelled = false
    setWeaponsLoading(true)
    setWeaponId(null)
    fetchWeapons({ q: JSON.stringify({ type: weaponType }) })
      .then(({ data: d }) => { if (!cancelled) setWeapons(d) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setWeaponsLoading(false) })
    return () => { cancelled = true }
  }, [weaponType])

  const handleWeaponChange = useCallback((id) => {
    setWeaponId(id)
    if (id) setGearError(null)
  }, [])

  const selectedWeapon      = weapons.find(w => w.id === weaponId) ?? null
  const selectedArmorPieces  = ARMOR_SLOTS.map(slot =>
    (armorBySlot[slot] || []).find(a => a.id === armorIds[slot]) ?? null
  )

  // Map mhw-db API objects to backend schema shape
  const mapWeapon = (w) => !w ? null : ({
    mhwId:      w.id,
    name:       w.name,
    weaponType: w.type,   // renamed to avoid Mongoose type-key clash
    rarity:     w.rarity,
    attack:     { display: w.attack?.display ?? 0, raw: w.attack?.raw ?? 0 },
    damageType: w.damageType ?? null,
    elderseal:  w.elderseal  ?? null,
    elements:   (w.elements || []).map(({ type, damage, hidden }) => ({ type, damage, hidden: !!hidden })),
    slots:      (w.slots    || []).map(s => ({ rank: s.rank })),
    attributes: { affinity: w.attributes?.affinity ?? 0 },
  })

  const mapArmor = (a) => !a ? null : ({
    mhwId:       a.id,
    name:        a.name,
    type:        a.type,
    rank:        a.rank,
    rarity:      a.rarity,
    defense:     { base: a.defense?.base ?? 0, max: a.defense?.max ?? 0, augmented: a.defense?.augmented ?? 0 },
    resistances: { fire: a.resistances?.fire ?? 0, water: a.resistances?.water ?? 0,
                   thunder: a.resistances?.thunder ?? 0, ice: a.resistances?.ice ?? 0,
                   dragon: a.resistances?.dragon ?? 0 },
    slots:       (a.slots  || []).map(s => ({ rank: s.rank })),
    skills:      (a.skills || []).map(s => ({ skillName: s.skillName, level: s.level })),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!weaponId) { setGearError('Please select a weapon'); return }
    const [helmArmor, chestArmor, glovesArmor, waistArmor, legsArmor] = selectedArmorPieces
    const ok = await nextStep({
      weaponId,
      weaponName: selectedWeapon?.name || '',
      helmId:   armorIds.head   ?? null,
      chestId:  armorIds.chest  ?? null,
      glovesId: armorIds.gloves ?? null,
      waistId:  armorIds.waist  ?? null,
      legsId:   armorIds.legs   ?? null,
      // Full objects for backend persistence
      weapon: mapWeapon(selectedWeapon),
      helm:   mapArmor(helmArmor),
      chest:  mapArmor(chestArmor),
      gloves: mapArmor(glovesArmor),
      waist:  mapArmor(waistArmor),
      legs:   mapArmor(legsArmor),
    })
    if (!ok) setGearError('Please check your selections')
  }

  if (!initReady) {
    const pct = Math.round((initCount / INIT_TOTAL) * 100)
    return (
      <div className="py-12 flex flex-col items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-mhw-accent border-t-transparent animate-spin" />
          <span className="text-sm font-semibold text-mhw-gold">Loading gear data…</span>
        </div>
        <div className="w-72 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-mhw-accent rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500">{initStatus}</p>
        <p className="text-xs text-gray-700">{initCount} / {INIT_TOTAL} complete</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Weapon ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-mhw-gold">
          Weapon <span className="text-mhw-accent">*</span>
        </h3>
        <div className="flex flex-wrap gap-1">
          {WEAPON_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setWeaponType(t)}
              className={`text-xs px-2 py-0.5 rounded-full capitalize transition-colors ${
                weaponType === t ? 'bg-mhw-accent text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}>
              {t.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
        <SearchableSelect
          items={weapons}
          value={weaponId}
          onChange={handleWeaponChange}
          placeholder="Search weapon by name…"
          isLoading={weaponsLoading}
          renderListStats={w => <WeaponListStats item={w} />}
          renderStats={w => <WeaponStats weapon={w} />}
        />
        {gearError && <p className="text-xs text-mhw-accent">{gearError}</p>}
      </section>

      {/* ── Armor ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-mhw-gold">
          Armor <span className="text-gray-500 font-normal text-xs ml-1">optional</span>
        </h3>
        {ARMOR_SLOTS.map(slot => (
          <div key={slot} className="space-y-1">
            <label className="text-xs text-gray-400 capitalize font-medium">{slot}</label>
            <SearchableSelect
              items={armorBySlot[slot] || []}
              value={armorIds[slot]}
              onChange={id => setArmorIds(prev => ({ ...prev, [slot]: id }))}
              placeholder={`Search ${slot} armor…`}
              isLoading={!!armorLoading[slot]}
              renderListStats={a => <ArmorListStats item={a} />}
              renderStats={a => <ArmorStats armor={a} />}
            />
          </div>
        ))}
      </section>

      {/* ── Combined stats ── */}
      <BuildStatsPanel weapon={selectedWeapon} armorPieces={selectedArmorPieces} />

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={prevStep}
          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20">
          ← Back
        </button>
        <button type="submit"
          className="flex-1 px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all">
          Next →
        </button>
      </div>
    </form>
  )
}

// ─── Step 3: Finalize ─────────────────────────────────────────────────────────
function Step3() {
  const { data, submit, prevStep } = useMultiStep()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(stepSchemas[2]),
    defaultValues: { notes: data.notes },
  })
  return (
    <form onSubmit={handleSubmit(fields => submit(fields))} className="space-y-4">
      {/* Summary */}
      <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm space-y-1">
        <p><span className="text-gray-500">Name </span><span className="text-white">{data.name}</span></p>
        <p><span className="text-gray-500">Style </span><span className="text-white capitalize">{data.style}</span></p>
        {data.weaponName && (
          <p><span className="text-gray-500">Weapon </span><span className="text-mhw-gold">{data.weaponName}</span></p>
        )}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-300">
          Notes <span className="text-gray-500 text-xs">(optional)</span>
        </label>
        <textarea {...register('notes')} rows={3}
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent transition-all resize-none text-sm"
          placeholder="Strategy, tips, target monster…" />
        {errors.notes && <p className="text-xs text-mhw-accent">{errors.notes.message}</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={prevStep}
          className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all border border-white/20">
          ← Back
        </button>
        <button type="submit"
          className="flex-1 px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all">
          💾 Save Build
        </button>
      </div>
    </form>
  )
}

// ─── Step registry ────────────────────────────────────────────────────────────
const STEPS = [
  { title: 'Basic Info',     component: Step1 },
  { title: 'Weapon & Armor', component: Step2 },
  { title: 'Finalize',       component: Step3 },
]

// ─── Container ────────────────────────────────────────────────────────────────
export default function MultiStepForm() {
  const { step, totalSteps } = useMultiStep()
  const CurrentStep = STEPS[step]?.component

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Step {step + 1} of {totalSteps}</span>
          <span className="text-mhw-gold">{STEPS[step]?.title}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-mhw-accent rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <div key={s.title} className={`text-xs ${i <= step ? 'text-mhw-accent' : 'text-gray-600'}`}>
              {i < step ? '✓' : i === step ? '●' : '○'}
            </div>
          ))}
        </div>
      </div>

      {CurrentStep && <CurrentStep />}
    </div>
  )
}
