// Fn 2.1 — Home page with Tailwind CSS + Context API
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  { title: 'Monster Compendium', desc: 'Full ecology, weaknesses & loot tables from mhw-db.com', link: '/monsters' },
  { title: 'Weapon Database',   desc: 'Every weapon tree with recursive upgrade paths visualized', link: '/weapons' },
  { title: 'Build Simulator',   desc: 'Craft & save your perfect gear loadout, synced to the cloud', link: '/builds' },
]

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="relative w-full py-24 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-mhw-accent/10 via-transparent to-mhw-card/30 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            MH{' '}
            <span className="text-mhw-gold">Wiki</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
            The ultimate wiki &amp; gear simulator for Monster Hunter
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/monsters" className="px-8 py-3 bg-mhw-accent hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 text-base">
              Browse Monsters
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20 text-base">
                Join the Hunt
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/builds" className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-all duration-200 border border-white/20 text-base">
                My Builds
              </Link>
            )}
          </div>
          {isAuthenticated && (
            <p className="text-mhw-green text-sm">Welcome back, {user?.username}! 🎯</p>
          )}
        </div>
      </section>

      {/* Feature cards */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon, title, desc, link }) => (
            <Link key={title} to={link}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-mhw-accent/20 text-center space-y-3 block">
              <span className="text-4xl block">{icon}</span>
              <h3 className="font-bold text-mhw-gold text-lg">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
