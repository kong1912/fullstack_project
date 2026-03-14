import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchGuides } from '../api/guideApi'
import GuideCard from '../components/guides/GuideCard'
import GuideForm from '../components/guides/GuideForm'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Guides() {
  const { isAuthenticated } = useAuth()
  const [guides,  setGuides]  = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search,      setSearch]      = useState('')

  const load = useCallback(async (p = 1, q = search) => {
    setLoading(true)
    try {
      const params = { page: p, limit: 10 }
      if (q.trim()) params.search = q.trim()
      const { data } = await fetchGuides(params)
      setGuides(prev => p === 1 ? data.guides : [...prev, ...data.guides])
      setTotal(data.pagination.total)
      setPage(p)
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => { load(1) }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const handleCreated = (guide) => {
    setGuides(prev => [guide, ...prev])
    setTotal(t => t + 1)
  }

  const handleDeleted = (id) => {
    setGuides(prev => prev.filter(g => g._id !== id))
    setTotal(t => t - 1)
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-mhw-gold">📖 Guides</h1>
          <p className="text-sm text-gray-500 mt-1">Community hunter guides & tips</p>
        </div>
        {isAuthenticated && <GuideForm onCreated={handleCreated} />}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            placeholder="Search guide topics…"
            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mhw-gold" />
        </div>
        <button className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors border border-white/20">
          Search
        </button>
        {search && (
          <button type="button" onClick={() => { setSearch(''); setSearchInput('') }}
            className="px-2 py-2 text-gray-400 hover:text-white text-sm transition-colors">
            ✕
          </button>
        )}
      </form>

      {search && (
        <div className="flex flex-wrap gap-1 items-center">
          <span className="px-2 py-0.5 bg-mhw-gold/20 text-mhw-gold rounded-full text-xs">🔍 {search}</span>
        </div>
      )}

      {/* List */}
      {loading && guides.length === 0
        ? <LoadingSpinner text="Loading guides…" />
        : guides.length === 0
          ? <p className="text-gray-500 text-sm">No guides yet — be the first!</p>
          : (
            <div className="space-y-4">
              {guides.map(g => (
                <GuideCard key={g._id} guide={g} onDeleted={handleDeleted} />
              ))}
            </div>
          )
      }

      {guides.length < total && (
        <button onClick={() => load(page + 1)} disabled={loading}
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm transition-colors disabled:opacity-50">
          {loading ? 'Loading…' : `Load more (${total - guides.length} remaining)`}
        </button>
      )}
    </div>
  )
}
