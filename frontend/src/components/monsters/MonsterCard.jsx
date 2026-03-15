// Fn 2.2 — Dynamic Routing card; navigates to /monsters/:id
import { useNavigate } from 'react-router-dom'

const ELEMENT_COLORS = {
  fire: 'text-orange-400', water: 'text-blue-400', thunder: 'text-yellow-300',
  ice: 'text-cyan-300',    dragon: 'text-purple-400', poison: 'text-green-400',
  default: 'text-gray-300',
}

export default function MonsterCard({ monster }) {
  const navigate = useNavigate()
  const { id, name, type, elements = [], weaknesses = [] } = monster

  return (
    <div
      onClick={() => navigate(`/monsters/${id}`)}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-mhw-accent/20"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">{name}</h3>
          <span className="text-xs text-gray-400 capitalize">{type}</span>
        </div>
      </div>

      {/* Elements */}
      {elements.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {elements.map((el) => (
            <span
              key={el.type}
              className={`text-xs px-2 py-0.5 rounded-full bg-white/10 font-medium ${
                ELEMENT_COLORS[el.type] ?? ELEMENT_COLORS.default
              }`}
            >
              {el.type}
            </span>
          ))}
        </div>
      )}

      {/* Top weaknesses */}
      {weaknesses.length > 0 && (
        <div className="text-xs text-gray-400">
          Weak to:{' '}
          <span className="text-mhw-accent font-medium">
            {weaknesses
              .filter((w) => w.stars >= 2)
              .slice(0, 3)
              .map((w) => w.element)
              .join(', ') || '—'}
          </span>
        </div>
      )}
    </div>
  )
}
