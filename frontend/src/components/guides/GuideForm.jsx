import { useState } from 'react'
import { createGuide } from '../../api/guideApi'

export default function GuideForm({ onCreated }) {
  const [title,       setTitle]       = useState('')
  const [body,        setBody]        = useState('')
  const [tags,        setTags]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState(null)
  const [open,        setOpen]        = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean)
      const { data } = await createGuide({ title: title.trim(), body: body.trim(), tags: parsedTags })
      onCreated?.(data.guide)
      setTitle(''); setBody(''); setTags(''); setOpen(false)
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally { setSubmitting(false) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors">
      + New Guide
    </button>
  )

  return (
    <form onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-mhw-gold">Write a Guide</h3>
        <button type="button" onClick={() => setOpen(false)}
          className="text-gray-500 hover:text-white text-sm">✕</button>
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)} required
        placeholder="Title (min 5 characters)"
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-mhw-accent" />

      <textarea value={body} onChange={e => setBody(e.target.value)} required rows={6}
        placeholder="Write your guide here…"
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-mhw-accent resize-y" />

      <input value={tags} onChange={e => setTags(e.target.value)}
        placeholder="Tags (comma separated, e.g. great-sword, endgame)"
        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-mhw-accent" />

      {error && <p className="text-xs text-mhw-accent">⚠ {error}</p>}

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)}
          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors border border-white/20">
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="px-4 py-1.5 bg-mhw-accent hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
          {submitting ? 'Posting…' : 'Post Guide'}
        </button>
      </div>
    </form>
  )
}
