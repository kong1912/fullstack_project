// Fn 2.4 — Zustand persistence + Fn 6.3 Multi-step form
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useBuildStore from '../store/buildStore'
import BuildCard from '../components/builds/BuildCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Builds() {
  const { builds, fetchBuilds, isLoading } = useBuildStore()
  const navigate = useNavigate()

  useEffect(() => { fetchBuilds() }, [fetchBuilds])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-mhw-gold">My Builds</h1>
        {/* Navigate to nested-route wizard (Fn 2.4 C1) */}
        <button
          onClick={() => navigate('/builds/create/step1')}
          className="px-5 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all text-sm"
        >
          + Create Build
        </button>
      </div>

      {/* Saved builds */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Saved Builds ({builds.length})
        </h2>
        {isLoading ? (
          <LoadingSpinner text="Loading builds…" />
        ) : builds.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center text-gray-500">
            No builds saved yet. Create your first build above!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {builds.map((b) => <BuildCard key={b._id} build={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}

