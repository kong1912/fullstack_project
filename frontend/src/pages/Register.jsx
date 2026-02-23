// Fn 7.2 — Glassmorphism; Fn 6.1 — RHF Register form
import RegisterForm from '../components/auth/RegisterForm'

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🗡️</span>
          <h1 className="text-2xl font-extrabold text-mhw-gold">Join the Hunt</h1>
          <p className="text-gray-400 mt-1 text-sm">Create your hunter account</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}
