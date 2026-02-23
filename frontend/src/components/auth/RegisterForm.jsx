// Fn 6.1 + Fn 5.1 — Registration form with RHF + Zod; password hashed server-side
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const registerSchema = z.object({
  username: z.string().min(3, 'Username min 3 characters').max(30),
  email:    z.string().email('Invalid email'),
  password: z.string().min(8, 'Password min 8 characters'),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
})

export default function RegisterForm() {
  const { register: storeRegister } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) })

  const onSubmit = async ({ username, email, password }) => {
    const result = await storeRegister({ username, email, password })
    if (result.success) {
      navigate('/')
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

      {[
        { field: 'username', label: 'Username',         type: 'text',     placeholder: 'HunterName123' },
        { field: 'email',    label: 'Email',            type: 'email',    placeholder: 'hunter@example.com' },
        { field: 'password', label: 'Password',         type: 'password', placeholder: '••••••••' },
        { field: 'confirm',  label: 'Confirm Password', type: 'password', placeholder: '••••••••' },
      ].map(({ field, label, type, placeholder }) => (
        <div key={field} className="space-y-1">
          <label className="text-sm text-gray-300">{label}</label>
          <input {...register(field)} type={type} placeholder={placeholder} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-mhw-accent focus:ring-1 focus:ring-mhw-accent transition-all backdrop-blur-sm" />
          {errors[field] && <p className="text-xs text-mhw-accent">{errors[field].message}</p>}
        </div>
      ))}

      <button type="submit" disabled={isSubmitting} className="px-4 py-2.5 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full">
        {isSubmitting ? 'Registering…' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-400">
        Have an account?{' '}
        <Link to="/login" className="text-mhw-accent hover:underline">Login</Link>
      </p>
    </form>
  )
}
