// Fn 2.1 — Navbar with Context API (React Router + Tailwind CSS)
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useNetworkStatus from '../../hooks/useNetworkStatus'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { isOnline, pendingSync } = useNetworkStatus()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'bg-mhw-accent text-white'
        : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`

  return (
    <nav className="bg-white/5 backdrop-blur-md border border-white/10 rounded-none border-x-0 border-t-0 sticky top-0 z-50 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐉</span>
            <span className="font-bold text-mhw-gold text-lg hidden sm:block">
              Hunter's Compendium
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            <NavLink to="/monsters" className={navLinkClass}>Monsters</NavLink>
            <NavLink to="/weapons"  className={navLinkClass}>Weapons</NavLink>
            <NavLink to="/guides"   className={navLinkClass}>Guides</NavLink>
            {isAuthenticated && (
              <NavLink to="/builds" className={navLinkClass}>My Builds</NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Network status indicator (Fn 7.4) */}
            <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-mhw-green' : 'text-yellow-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-mhw-green' : 'bg-yellow-400'}`} />
              {!isOnline && <span>Offline{pendingSync > 0 ? ` (${pendingSync})` : ''}</span>}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/profile" className="text-sm text-gray-300 hover:text-white">
                  👤 {user?.username}
                </Link>
                {user?.roles?.includes('admin') && (
                  <NavLink to="/admin" className={navLinkClass}>Admin</NavLink>
                )}
                <button onClick={handleLogout} className="px-4 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20 text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <NavLink to="/login"    className={navLinkClass}>Login</NavLink>
                <Link    to="/register" className="px-4 py-1 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
