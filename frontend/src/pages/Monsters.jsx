// Fn 1.2 / Fn 6.2 — Async data fetching, Hooks, Debounce, Skeleton Loading
import { useState, useEffect } from 'react'
import { fetchMonsters } from '../api/mhwApi'
import MonsterCard from '../components/monsters/MonsterCard'
import SkeletonCard from '../components/common/SkeletonCard'
import useDebounce from '../hooks/useDebounce'

export default function Monsters() {
  const [monsters,   setMonsters]  = useState([])
  const [isLoading,  setIsLoading] = useState(true)
  const [error,      setError]     = useState(null)
  const [search,     setSearch]    = useState('')
  const debouncedSearch = useDebounce(search, 400) // Fn 6.2

  useEffect(() => {
    let cancelled = false
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data } = await fetchMonsters()
        if (!cancelled) setMonsters(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  const term = debouncedSearch.toLowerCase()
  const filtered = monsters.filter((m) =>
    m.name.toLowerCase().includes(term) ||
    (m.species ?? '').toLowerCase().includes(term)
  )

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-mhw-gold">Monster Compendium</h1>
          <p className="text-gray-400 mt-1">
            {!isLoading && `${filtered.length} monsters found`}
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search monsters…"
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm w-full sm:w-64"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl p-4 text-red-400 mb-6">
          Failed to load monsters: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {isLoading
          ? <SkeletonCard count={8} />
          : filtered.map((m) => <MonsterCard key={m.id} monster={m} />)
        }
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          No results found for '{debouncedSearch}'
        </div>
      )}
    </div>
  )
}
