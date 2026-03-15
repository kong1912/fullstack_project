// Fn 2.5 — Role-based dashboard + URL-synced filter (useSearchParams)
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useBuildStore from '../store/buildStore'
import { useAuth } from '../context/AuthContext'
import BuildCard from '../components/builds/BuildCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const STYLES = ['aggressive', 'defensive', 'balanced', 'support']

export default function Builds() {
  const { builds, fetchBuilds, isLoading } = useBuildStore()
  const { user } = useAuth()
  const navigate = useNavigate()

  // C3 / C4: URL as state — filter lives in the URL so it deep-links correctly
  const [searchParams, setSearchParams] = useSearchParams()
  const styleFilter = searchParams.get('style') ?? ''

  useEffect(() => { fetchBuilds() }, [fetchBuilds])

  // C3: derive filtered list directly from URL param (no extra state needed)
  const filteredBuilds = styleFilter
    ? builds.filter((b) => b.style === styleFilter)
    : builds

  // C5: role check — admins see an extra management panel
  const isAdmin = user?.roles?.includes('admin')

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-mhw-gold">My Builds</h1>
        <button
          onClick={() => navigate('/builds/create/step1')}
          className="px-5 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all text-sm"
        >
          + Create Build
        </button>
      </div>

      {/* C5: Conditional UI — admin-only panel, invisible to regular users */}
      {isAdmin && (
        <div className="flex items-start gap-3 p-4 bg-mhw-accent/10 border border-mhw-accent/30 rounded-xl">
          <span className="text-xl mt-0.5">🛡</span>
          <div className="space-y-1">
            <p className="text-sm font-bold text-mhw-accent">Admin View</p>
            <p className="text-sm text-gray-300">
              Signed in as <span className="text-mhw-gold font-medium">{user.username}</span> (admin) —{' '}
              {builds.length} build{builds.length !== 1 ? 's' : ''} total across all filter states.
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="text-xs text-mhw-accent hover:underline"
            >
              → Open Admin Dashboard
            </button>
          </div>
        </div>
      )}

      {/* C3: Style filter buttons — each click calls setSearchParams, updating the URL.
          C4: On first render searchParams.get('style') reads the URL param, so
              pasting /builds?style=aggressive in a new tab immediately filters the list. */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Filter by Style</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSearchParams({})}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !styleFilter
                ? 'bg-mhw-accent text-white'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
            }`}
          >
            All
          </button>
          {STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setSearchParams({ style: s })}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                styleFilter === s
                  ? 'bg-mhw-accent text-white'
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Saved builds */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          {styleFilter
            ? <><span className="capitalize">{styleFilter}</span> Builds ({filteredBuilds.length})</>
            : <>All Builds ({filteredBuilds.length})</>}
        </h2>
        {isLoading ? (
          <LoadingSpinner text="Loading builds…" />
        ) : filteredBuilds.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center text-gray-500">
            {styleFilter
              ? `No ${styleFilter} builds yet. Try a different style or create one!`
              : 'No builds saved yet. Create your first build above!'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuilds.map((b) => <BuildCard key={b._id} build={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}

