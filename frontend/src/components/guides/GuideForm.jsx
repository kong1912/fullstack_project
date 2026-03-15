import { useState } from 'react'
import { createGuide } from '../../api/guideApi'
import ImageUploadQueue from './ImageUploadQueue'

export default function GuideForm({ onCreated }) {
  const [title,       setTitle]       = useState('')
  const [body,        setBody]        = useState('')
  const [files,       setFiles]       = useState([])
  const [tagsText,    setTagsText]    = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState(null)
  const [open,        setOpen]        = useState(false)
  // phase: 'form' while writing, 'uploading' while ImageUploadQueue runs
  const [phase,        setPhase]       = useState('form')
  const [createdGuide, setCreatedGuide] = useState(null)

  const [minimized, setMinimized] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      // parse tags from comma-separated input into array
      const tags = tagsText.split(',').map(t => t.trim()).filter(Boolean)
      const { data } = await createGuide({ title: title.trim(), body: body.trim(), tags })
      if (files.length) {
        // Close the form panel, show floating popup instead
        setCreatedGuide(data.guide)
        setPhase('uploading')
        setOpen(false)
      } else {
        onCreated?.(data.guide)
        setTitle(''); setBody(''); setFiles([]); setOpen(false)
      }
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally { setSubmitting(false) }
  }

  const handleUploadsComplete = (allImages) => {
    onCreated?.({ ...createdGuide, images: allImages })
    setTitle(''); setBody(''); setFiles([])
    setPhase('form'); setCreatedGuide(null)
    setMinimized(false)
  }

  return (
    <>
      {/* Floating upload progress popup */}
      {phase === 'uploading' && createdGuide && (
        <div className={`fixed bottom-6 right-6 z-50 w-80 bg-mhw-panel border border-mhw-gold/40 rounded-2xl shadow-2xl shadow-black/60 transition-all duration-300 ${minimized ? 'h-12 overflow-hidden' : ''}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 cursor-pointer select-none"
            onClick={() => setMinimized(m => !m)}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-mhw-gold animate-pulse" />
              <span className="text-sm font-bold text-mhw-gold">Uploading Images</span>
              <span className="text-xs text-gray-500">{files.length} file{files.length !== 1 ? 's' : ''}</span>
            </div>
            <span className="text-gray-400 text-xs">{minimized ? '▲' : '▼'}</span>
          </div>
          {!minimized && (
            <div className="p-4">
              <ImageUploadQueue
                guideId={createdGuide._id}
                files={files}
                onAllDone={handleUploadsComplete}
              />
            </div>
          )}
        </div>
      )}

      {/* New Guide button */}
      {!open && phase !== 'uploading' && (
        <button onClick={() => setOpen(true)}
          className="px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-colors">
          + New Guide
        </button>
      )}

      {/* Write form */}
      {open && (
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

      {/* Tags input */}
      <div>
        <label className="text-xs text-gray-400 font-medium">Tags (comma separated)</label>
        <input value={tagsText} onChange={e => setTagsText(e.target.value)}
          placeholder="e.g. node,express,builds"
          className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-mhw-accent" />
      </div>

      {/* Image upload */}
      <div className="space-y-1">
        <label className="text-xs text-gray-400 font-medium">Images (optional, up to 5)</label>
        <input type="file" multiple accept="image/*"
          onChange={e => setFiles(Array.from(e.target.files).slice(0, 5))}
          className="block w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-mhw-accent/80 file:text-white hover:file:bg-mhw-accent cursor-pointer" />
        {files.length > 0 && (
          <ul className="text-xs text-gray-500 space-y-0.5 pl-1">
            {files.map(f => <li key={f.name}>• {f.name}</li>)}
          </ul>
        )}
      </div>

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
      )}
    </>
  )
}
