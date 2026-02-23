// Fn 7.2 — Glassmorphism layout; Fn 6.1 — RHF Login form
import LoginForm from '../components/auth/LoginForm'

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      {/* Fn 7.2 — Glassmorphism card */}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🐉</span>
          <h1 className="text-2xl font-extrabold text-mhw-gold">Welcome Back, Hunter</h1>
          <p className="text-gray-400 mt-1 text-sm">Sign in to access your builds</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
