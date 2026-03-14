import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchGuide, voteGuide, deleteGuide, updateGuide } from '../api/guideApi'
import CommentSection from '../components/guides/CommentSection'
import LoadingSpinner from '../components/common/LoadingSpinner'

function VotePanel({ guide, onVoted }) {
  const { user, isAuthenticated } = useAuth()
  const myVote = guide.upvotedBy?.includes(user?._id)
    ? 'up'
    : guide.downvotedBy?.includes(user?._id)
    ? 'down'
    : null

  const handleVote = async (v) => {
    if (!isAuthenticated) return
    try {
      const { data } = await voteGuide(guide._id, v)
      const uid = String(user._id)
      const upvotedBy   = data.userVote === 'up'
        ? [...(guide.upvotedBy ?? []).filter(id => String(id) !== uid), uid]
        : (guide.upvotedBy ?? []).filter(id => String(id) !== uid)
      const downvotedBy = data.userVote === 'down'
        ? [...(guide.downvotedBy ?? []).filter(id => String(id) !== uid), uid]
        : (guide.downvotedBy ?? []).filter(id => String(id) !== uid)
      onVoted({ ...guide, upvotes: data.upvotes, downvotes: data.downvotes, upvotedBy, downvotedBy })
    } catch {}
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button onClick={() => handleVote('up')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors font-semibold
          ${myVote === 'up'
            ? 'bg-green-500/20 border-green-500 text-green-400'
            : 'border-white/20 text-gray-400 hover:border-green-500 hover:text-green-400'}`}>
        ▲ {guide.upvotes ?? 0}
      </button>
      <button onClick={() => handleVote('down')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors font-semibold
          ${myVote === 'down'
            ? 'bg-red-500/20 border-red-500 text-red-400'
            : 'border-white/20 text-gray-400 hover:border-red-500 hover:text-red-400'}`}>
        ▼ {guide.downvotes ?? 0}
      </button>
    </div>
  )
}

export default function GuideDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  const [guide,   setGuide]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editBody,  setEditBody]  = useState('')
  const [saving,   setSaving]   = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchGuide(id)
      .then(({ data }) => setGuide(data.guide))
      .catch(() => setError('Guide not found.'))
      .finally(() => setLoading(false))
  }, [id])

  const isOwn = user && guide && (
    guide.author?._id === user._id || guide.author === user._id
  )

  const startEdit = () => {
    setEditTitle(guide.title)
    setEditBody(guide.body)
    setEditing(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      const { data } = await updateGuide(id, { title: editTitle, body: editBody })
      setGuide(data.guide)
      setEditing(false)
    } catch (e) {
      setError(e.response?.data?.message ?? 'Save failed.')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this guide?')) return
    try {
      await deleteGuide(id)
      navigate('/guides')
    } catch {}
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner text="Loading guide…" /></div>
  if (error && !guide) return <p className="text-center py-16 text-mhw-accent">{error}</p>
  if (!guide)  return null

  const authorName = guide.author?.username ?? 'Unknown'
  const dateStr = new Date(guide.createdAt).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back */}
      <button onClick={() => navigate('/guides')}
        className="text-sm text-gray-400 hover:text-white transition-colors">
        ← Back to Guides
      </button>

      {/* Guide body */}
      <div className="bg-mhw-panel border border-white/10 rounded-2xl p-6 space-y-4">
        {editing ? (
          <div className="space-y-3">
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-mhw-accent" />
            <textarea value={editBody} onChange={e => setEditBody(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm resize-y focus:outline-none focus:border-mhw-accent" />
            {error && <p className="text-xs text-mhw-accent">{error}</p>}
            <div className="flex gap-2">
              <button onClick={saveEdit} disabled={saving}
                className="px-4 py-1.5 bg-mhw-gold text-mhw-dark rounded-lg text-sm font-bold disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}
                className="px-4 py-1.5 bg-white/10 text-white rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h1 className="text-2xl font-extrabold text-mhw-gold leading-tight">{guide.title}</h1>
              {isOwn && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={startEdit}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg text-xs font-semibold transition-colors">
                    Edit
                  </button>
                  <button onClick={handleDelete}
                    className="px-3 py-1.5 bg-mhw-accent/20 hover:bg-mhw-accent/40 text-mhw-accent rounded-lg text-xs font-semibold transition-colors">
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>by <span className="text-gray-300 font-medium">{authorName}</span></span>
              <span>·</span>
              <span>{dateStr}</span>
            </div>

            {/* Body */}
            <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {guide.body}
            </div>
          </>
        )}

        {/* Voting */}
        {!editing && (
          <div className="pt-3 border-t border-white/10">
            <VotePanel guide={guide} onVoted={setGuide} />
            {!isAuthenticated && (
              <p className="text-xs text-gray-500 mt-1">Log in to vote</p>
            )}
          </div>
        )}
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Comments</h2>
        <CommentSection targetType="guide" targetId={guide._id} />
      </div>
    </div>
  )
}
