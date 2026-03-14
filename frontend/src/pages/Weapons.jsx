// Fn 1.2 / Fn 6.2 — Async fetching + Debounce + Skeleton + Infinite Scroll (client-side)
import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchWeapons } from '../api/mhwApi'
import WeaponCard from '../components/weapons/WeaponCard'
import SkeletonCard from '../components/common/SkeletonCard'
import useDebounce from '../hooks/useDebounce'

const WEAPON_TYPES = [
  'great-sword','sword-and-shield','dual-blades','long-sword',
  'hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade',
  'insect-glaive','bow','heavy-bowgun','light-bowgun',
]

const PAGE_SIZE = 10

export default function Weapons() {
  const [allWeapons, setAllWeapons] = useState([])   // full list for current type
  const [visible,    setVisible]    = useState(PAGE_SIZE)
  const [isLoading,  setIsLoading]  = useState(true)
  const [error,      setError]      = useState(null)
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState('great-sword')
  const sentinelRef = useRef(null)
  const debouncedSearch = useDebounce(search, 400)

  // Fetch all weapons of the selected type (each type ~20-50 items)
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    setAllWeapons([])
    setVisible(PAGE_SIZE)

    fetchWeapons({ q: JSON.stringify({ type: typeFilter }) })
      .then(({ data }) => { if (!cancelled) setAllWeapons(data) })
      .catch((err)    => { if (!cancelled) setError(err.message) })
      .finally(()     => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [typeFilter])

  // Client-side filter by search
  const filtered = allWeapons.filter((w) =>
    w.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  const displayed = filtered.slice(0, visible)
  const hasMore   = visible < filtered.length

  // Infinite scroll: reveal next page when sentinel enters viewport
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setVisible(prev => prev + PAGE_SIZE)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore])

  // Reset visible count when search or type changes
  useEffect(() => { setVisible(PAGE_SIZE) }, [debouncedSearch, typeFilter])

  const handleTypeChange = useCallback((t) => {
    setSearch('')
    setTypeFilter(t)
  }, [])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-mhw-gold">Weapon Database</h1>
            <p className="text-gray-400 mt-1">
              {!isLoading && `${displayed.length} / ${filtered.length} weapons`}
            </p>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search weapons…" className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm sm:w-64" />
        </div>
        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {WEAPON_TYPES.map((t) => (
            <button key={t} onClick={() => handleTypeChange(t)}
              className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-mhw-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {t.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl p-4 text-red-400 mb-6 flex items-center justify-between">
          <span>Failed to load weapons: {error}</span>
          <button
            onClick={() => setTypeFilter(t => t)}
            className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/40 rounded text-sm transition-colors"
          >Retry</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {isLoading
          ? <SkeletonCard count={PAGE_SIZE} />
          : displayed.map((w) => <WeaponCard key={w.id} weapon={w} />)
        }
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
        {hasMore && !isLoading && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="w-4 h-4 border-2 border-mhw-accent/50 border-t-mhw-accent rounded-full animate-spin" />
            Loading more…
          </div>
        )}
        {!hasMore && !isLoading && allWeapons.length > 0 && (
          <p className="text-gray-500 text-sm">All {typeFilter.replace(/-/g, ' ')} weapons shown</p>
        )}
      </div>
    </div>
  )
}
