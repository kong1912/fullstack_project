// Fn 1.5 — Reusable queue-based image uploader
// Max MAX_PARALLEL real uploads at once; tracks per-file progress via axios onUploadProgress
import { useState, useRef, useEffect } from 'react'
import { uploadSingleImage } from '../../api/guideApi'

const MAX_PARALLEL = 2

function getStage(status, progress) {
  if (status === 'waiting')   return 'Queued'
  if (status === 'done')      return 'Done'
  if (status === 'error')     return 'Error'
  if (progress < 80)          return 'Uploading'
  return 'Saving'
}

function statusBadge(status) {
  if (status === 'uploading') return 'bg-mhw-gold/20 text-mhw-gold border-mhw-gold/40'
  if (status === 'done')      return 'bg-mhw-green/20 text-mhw-green border-mhw-green/40'
  if (status === 'error')     return 'bg-red-500/20 text-red-400 border-red-500/40'
  return 'bg-white/5 text-gray-500 border-white/10'
}

function barColor(status) {
  if (status === 'done')      return 'bg-mhw-green'
  if (status === 'error')     return 'bg-red-500'
  if (status === 'uploading') return 'bg-mhw-gold'
  return 'bg-white/10'
}

function FileIcon({ name }) {
  const ext = name.split('.').pop().toLowerCase()
  const cls = ext === 'png' ? 'bg-blue-500/20 text-blue-400'
    : ext === 'gif'  ? 'bg-purple-500/20 text-purple-400'
    : ext === 'webp' ? 'bg-cyan-500/20 text-cyan-400'
    : 'bg-orange-500/20 text-orange-400'
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${cls}`}>.{ext}</span>
}

// Props:
//   guideId   — string, the guide to upload to
//   files     — File[], the images to process
//   onAllDone — (allImages: string[]) => void, called when every file is done
export default function ImageUploadQueue({ guideId, files, onAllDone }) {
  const [tasks, setTasks] = useState(() =>
    files.map((f, i) => ({ id: i, file: f, status: 'waiting', progress: 0 }))
  )
  const [allDone, setAllDone] = useState(false)

  const allImagesRef = useRef([])
  const queueRef     = useRef(files.map((_, i) => i))
  const runningRef   = useRef(0)

  const dequeue = useRef(null)
  dequeue.current = () => {
    while (runningRef.current < MAX_PARALLEL && queueRef.current.length > 0) {
      const idx = queueRef.current.shift()
      runningRef.current++

      // Mark as uploading — immutable spread (C2)
      setTasks(prev => prev.map(t => t.id === idx ? { ...t, status: 'uploading' } : t))

      uploadSingleImage(guideId, files[idx], (progress) => {
        // Cap at 79 so "Saving" stage shows after transfer completes
        setTasks(prev => prev.map(t => t.id === idx ? { ...t, progress: Math.min(progress, 79) } : t))
      })
        .then(({ data }) => {
          setTasks(prev => prev.map(t => t.id === idx ? { ...t, status: 'done', progress: 100 } : t))
          allImagesRef.current = data.images ?? allImagesRef.current
          runningRef.current--
          if (queueRef.current.length === 0 && runningRef.current === 0) {
            setAllDone(true)
            onAllDone?.(allImagesRef.current)
          } else {
            dequeue.current() // hand-off to next in queue
          }
        })
        .catch(() => {
          setTasks(prev => prev.map(t => t.id === idx ? { ...t, status: 'error' } : t))
          runningRef.current--
          dequeue.current()
        })
    }
  }

  useEffect(() => {
    if (guideId && files.length > 0) dequeue.current()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const uploading = tasks.filter(t => t.status === 'uploading').length
  const done      = tasks.filter(t => t.status === 'done').length
  const errors    = tasks.filter(t => t.status === 'error').length

  return (
    <div className="space-y-3">
      {/* Stats header */}
      <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
        <span className={uploading > 0 ? 'text-mhw-gold font-semibold' : ''}>
          {uploading} uploading
        </span>
        <span>·</span>
        <span className={done === files.length ? 'text-mhw-green font-semibold' : ''}>
          {done}/{files.length} done
        </span>
        {errors > 0 && <><span>·</span><span className="text-red-400 font-semibold">{errors} failed</span></>}
        <span className="ml-auto text-gray-600">max {MAX_PARALLEL} at once</span>
      </div>

      {/* Per-file progress rows */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id}
            className={`bg-white/5 border rounded-xl p-3 space-y-1.5 transition-colors
              ${task.status === 'uploading' ? 'border-mhw-gold/30'
              : task.status === 'done'      ? 'border-mhw-green/20'
              : task.status === 'error'     ? 'border-red-500/20'
              : 'border-white/10'}`}>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileIcon name={task.file.name} />
                <span className="text-xs text-white truncate">{task.file.name}</span>
                <span className="text-xs text-gray-600 shrink-0">
                  {(task.file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${statusBadge(task.status)}`}>
                {getStage(task.status, task.progress)}
              </span>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${barColor(task.status)}`}
                style={{ width: `${task.status === 'done' ? 100 : task.progress}%` }}
              />
            </div>

            {task.status !== 'waiting' && (
              <div className="text-right text-xs text-gray-600">
                {task.status === 'done' ? 'Complete' : task.status === 'error' ? 'Failed' : `${task.progress}%`}
              </div>
            )}
          </div>
        ))}
      </div>

      {allDone && (
        <p className="text-xs text-mhw-green font-semibold text-center">
          ✓ {done} image{done !== 1 ? 's' : ''} processed and attached to your guide!
        </p>
      )}
    </div>
  )
}
