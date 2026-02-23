// Fn 1.5 — Async Flow + State management
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/formatters'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-mhw-gold">My Profile</h1>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-mhw-accent/20 flex items-center justify-center text-3xl">
            👤
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
            <p className="text-xs text-gray-400">Role</p>
            <p className="text-sm font-semibold text-mhw-green capitalize">
              {user.roles?.join(', ') ?? 'user'}
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
            <p className="text-xs text-gray-400">Member Since</p>
            <p className="text-sm text-white">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      <button onClick={handleLogout} className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20">
        Logout
      </button>
    </div>
  )
}
