// Fn 6.2 — Skeleton Loading for Conditional Rendering while fetching
export default function SkeletonCard({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-3">
          <div className="animate-pulse bg-white/10 rounded h-40 w-full" />
          <div className="animate-pulse bg-white/10 rounded h-4 w-3/4" />
          <div className="animate-pulse bg-white/10 rounded h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <div className="animate-pulse bg-white/10 rounded-full h-6 w-16" />
            <div className="animate-pulse bg-white/10 rounded-full h-6 w-16" />
          </div>
        </div>
      ))}
    </>
  )
}
