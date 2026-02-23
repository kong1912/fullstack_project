import { useNavigate } from 'react-router-dom'

const RARITY_COLORS = {
  1: 'text-gray-300', 2: 'text-gray-300', 3: 'text-green-400',
  4: 'text-green-400', 5: 'text-blue-400', 6: 'text-blue-400',
  7: 'text-purple-400', 8: 'text-yellow-300', 9: 'text-orange-400',
  10: 'text-red-400', 11: 'text-red-500', 12: 'text-mhw-accent',
}

export default function WeaponCard({ weapon }) {
  const navigate = useNavigate()
  const { id, name, type, attack, rarity, elderseal, elements = [] } = weapon

  return (
    <div
      onClick={() => navigate(`/weapons/${id}`)}
      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-mhw-accent/20"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className={`font-bold text-base leading-tight ${RARITY_COLORS[rarity] ?? 'text-white'}`}>
            {name}
          </h3>
          <span className="text-xs text-gray-400 capitalize">{type?.replace(/-/g, ' ')}</span>
        </div>
        <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-gray-300">
          R{rarity}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        {attack && (
          <span className="text-white font-semibold">⚔ {attack.display}</span>
        )}
        {elderseal && (
          <span className="text-purple-300 text-xs capitalize">
            {elderseal} elderseal
          </span>
        )}
      </div>

      {elements.length > 0 && (
        <div className="mt-2 flex gap-1">
          {elements.map((el) => (
            <span key={el.type} className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-300 capitalize">
              {el.type} {el.damage}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
