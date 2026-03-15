import { Link } from 'react-router-dom'
import useBuildStore from '../../store/buildStore'

export default function BuildCard({ build }) {
  const deleteBuild = useBuildStore((s) => s.deleteBuild)
  const { _id, name, style, weapon, notes, createdAt } = build

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Link to={`/builds/${_id}`} className="group">
          <h3 className="font-bold text-white group-hover:text-mhw-gold transition-colors">
            {name}
          </h3>
          {style && (
            <span className="text-xs text-gray-400 capitalize">{style} style</span>
          )}
        </Link>
        <div className="flex items-center gap-2">
          {/* Pending / queued badge for optimistic items */}
          {build.__optimistic && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">Pending</span>
          )}
          {build.__queued && (
            <span className="text-xs bg-orange-600 text-white px-2 py-0.5 rounded-full">Queued</span>
          )}
          <button
            onClick={() => deleteBuild(_id)}
            className="text-gray-500 hover:text-mhw-accent transition-colors text-sm"
            title="Delete build"
          >
            ✕
          </button>
        </div>
      </div>

      {weapon && (
        <div className="text-sm text-gray-300">
          ⚔ <span className="text-mhw-gold">{weapon.name ?? 'Unknown weapon'}</span>
        </div>
      )}

      {notes && <p className="text-xs text-gray-400 line-clamp-2">{notes}</p>}

      <div className="text-xs text-gray-500">
        {createdAt && new Date(createdAt).toLocaleDateString()}
      </div>
    </div>
  )
}
