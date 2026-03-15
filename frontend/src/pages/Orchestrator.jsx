// Fn 1.5 — Async Task Orchestrator: guide image processing pipeline
// Processes guide post images with concurrency limit (Max Parallel = 2)
import { useState, useRef } from 'react'

const MAX_PARALLEL = 2

// MHW-themed guide images to "process" for blog posts
const GUIDE_IMAGES = [
  { id: 1,  file: 'rathalos-guide-banner.jpg',      guide: 'How to Hunt Rathalos',        size: '4.2 MB' },
  { id: 2,  file: 'great-sword-build-showcase.png', guide: 'Ultimate GS Endgame Build',   size: '3.8 MB' },
  { id: 3,  file: 'nergigante-weakspot-map.jpg',    guide: 'Nergigante Weakspot Guide',   size: '5.1 MB' },
  { id: 4,  file: 'charm-farming-route.png',        guide: 'Best Charm Farming Route',    size: '2.9 MB' },
  { id: 5,  file: 'investigation-tips.jpg',         guide: 'Investigation Unlock Guide',  size: '3.3 MB' },
  { id: 6,  file: 'palico-gadgets-overview.png',    guide: 'Palico Gadgets Explained',    size: '4.7 MB' },
  { id: 7,  file: 'teostra-armor-set.jpg',          guide: 'Teostra Armor Set Breakdown', size: '3.6 MB' },
  { id: 8,  file: 'element-damage-chart.png',       guide: 'Element Damage Reference',    size: '2.1 MB' },
  { id: 9,  file: 'kulve-taroth-siege.jpg',         guide: 'Kulve Taroth Siege Guide',    size: '6.0 MB' },
  { id: 10, file: 'decoration-farming.png',         guide: 'Decoration Farming Guide',    size: '3.4 MB' },
]

// Processing stages per image
const STAGES = ['Uploading', 'Resizing', 'Compressing', 'Generating thumbnail']

// Simulates multi-stage image processing using setInterval (like a real upload pipeline)
function processTask(id, onProgress) {
  return new Promise((resolve) => {
    let progress = 0
    const interval = setInterval(() => {
      progress = Math.min(progress + Math.floor(Math.random() * 10) + 4, 100)
      onProgress(id, progress)
      if (progress >= 100) {
        clearInterval(interval)
        resolve()
      }
    }, 250)
  })
}

function getStage(progress) {
  if (progress < 25)  return STAGES[0]
  if (progress < 55)  return STAGES[1]
  if (progress < 80)  return STAGES[2]
  if (progress < 100) return STAGES[3]
  return 'Done'
}

function statusBadge(status) {
  if (status === 'running')   return 'bg-mhw-gold/20 text-mhw-gold border-mhw-gold/40'
  if (status === 'completed') return 'bg-mhw-green/20 text-mhw-green border-mhw-green/40'
  return 'bg-white/5 text-gray-500 border-white/10'
}

function barColor(status) {
  if (status === 'completed') return 'bg-mhw-green'
  if (status === 'running')   return 'bg-mhw-gold'
  return 'bg-white/10'
}

function FileIcon({ file }) {
  const ext = file.split('.').pop()
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0
      ${ext === 'png' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
      .{ext}
    </span>
  )
}

const makeInitial = () => GUIDE_IMAGES.map(img => ({ ...img, status: 'waiting', progress: 0 }))

export default function Orchestrator() {
  const [tasks,   setTasks]   = useState(makeInitial())
  const [started, setStarted] = useState(false)
  const [done,    setDone]    = useState(false)

  const queueRef   = useRef(GUIDE_IMAGES.map(i => i.id))
  const runningRef = useRef(0)

  // Core dequeue — pulls next image from queue if a concurrency slot is free
  const dequeue = useRef(null)
  dequeue.current = () => {
    while (runningRef.current < MAX_PARALLEL && queueRef.current.length > 0) {
      const id = queueRef.current.shift()
      runningRef.current++

      // Mark as running — spread prevTasks to preserve immutability (C2)
      setTasks(prevTasks =>
        prevTasks.map(t => t.id === id ? { ...t, status: 'running' } : t)
      )

      processTask(id, (taskId, progress) => {
        setTasks(prevTasks =>
          prevTasks.map(t => t.id === taskId ? { ...t, progress } : t)
        )
      }).then(() => {
        setTasks(prevTasks =>
          prevTasks.map(t => t.id === id ? { ...t, status: 'completed', progress: 100 } : t)
        )
        runningRef.current--
        if (queueRef.current.length === 0 && runningRef.current === 0) {
          setDone(true)
        } else {
          // Hand-off: as one image finishes, automatically dequeue next
          dequeue.current()
        }
      })
    }
  }

  const handleStart = () => {
    if (started) return
    setStarted(true)
    dequeue.current()
  }

  const handleReset = () => {
    queueRef.current = GUIDE_IMAGES.map(i => i.id)
    runningRef.current = 0
    setTasks(makeInitial())
    setStarted(false)
    setDone(false)
  }

  const running   = tasks.filter(t => t.status === 'running').length
  const waiting   = tasks.filter(t => t.status === 'waiting').length
  const completed = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-mhw-gold">🖼 Guide Image Processor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Processes guide post images through upload → resize → compress → thumbnail.
          Max <span className="text-mhw-gold font-semibold">{MAX_PARALLEL} images</span> at a time — queue handles the rest.
        </p>
      </div>

      {/* Stats + controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-3 text-sm">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center min-w-[72px]">
            <p className="text-gray-500 text-xs">Processing</p>
            <p className="text-mhw-gold font-bold text-lg">{running}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center min-w-[72px]">
            <p className="text-gray-500 text-xs">In Queue</p>
            <p className="text-gray-300 font-bold text-lg">{waiting}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-center min-w-[72px]">
            <p className="text-gray-500 text-xs">Done</p>
            <p className="text-mhw-green font-bold text-lg">{completed}</p>
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          {!started && (
            <button onClick={handleStart}
              className="px-5 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-bold text-sm transition-colors">
              ▶ Start Processing
            </button>
          )}
          {started && (
            <button onClick={handleReset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors border border-white/20">
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {done && (
        <div className="bg-mhw-green/10 border border-mhw-green/30 rounded-xl p-3 text-mhw-green text-sm font-semibold text-center">
          ✓ All {GUIDE_IMAGES.length} images processed and ready to attach to guides!
        </div>
      )}

      {/* Image task list */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id}
            className={`bg-white/5 border rounded-xl p-4 space-y-2 transition-colors
              ${task.status === 'running'   ? 'border-mhw-gold/30'
              : task.status === 'completed' ? 'border-mhw-green/20'
              : 'border-white/10'}`}>

            <div className="flex items-start justify-between gap-3 flex-wrap">
              {/* File info */}
              <div className="flex items-center gap-2 min-w-0">
                <FileIcon file={task.file} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{task.file}</p>
                  <p className="text-xs text-gray-500 truncate">📖 {task.guide}</p>
                </div>
              </div>
              {/* Status badge + size */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-600">{task.size}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${statusBadge(task.status)}`}>
                  {task.status === 'running' ? getStage(task.progress) : task.status}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-200 ${barColor(task.status)}`}
                style={{ width: `${task.progress}%` }}
              />
            </div>

            {task.status !== 'waiting' && (
              <div className="flex justify-between text-xs text-gray-600">
                <span>{task.status === 'completed' ? 'Processing complete — ready for guide' : getStage(task.progress)}</span>
                <span>{task.progress}%</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

