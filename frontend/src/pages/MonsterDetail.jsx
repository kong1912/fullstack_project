// Fn 2.2 — Dynamic Routing + Local State; Fn 1.4 — Recursive WeaknessTree
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchMonsterById } from '../api/mhwApi'
import WeaknessTree from '../components/monsters/WeaknessTree'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function MonsterDetail() {
  const { id }        = useParams()
  const [monster,  setMonster]  = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error,    setError]    = useState(null)
  // Fn 2.2 — local state tab
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    setIsLoading(true)
    fetchMonsterById(id)
      .then(({ data }) => { setMonster(data); setIsLoading(false) })
      .catch((err) => { setError(err.message); setIsLoading(false) })
  }, [id])

  if (isLoading) return <LoadingSpinner text="Loading monster data…" />
  if (error)     return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <p className="text-mhw-accent text-xl mb-4">⚠ {error}</p>
      <Link to="/monsters" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20">← Back</Link>
    </div>
  )
  if (!monster)  return null

  const tabs = ['overview', 'weaknesses', 'rewards']

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link to="/monsters" className="text-gray-400 hover:text-white text-sm">← All Monsters</Link>

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-mhw-gold">{monster.name}</h1>
            <p className="text-gray-400 capitalize mt-1">{monster.type} · Species: {monster.species}</p>
          </div>
          <span className="text-5xl">🐲</span>
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
