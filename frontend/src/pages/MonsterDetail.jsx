// Fn 2.2 — Dynamic Routing + Local State; Fn 1.4 — Recursive WeaknessTree
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchMonsterById } from '../api/mhwApi'
import WeaknessTree from '../components/monsters/WeaknessTree'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function MonsterDetail() {
  const { id }         = useParams()
  const navigate       = useNavigate()   // C3 — useNavigate
  const [monster,  setMonster]  = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound]  = useState(false)
  const [error,    setError]    = useState(null)
  // Fn 2.2 — local state tab
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    setIsLoading(true)
    setNotFound(false)
    fetchMonsterById(id)
      .then(({ data }) => { setMonster(data); setIsLoading(false) })
      .catch((err) => {
        // C4 — distinguish 404 not-found from other errors
        if (err.response?.status === 404 || err.message?.toLowerCase().includes('not found')) {
          setNotFound(true)
        } else {
          setError(err.message)
        }
        setIsLoading(false)
      })
  }, [id])

  if (isLoading) return <LoadingSpinner text="Loading monster data…" />

  // C4 — explicit not-found page
  if (notFound) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
      <p className="text-6xl">🔍</p>
      <h2 className="text-2xl font-bold text-mhw-gold">Monster Not Found</h2>
      <p className="text-gray-400">No monster with ID <span className="text-mhw-accent font-mono">{id}</span> exists in the compendium.</p>
      <button onClick={() => navigate('/monsters')}
        className="px-5 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-colors">
        ← Back to Monsters
      </button>
    </div>
  )

  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <p className="text-mhw-accent text-xl mb-4">⚠ {error}</p>
      <button onClick={() => navigate('/monsters')}
        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20">
        ← Back
      </button>
    </div>
  )
  if (!monster)  return null

  const tabs = ['overview', 'weaknesses', 'rewards']

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <button onClick={() => navigate('/monsters')} className="text-gray-400 hover:text-white text-sm">← All Monsters</button>

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-mhw-gold">{monster.name}</h1>
            <p className="text-gray-400 capitalize mt-1">{monster.type} · Species: {monster.species}</p>
          </div>
        </div>
        {monster.description && (
          <p className="text-gray-300 mt-4 text-sm leading-relaxed">{monster.description}</p>
        )}
      </div>

      {/* Tabs (Fn 2.2 local state) */}
      <div className="flex gap-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-mhw-accent text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {monster.ailments?.map((a) => (
            <div key={a.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Ailment</p>
              <p className="font-semibold text-white">{a.name}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'weaknesses' && (
        <WeaknessTree weaknesses={monster.weaknesses ?? []} />
      )}

      {tab === 'rewards' && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-2">
          {monster.rewards?.length ? monster.rewards.map((r, i) => (
            <div key={i} className="flex justify-between text-sm border-b border-white/5 py-1">
              <span className="text-white">{r.item?.name}</span>
              <span className="text-mhw-gold">{r.conditions?.[0]?.chance}%</span>
            </div>
          )) : <p className="text-gray-500 text-sm">No reward data available.</p>}
        </div>
      )}
    </div>
  )
}
