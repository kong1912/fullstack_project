// Fn 6.1 — React Hook Form + Axios + proper state management
// Fn 7.2 — Glassmorphism styling
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function LoginForm() {
  const { login } = useAuthStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data) => {
    const result = await login(data)
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError('root', { message: result.message })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errors.root && (
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {errors.root.message}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm text-gray-300">Email</label>
        <input
          {...register('email')}
          type="email"
          placeholder="hunter@example.com"
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm"
        />
        {errors.email && <p className="text-xs text-mhw-accent">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-300">Password</label>
        <input
          {...register('password')}
          type="password"
          placeholder="••••••••"
          className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm"
        />
        {errors.password && <p className="text-xs text-mhw-accent">{errors.password.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full">
        {isSubmitting ? 'Logging in…' : 'Login'}
      </button>

      <p className="text-center text-sm text-gray-400">
        No account?{' '}
        <Link to="/register" className="text-mhw-accent hover:underline">Register</Link>
      </p>
    </form>
  )
}
