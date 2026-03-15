import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { deleteGuide, voteGuide } from '../../api/guideApi'

export default function GuideCard({ guide: init, onDeleted }) {
  const { isAuthenticated, user } = useAuth()
  const [guide, setGuide] = useState(init)

  const isOwn = user?._id === (guide.author?._id ?? guide.author)

  const handleVote = async (vote) => {
    if (!isAuthenticated) return
    const { data } = await voteGuide(guide._id, vote)
    setGuide(g => ({ ...g, upvotes: data.upvotes, downvotes: data.downvotes, _userVote: data.userVote }))
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this guide?')) return
    await deleteGuide(guide._id)
    onDeleted?.(guide._id)
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 hover:border-mhw-accent/30 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/guides/${guide._id}`}
          className="text-base font-bold text-white hover:text-mhw-gold transition-colors flex-1">
          {guide.title}
        </Link>
        {isOwn && (
          <button onClick={handleDelete} title="Delete"
            className="shrink-0 text-gray-600 hover:text-mhw-accent transition-colors text-sm">✕</button>
        )}
      </div>

      <p className="text-sm text-gray-400 line-clamp-3">{guide.body}</p>

      {/* Tags */}
      {Array.isArray(guide.tags) && guide.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {guide.tags.map((t) => (
            <span key={t} className="text-xs bg-white/5 text-gray-300 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-gray-500">
        <span>by <span className="text-gray-300">{guide.author?.username ?? '?'}</span></span>
        <div className="flex items-center gap-2">
          <span>{new Date(guide.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => handleVote('up')}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold transition-colors
                ${guide._userVote === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:text-green-400'}`}>
              ▲ {guide.upvotes}
            </button>
            <button onClick={() => handleVote('down')}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold transition-colors
                ${guide._userVote === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400 hover:text-red-400'}`}>
              ▼ {guide.downvotes}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
