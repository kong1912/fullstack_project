// Fn 2.4 — C4: Zod validation blocks advance; C2: data persists in Zustand when navigating back
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { stepSchemas } from '../context/MultiStepFormContext'
import useBuildFormStore from '../store/useBuildFormStore'

export default function BuildStep1() {
  const { data, validateAndSave } = useBuildFormStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(stepSchemas[0]),
    // C2: defaultValues populated from Zustand — data persists if user navigates back
    defaultValues: { name: data.name, style: data.style },
  })

  const onSubmit = async (fields) => {
    // C4: validateAndSave runs Zod schema — returns false if invalid
    const ok = await validateAndSave(0, fields)
    if (ok) navigate('/builds/create/step2')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm text-gray-300">Build Name</label>
        <input
          {...register('name')}
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all"
          placeholder="My Ultimate Build"
        />
        {errors.name && <p className="text-xs text-mhw-accent">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-300">Play Style</label>
        <select
          {...register('style')}
          className="w-full px-4 py-2 bg-mhw-dark border border-white/20 rounded-lg text-white focus:outline-none focus:border-mhw-accent transition-all"
        >
          {['aggressive', 'defensive', 'balanced', 'support'].map((s) => (
            <option key={s} value={s} className="bg-mhw-dark capitalize">
              {s}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all"
      >
        Next →
      </button>
    </form>
  )
}
