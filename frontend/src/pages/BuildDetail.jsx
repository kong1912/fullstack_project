import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatDate } from '../utils/formatters'

export default function BuildDetail() {
  const { id }       = useParams()
  const [build, setBuild]       = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    axiosInstance.get(`/builds/${id}`)
      .then(({ data }) => { setBuild(data.build); setIsLoading(false) })
      .catch((err) => { setError(err.response?.data?.message ?? err.message); setIsLoading(false) })
  }, [id])

  if (isLoading) return <LoadingSpinner text="Loading build…" />
  if (error) return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <p className="text-mhw-accent mb-4">⚠ {error}</p>
      <Link to="/builds" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20">← My Builds</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link to="/builds" className="text-gray-400 hover:text-white text-sm">← My Builds</Link>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-extrabold text-mhw-gold">{build.name}</h1>
          <span className="text-xs text-gray-400">{formatDate(build.createdAt)}</span>
        </div>

        {build.style && (
          <span className="text-sm capitalize text-mhw-green">Style: {build.style}</span>
        )}

        {/* Armor pieces */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {['helm','chest','gloves','waist','legs'].map((slot) => (
            <div key={slot} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
              <p className="text-xs text-gray-400 capitalize">{slot}</p>
              <p className="text-sm text-white font-medium">
                {build[slot]?.name ?? <span className="text-gray-600">Empty</span>}
              </p>
            </div>
          ))}
        </div>

        {build.notes && (
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-200">{build.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
