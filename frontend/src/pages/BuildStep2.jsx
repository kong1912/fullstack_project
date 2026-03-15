// Fn 2.4 — C2: Zustand data persists when going back; C4: weapon required validation
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchWeapons, fetchArmor } from '../api/mhwApi'
import useBuildFormStore from '../store/useBuildFormStore'
import {
  WEAPON_TYPES, ARMOR_SLOTS,
  SearchableSelect, WeaponListStats, ArmorListStats, WeaponStats, ArmorStats, BuildStatsPanel,
  mapWeapon, mapArmor,
} from '../components/forms/MultiStepForm'

// Module-level cache: survives component unmount so navigating back skips re-fetching
const _gearCache = {
  weaponsByType: {},  // { 'great-sword': [...], ... }
  armorBySlot: {},    // { head: [...], chest: [...], ... }
}

export default function BuildStep2() {
  const { data, validateAndSave } = useBuildFormStore()
  const navigate = useNavigate()

  // Restore the previously selected weapon type so the right list is loaded
  const [weaponType,     setWeaponType]     = useState(data.weapon?.weaponType ?? 'great-sword')
  // Initialize directly from cache so weapon shows on first render (no blank flash)
  const [weapons,        setWeapons]        = useState(() => {
    const type = data.weapon?.weaponType ?? 'great-sword'
    return _gearCache.weaponsByType[type] ?? []
  })
  const [weaponsLoading, setWeaponsLoading] = useState(false)
  // C2: restore previously chosen weapon from Zustand store
  const [weaponId, setWeaponId] = useState(data.weaponId > 0 ? data.weaponId : null)

  // Initialize directly from cache so armor shows on first render (no blank flash)
  const [armorBySlot,  setArmorBySlot]  = useState(() => {
    const pre = {}
    for (const slot of ARMOR_SLOTS) {
      if (_gearCache.armorBySlot[slot]) pre[slot] = _gearCache.armorBySlot[slot]
    }
    return pre
  })
  const [armorLoading, setArmorLoading] = useState(() =>
    Object.fromEntries(ARMOR_SLOTS.map((s) => [s, !_gearCache.armorBySlot[s]]))
  )
  // C2: restore previously chosen armor from Zustand store
  const [armorIds, setArmorIds] = useState({
    head:   data.helmId   ?? null,
    chest:  data.chestId  ?? null,
    gloves: data.glovesId ?? null,
    waist:  data.waistId  ?? null,
    legs:   data.legsId   ?? null,
  })
  const [gearError, setGearError] = useState(null)

  const INIT_TOTAL = ARMOR_SLOTS.length + 1
  const [initCount,  setInitCount]  = useState(() => {
    // If everything is already cached, start at INIT_TOTAL so loading screen is skipped
    const restoredType  = data.weapon?.weaponType ?? 'great-sword'
    const weaponsCached = !!_gearCache.weaponsByType[restoredType]
    const armorCached   = ARMOR_SLOTS.every((s) => !!_gearCache.armorBySlot[s])
    return weaponsCached && armorCached ? INIT_TOTAL : 0
  })
  const [initStatus, setInitStatus] = useState('Connecting to MHW database…')
  const initReady = initCount >= INIT_TOTAL
  const isFirstWeaponLoad = useRef(true)

  // Load all gear in parallel on mount — skip any slot already in the cache
  useEffect(() => {
    let cancelled = false
    const done = (msg) => {
      if (!cancelled) { setInitCount((c) => c + 1); setInitStatus(msg) }
    }

    if (_gearCache.weaponsByType[weaponType]) {
      // Already cached — hydrate state immediately
      setWeapons(_gearCache.weaponsByType[weaponType])
    } else {
      setWeaponsLoading(true)
      fetchWeapons({ q: JSON.stringify({ type: weaponType }) })
        .then(({ data: d }) => {
          if (!cancelled) {
            _gearCache.weaponsByType[weaponType] = d
            setWeapons(d)
          }
        })
        .catch(() => {})
        .finally(() => { if (!cancelled) setWeaponsLoading(false); done('Weapons loaded') })
    }

    ARMOR_SLOTS.forEach((slot) => {
      if (_gearCache.armorBySlot[slot]) {
        // Already cached — hydrate state immediately (no loading needed)
        setArmorBySlot((prev) => ({ ...prev, [slot]: _gearCache.armorBySlot[slot] }))
        setArmorLoading((prev) => ({ ...prev, [slot]: false }))
      } else {
        fetchArmor({ q: JSON.stringify({ type: slot }) })
          .then(({ data: d }) => {
            if (!cancelled) {
              _gearCache.armorBySlot[slot] = d
              setArmorBySlot((prev) => ({ ...prev, [slot]: d }))
            }
          })
          .catch(() => {})
          .finally(() => {
            if (!cancelled) {
              setArmorLoading((prev) => ({ ...prev, [slot]: false }))
              done(`${slot.charAt(0).toUpperCase() + slot.slice(1)} armor loaded`)
            }
          })
      }
    })
    return () => { cancelled = true }
  }, [])

  // Reload weapons when type changes (skip first render — handled above)
  useEffect(() => {
    if (isFirstWeaponLoad.current) { isFirstWeaponLoad.current = false; return }
    if (_gearCache.weaponsByType[weaponType]) {
      // Cached — no network request needed
      setWeapons(_gearCache.weaponsByType[weaponType])
      setWeaponId(null)
      return
    }
    let cancelled = false
    setWeaponsLoading(true)
    setWeaponId(null)
    fetchWeapons({ q: JSON.stringify({ type: weaponType }) })
      .then(({ data: d }) => {
        if (!cancelled) {
          _gearCache.weaponsByType[weaponType] = d
          setWeapons(d)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setWeaponsLoading(false) })
    return () => { cancelled = true }
  }, [weaponType])

  const handleWeaponChange = useCallback((id) => {
    setWeaponId(id)
    if (id) setGearError(null)
  }, [])

  const selectedWeapon      = weapons.find((w) => w.id === weaponId) ?? null
  const selectedArmorPieces = ARMOR_SLOTS.map((slot) =>
    (armorBySlot[slot] || []).find((a) => a.id === armorIds[slot]) ?? null
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!weaponId) { setGearError('Please select a weapon'); return }
    const [helmArmor, chestArmor, glovesArmor, waistArmor, legsArmor] = selectedArmorPieces
    // C4: validateAndSave checks Zod schema; C2: saves to Zustand (persisted)
    const ok = await validateAndSave(1, {
      weaponId,
      weaponName: selectedWeapon?.name || '',
      helmId:   armorIds.head   ?? null,
      chestId:  armorIds.chest  ?? null,
      glovesId: armorIds.gloves ?? null,
      waistId:  armorIds.waist  ?? null,
      legsId:   armorIds.legs   ?? null,
      weapon: mapWeapon(selectedWeapon),
      helm:   mapArmor(helmArmor),
      chest:  mapArmor(chestArmor),
      gloves: mapArmor(glovesArmor),
      waist:  mapArmor(waistArmor),
      legs:   mapArmor(legsArmor),
    })
    if (ok) navigate('/builds/create/step3')
    else    setGearError('Please check your selections')
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
          <div className="h-full bg-mhw-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
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
          {WEAPON_TYPES.map((t) => (
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
          renderListStats={(w) => <WeaponListStats item={w} />}
          renderStats={(w) => <WeaponStats weapon={w} />}
        />
        {gearError && <p className="text-xs text-mhw-accent">{gearError}</p>}
      </section>

      {/* ── Armor ── */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-mhw-gold">
          Armor <span className="text-gray-500 font-normal text-xs ml-1">optional</span>
        </h3>
        {ARMOR_SLOTS.map((slot) => (
          <div key={slot} className="space-y-1">
            <label className="text-xs text-gray-400 capitalize font-medium">{slot}</label>
            <SearchableSelect
              items={armorBySlot[slot] || []}
              value={armorIds[slot]}
              onChange={(id) => setArmorIds((prev) => ({ ...prev, [slot]: id }))}
              placeholder={`Search ${slot} armor…`}
              isLoading={!!armorLoading[slot]}
              renderListStats={(a) => <ArmorListStats item={a} />}
              renderStats={(a) => <ArmorStats armor={a} />}
            />
          </div>
        ))}
      </section>

      {/* ── Combined stats ── */}
      <BuildStatsPanel weapon={selectedWeapon} armorPieces={selectedArmorPieces} />

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => navigate('/builds/create/step1')}
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
