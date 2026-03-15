import { useState } from 'react'
import { createGuide } from '../../api/guideApi'
import ImageUploadQueue from './ImageUploadQueue'
import DynamicForm from '../forms/DynamicForm'
import exampleGuideSchema from '../../data/dynamicSchemas/guideFormSchema.json'

export default function GuideForm({ onCreated }) {
  const [files,       setFiles]       = useState([])
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState(null)
  const [open,        setOpen]        = useState(false)
  // phase: 'form' while writing, 'uploading' while ImageUploadQueue runs
  const [phase,        setPhase]       = useState('form')
  const [createdGuide, setCreatedGuide] = useState(null)

  const [minimized, setMinimized] = useState(false)
  // Use JSON-driven schema for the guide form
  const parsedSchema = exampleGuideSchema

  

  const handleUploadsComplete = (allImages) => {
    onCreated?.({ ...createdGuide, images: allImages })
    setFiles([])
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
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-mhw-gold">Write a Guide</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-white text-sm">✕</button>
            </div>
          </div>


          <div className="space-y-3">
            {/* Render the DynamicForm driven by the example schema */}
            <DynamicForm schema={parsedSchema} onSubmit={async (data) => {
              setError(null)
              setSubmitting(true)
              try {
                // Log full payload so it can be inspected in console (matches JSON `name` keys)
                // (Final JSON test: ensure `data` contains keys exactly as defined in the schema)
                // eslint-disable-next-line no-console
                console.log('finalPayload', data)
                // gather tags from multiple possible locations
                const tags = data.tags ?? data.meta?.tags ?? []
                const payload = { title: data.title ?? '', body: data.body ?? '', tags }
                const { data: resp } = await createGuide(payload)
                if (files.length) {
                  setCreatedGuide(resp.guide)
                  setPhase('uploading')
                  setOpen(false)
                } else {
                  onCreated?.(resp.guide)
                  setOpen(false)
                }
              } catch (err) {
                setError(err.response?.data?.message ?? err.message)
              } finally { setSubmitting(false) }
            }} />

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
          </div>
        </div>
      )}
    </>
  )
}
