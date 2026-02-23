// Fn 6.3 — Context API + Multi-step form + Zod Schema + Persistence + Async Validation
import { useMultiStep } from '../../context/MultiStepFormContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stepSchemas } from '../../context/MultiStepFormContext'

// ----- Step sub-components -----
function Step1() {
  const { data, nextStep, errors: ctxErrors } = useMultiStep()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(stepSchemas[0]),
    defaultValues: { name: data.name, style: data.style },
  })
  return (
    <form onSubmit={handleSubmit(nextStep)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-gray-300">Build Name</label>
        <input {...register('name')} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm" placeholder="My Ultimate Build" />
        {errors.name && <p className="text-xs text-mhw-accent">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-300">Play Style</label>
        <select {...register('style')} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm">
          {['aggressive', 'defensive', 'balanced', 'support'].map((s) => (
            <option key={s} value={s} className="bg-mhw-dark capitalize">{s}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full">Next →</button>
    </form>
  )
}

function Step2() {
  const { data, nextStep, prevStep } = useMultiStep()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(stepSchemas[1]),
    defaultValues: { weaponId: data.weaponId, weaponType: data.weaponType },
  })
  return (
    <form onSubmit={handleSubmit(nextStep)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-gray-300">Weapon ID</label>
        <input {...register('weaponId')} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm" placeholder="e.g. 1234" />
        {errors.weaponId && <p className="text-xs text-mhw-accent">{errors.weaponId.message}</p>}
      </div>
      <div className="space-y-1">
        <label className="text-sm text-gray-300">Weapon Type</label>
        <input {...register('weaponType')} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm" placeholder="e.g. great-sword" />
        {errors.weaponType && <p className="text-xs text-mhw-accent">{errors.weaponType.message}</p>}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={prevStep} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20 flex-1">← Back</button>
        <button type="submit" className="px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1">Next →</button>
      </div>
    </form>
  )
}

function Step3() {
  const { nextStep, prevStep } = useMultiStep()
  const SLOTS = ['helmId', 'chestId', 'glovesId', 'waistId', 'legsId']
  const { register, handleSubmit } = useForm({ resolver: zodResolver(stepSchemas[2]) })
  return (
    <form onSubmit={handleSubmit(nextStep)} className="space-y-3">
      {SLOTS.map((slot) => (
        <div key={slot} className="space-y-1">
          <label className="text-xs text-gray-400 capitalize">{slot.replace('Id', '')}</label>
          <input {...register(slot)} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm text-sm" placeholder="Armor ID (optional)" />
        </div>
      ))}
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={prevStep} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20 flex-1">← Back</button>
        <button type="submit" className="px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1">Next →</button>
      </div>
    </form>
  )
}

function Step4() {
  const { submit, prevStep, data } = useMultiStep()
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(stepSchemas[3]),
    defaultValues: { notes: data.notes },
  })
  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-gray-300">Notes (optional)</label>
        <textarea {...register('notes')} rows={3} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm resize-none"
          placeholder="Strategy, tips…" />
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={prevStep} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20 flex-1">← Back</button>
        <button type="submit" className="px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1">💾 Save Build</button>
      </div>
    </form>
  )
}

const STEPS = [
  { title: 'Basic Info',  component: Step1 },
  { title: 'Weapon',      component: Step2 },
  { title: 'Armor',       component: Step3 },
  { title: 'Finalize',    component: Step4 },
]

// ----- Container -----
export default function MultiStepForm() {
  const { step, totalSteps } = useMultiStep()
  const CurrentStep = STEPS[step]?.component

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-md mx-auto space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{STEPS[step]?.title}</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-mhw-accent rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((s, i) => (
            <div key={s.title}
              className={`text-xs ${i <= step ? 'text-mhw-accent' : 'text-gray-600'}`}>
              {i < step ? '✓' : i === step ? '●' : '○'}
            </div>
          ))}
        </div>
      </div>

      {CurrentStep && <CurrentStep />}
    </div>
  )
}
