// Fn 2.4 — C1: Nested route layout — <Outlet /> renders step content without re-mounting
// C3: Progress bar reflects the actual step the user is on (derived from URL)
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import useBuildFormStore from '../store/useBuildFormStore'

const STEPS = [
  { path: 'step1', title: 'Basic Info' },
  { path: 'step2', title: 'Weapon & Armor' },
  { path: 'step3', title: 'Finalize' },
]

export default function BuildCreate() {
  const location = useLocation()
  const navigate  = useNavigate()
  const reset     = useBuildFormStore((s) => s.reset)

  // C3: Determine current step from URL — progress bar always matches where user is
  const stepIndex = STEPS.findIndex((s) => location.pathname.endsWith(s.path))
  const current   = Math.max(0, stepIndex)

  const handleCancel = () => {
    reset()
    navigate('/builds')
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold text-mhw-gold">Build Wizard</h1>
        <button
          onClick={handleCancel}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ✕ Cancel
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-2xl mx-auto space-y-6">
        {/* C3: Progress bar — tracks actual URL step, never wrong even after back-button */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Step {current + 1} of {STEPS.length}</span>
            <span className="text-mhw-gold">{STEPS[current]?.title}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-mhw-accent rounded-full transition-all duration-500"
              style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <div
                key={s.path}
                className={`text-xs ${i <= current ? 'text-mhw-accent' : 'text-gray-600'}`}
              >
                {i < current ? '✓' : i === current ? '●' : '○'}
              </div>
            ))}
          </div>
        </div>

        {/* C1: Outlet — step content renders here; layout (progress bar) never re-mounts */}
        <Outlet />
      </div>
    </div>
  )
}
