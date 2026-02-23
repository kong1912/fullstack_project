// Fn 1.4 — Recursive Component: monster weakness / ailment tree (arbitrary depth)
const STAR_COLORS = ['text-gray-400', 'text-yellow-400', 'text-orange-400', 'text-red-500']

function WeaknessNode({ node, depth = 0 }) {
  const { element, stars, children = [] } = node
  return (
    <li className="space-y-1">
      <div
        className="flex items-center gap-2"
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <span className={`text-sm font-medium capitalize ${STAR_COLORS[Math.min(stars, 3)]}`}>
          {'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 3 - stars))}
        </span>
        <span className="text-white text-sm capitalize">{element}</span>
      </div>

      {/* Recursive child nodes (Fn 1.4) */}
      {children.length > 0 && (
        <ul className="ml-4 border-l border-white/10 pl-2 space-y-1">
          {children.map((child) => (
            <WeaknessNode key={`${child.element}-${depth}`} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * @param {Array} weaknesses  - flat array from MHW-DB; will be tree-ified
 */
export default function WeaknessTree({ weaknesses = [] }) {
  // Sort by stars descending then render
  const sorted = [...weaknesses].sort((a, b) => b.stars - a.stars)
  // Map into tree-compatible nodes (no children from API, but structure supports nesting)
  const nodes = sorted.map((w) => ({ ...w, children: [] }))

  if (!nodes.length) return <p className="text-gray-500 text-sm">No weakness data.</p>

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
      <h4 className="text-mhw-gold font-bold mb-3 text-sm uppercase tracking-wider">
        Weakness Chart
      </h4>
      <ul className="space-y-1">
        {nodes.map((node) => (
          <WeaknessNode key={node.element} node={node} depth={0} />
        ))}
      </ul>
    </div>
  )
}
