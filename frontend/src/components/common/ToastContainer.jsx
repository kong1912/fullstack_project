import { useEffect, useState } from 'react'

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const { type, message, opts } = e.detail
      const t = { id, type, message, ...opts }
      setToasts((s) => [...s, t])
      const ttl = opts.ttl ?? 4000
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), ttl)
    }

    window.addEventListener('mhw-toast', handler)
    return () => window.removeEventListener('mhw-toast', handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div key={t.id} className={`p-3 rounded-lg text-sm shadow-md text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-gray-700'}`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
