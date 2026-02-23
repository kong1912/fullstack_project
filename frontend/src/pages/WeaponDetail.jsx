// Fn 2.2 — Dynamic Routing + Local State; Fn 1.4 — Recursive WeaponTree
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchWeaponById, fetchWeapons } from '../api/mhwApi'
import WeaponTree from '../components/weapons/WeaponTree'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatWeaponType } from '../utils/formatters'

export default function WeaponDetail() {
  const { id }           = useParams()
  const [weapon,      setWeapon]      = useState(null)
  const [siblings,    setSiblings]    = useState([])
  const [isLoading,   setIsLoading]   = useState(true)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    setIsLoading(true)
    Promise.all([fetchWeaponById(id), fetchWeapons()])
      .then(([wRes, allRes]) => {
        setWeapon(wRes.data)
        // Only keep same weapon type for tree (Fn 1.4)
        setSiblings(allRes.data.filter((w) => w.type === wRes.data.type))
        setIsLoading(false)
      })
      .catch((err) => { setError(err.message); setIsLoading(false) })
  }, [id])

  if (isLoading) return <LoadingSpinner text="Loading weapon…" />
  if (error)     return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <p className="text-mhw-accent mb-4">⚠ {error}</p>
      <Link to="/weapons" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20">← Back</Link>
    </div>
  )
  if (!weapon) return null

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <Link to="/weapons" className="text-gray-400 hover:text-white text-sm">← All Weapons</Link>

      {/* Header */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-mhw-gold">{weapon.name}</h1>
            <p className="text-gray-400 mt-1 capitalize">
              {formatWeaponType(weapon.type)} · Rarity {weapon.rarity}
            </p>
          </div>
          <span className="text-4xl">⚔</span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {weapon.attack && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Attack</p>
              <p className="font-bold text-white text-lg">{weapon.attack.display}</p>
            </div>
          )}
          {weapon.elderseal && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Elderseal</p>
              <p className="font-bold text-purple-300 capitalize">{weapon.elderseal}</p>
            </div>
          )}
          {weapon.slots?.length > 0 && (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Slots</p>
              <p className="font-bold text-white">{weapon.slots.map((s) => `◈${s.rank}`).join(' ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Weapon upgrade tree (Fn 1.4 — recursive) */}
      <WeaponTree rootWeapon={weapon} allWeapons={siblings} />

      {/* Crafting materials */}
      {weapon.crafting?.materials?.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
          <h3 className="text-mhw-gold font-bold mb-3 text-sm uppercase tracking-wider">
            Crafting Materials
          </h3>
          <div className="space-y-2">
            {weapon.crafting.materials.map((m, i) => (
              <div key={i} className="flex justify-between text-sm border-b border-white/5 py-1">
                <span className="text-white">{m.item?.name}</span>
                <span className="text-mhw-gold">×{m.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
