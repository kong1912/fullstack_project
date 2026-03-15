import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchComments, createComment, deleteComment, voteComment } from '../../api/guideApi'

// ── Vote buttons ──────────────────────────────────────────────────────────────
function VoteButtons({ upvotes, downvotes, userVote, onVote, small }) {
  const base = small
    ? 'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold transition-colors'
    : 'flex items-center gap-1 px-2 py-1 rounded text-sm font-semibold transition-colors'
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onVote('up')}
        className={`${base} ${userVote === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:text-green-400'}`}>
        ▲ {upvotes}
      </button>
      <button type="button" onClick={() => onVote('down')}
        className={`${base} ${userVote === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400 hover:text-red-400'}`}>
        ▼ {downvotes}
      </button>
    </div>
  )
}

// ── Recursive deep-update helper ─────────────────────────────────────────────
// Walks the nested comment tree and returns a new tree with the target comment
// updated by the provided updater function. Preserves immutability at every level.
function updateComments(comments, targetId, updater) {
  return comments.map(c => {
    if (c._id === targetId) return updater(c)
    if (c.replies?.length) return { ...c, replies: updateComments(c.replies, targetId, updater) }
    return c
  })
}


function CommentItem({ comment: init, targetType, targetId, depth = 0, onDeepUpdate }) {
  const { isAuthenticated, user } = useAuth()
  const [comment,    setComment]  = useState(init)
  const [replying,   setReplying] = useState(false)
  const [showReplies,setShowReplies] = useState(false)
  const [replies,    setReplies]  = useState([])
  const [replyCount, setReplyCount] = useState(init.replyCount ?? 0)
  const [repliesLoaded, setRepliesLoaded] = useState(false)
  const [replyBody,  setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadReplies = useCallback(async () => {
    if (repliesLoaded) { setShowReplies(v => !v); return }
    const { data } = await fetchComments({ targetType, targetId, parent: comment._id, limit: 50 })
    setReplies(data.comments)
    setRepliesLoaded(true)
    setShowReplies(true)
  }, [repliesLoaded, comment._id, targetType, targetId])

  const handleVote = async (vote) => {
    if (!isAuthenticated) return
    const { data } = await voteComment(comment._id, vote)
    const updater = c => ({ ...c, upvotes: data.upvotes, downvotes: data.downvotes, _userVote: data.userVote })
    setComment(updater)
    onDeepUpdate?.(comment._id, updater)
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return
    await deleteComment(comment._id)
    const updater = c => ({ ...c, isDeleted: true, body: '[deleted]' })
    setComment(updater)
    onDeepUpdate?.(comment._id, updater)
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyBody.trim()) return
    setSubmitting(true)
    try {
      const { data } = await createComment({ targetType, targetId, body: replyBody.trim(), parent: comment._id })
      setReplies(prev => [data.comment, ...prev])
      setReplyCount(c => c + 1)
      setRepliesLoaded(true)
      setShowReplies(true)
      setReplyBody('')
      setReplying(false)
    } finally { setSubmitting(false) }
  }

  const isOwn = user?._id === (comment.author?._id ?? comment.author)

  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-6 pl-4 border-l border-white/10' : ''}`}>
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs font-semibold text-mhw-gold">{comment.author?.username ?? 'Unknown'}</span>
          <span className="text-xs text-gray-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <p className={`text-sm ${comment.isDeleted ? 'text-gray-600 italic' : 'text-gray-200'}`}>{comment.body}</p>
        <div className="flex items-center gap-3 flex-wrap">
          <VoteButtons
            upvotes={comment.upvotes} downvotes={comment.downvotes}
            userVote={comment._userVote} onVote={handleVote} small />
          {isAuthenticated && depth < 5 && (
            <button type="button" onClick={() => setReplying(v => !v)}
              className="text-xs text-gray-500 hover:text-white transition-colors">
              {replying ? 'cancel' : 'reply'}
            </button>
          )}
          {replyCount > 0 && (
            <button type="button" onClick={loadReplies}
              className="text-xs text-gray-500 hover:text-white transition-colors">
              {showReplies ? 'hide' : `▶ ${replyCount} repl${replyCount === 1 ? 'y' : 'ies'}`}
            </button>
          )}
          {isOwn && !comment.isDeleted && (
            <button type="button" onClick={handleDelete}
              className="text-xs text-gray-600 hover:text-mhw-accent transition-colors ml-auto">
              delete
            </button>
          )}
        </div>
      </div>

      {replying && (
        <form onSubmit={handleReply} className="ml-6 flex gap-2">
          <input value={replyBody} onChange={e => setReplyBody(e.target.value)}
            placeholder="Write a reply…"
            className="flex-1 px-3 py-1.5 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mhw-accent" />
          <button disabled={submitting}
            className="px-3 py-1.5 bg-mhw-accent hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
            Post
          </button>
        </form>
      )}

      {showReplies && replies.map(r => (
        <CommentItem key={r._id} comment={r} targetType={targetType} targetId={targetId} depth={depth + 1} onDeepUpdate={onDeepUpdate} />
      ))}
    </div>
  )
}

// ── Comment section ───────────────────────────────────────────────────────────
export default function CommentSection({ targetType, targetId }) {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState([])
  const [total,    setTotal]    = useState(0)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(false)
  const [body,     setBody]     = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    try {
      const { data } = await fetchComments({ targetType, targetId, parent: 'null', page: p, limit: 20 })
      setComments(prev => p === 1 ? data.comments : [...prev, ...data.comments])
      setTotal(data.pagination.total)
      setPage(p)
    } finally { setLoading(false) }
  }, [targetType, targetId])

  useEffect(() => { load(1) }, [load])

  // Expose updateComments so child CommentItems can propagate deep state changes
  // upward into the root comments array without mutation.
  const handleDeepUpdate = (commentId, updater) => {
    setComments(prev => updateComments(prev, commentId, updater))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const { data } = await createComment({ targetType, targetId, body: body.trim() })
      setComments(prev => [data.comment, ...prev])
      setTotal(t => t + 1)
      setBody('')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-mhw-gold uppercase tracking-widest">
        💬 Comments ({total})
      </h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input value={body} onChange={e => setBody(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mhw-accent" />
          <button disabled={submitting}
            className="px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
            Post
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <Link to="/login" className="text-mhw-accent hover:underline">Log in</Link> to comment.
        </p>
      )}

      {loading && comments.length === 0 && (
        <p className="text-sm text-gray-600 animate-pulse">Loading comments…</p>
      )}

      <div className="space-y-3">
        {comments.map(c => (
          <CommentItem key={c._id} comment={c} targetType={targetType} targetId={targetId} onDeepUpdate={handleDeepUpdate} />
        ))}
      </div>

      {comments.length < total && (
        <button onClick={() => load(page + 1)} disabled={loading}
          className="w-full py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm transition-colors disabled:opacity-50">
          {loading ? 'Loading…' : 'Load more comments'}
        </button>
      )}
    </div>
  )
}
