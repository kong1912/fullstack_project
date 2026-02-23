// Fn 1.4 — Recursive Component: weapon crafting tree (nodes have .previous for ancestry)
function WeaponNode({ weapon, allWeapons, depth = 0 }) {
  // Fn 1.4: find children recursively
  const children = allWeapons.filter(
    (w) => w.crafting?.upgrades?.some?.((u) => u.id === weapon.id) ||
           w.crafting?.craftable === false && w.crafting?.previous?.id === weapon.id
  )

  return (
    <li className="space-y-1">
      <div
        className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2"
        style={{ marginLeft: `${depth * 20}px` }}
      >
        <span className="text-mhw-gold font-bold text-sm">{weapon.name}</span>
        {weapon.attack && (
          <span className="text-xs text-gray-400 ml-auto">
            ATK {weapon.attack.display}
          </span>
        )}
        {weapon.rarity && (
          <span className="text-xs px-1.5 py-0.5 bg-mhw-accent/30 text-mhw-accent rounded">
            R{weapon.rarity}
          </span>
        )}
      </div>

      {/* Recursive children (Fn 1.4) */}
      {children.length > 0 && (
        <ul className="border-l-2 border-mhw-accent/20 ml-4 pl-2 space-y-1">
          {children.map((child) => (
            <WeaponNode
              key={child.id}
              weapon={child}
              allWeapons={allWeapons}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * @param {object} rootWeapon - the weapon at the root of this branch
 * @param {Array}  allWeapons - full list of weapons of the same type (for recursion)
 */
export default function WeaponTree({ rootWeapon, allWeapons = [] }) {
  if (!rootWeapon) return null
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
      <h4 className="text-mhw-gold font-bold mb-3 text-sm uppercase tracking-wider">
        Upgrade Tree
      </h4>
      <ul>
        <WeaponNode weapon={rootWeapon} allWeapons={allWeapons} depth={0} />
      </ul>
    </div>
  )
}
