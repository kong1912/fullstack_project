// Fn 1.2 / Fn 6.2 — Async fetching + Debounce + Skeleton
import { useState, useEffect } from 'react'
import { fetchWeapons } from '../api/mhwApi'
import WeaponCard from '../components/weapons/WeaponCard'
import SkeletonCard from '../components/common/SkeletonCard'
import useDebounce from '../hooks/useDebounce'

const WEAPON_TYPES = [
  'all','great-sword','sword-and-shield','dual-blades','long-sword',
  'hammer','hunting-horn','lance','gunlance','switch-axe','charge-blade',
  'insect-glaive','bow','heavy-bowgun','light-bowgun',
]

export default function Weapons() {
  const [weapons,   setWeapons]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState(null)
  const [search,    setSearch]    = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const debouncedSearch = useDebounce(search, 400)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    fetchWeapons()
      .then(({ data }) => { if (!cancelled) { setWeapons(data); setIsLoading(false) } })
      .catch((err)    => { if (!cancelled) { setError(err.message); setIsLoading(false) } })
    return () => { cancelled = true }
  }, [])

  const filtered = weapons.filter((w) => {
    const matchName = w.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    const matchType = typeFilter === 'all' || w.type === typeFilter
    return matchName && matchType
  })

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-mhw-gold">Weapon Database</h1>
            <p className="text-gray-400 mt-1">{!isLoading && `${filtered.length} weapons`}</p>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search weapons…" className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm w-full sm:w-64" />
        </div>
        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {WEAPON_TYPES.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`text-xs px-3 py-1 rounded-full capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-mhw-accent text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl p-4 text-red-400 mb-6">
          Failed to load weapons: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {isLoading
          ? <SkeletonCard count={8} />
          : filtered.map((w) => <WeaponCard key={w.id} weapon={w} />)
        }
      </div>
    </div>
  )
}
