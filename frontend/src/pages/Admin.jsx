// Fn 2.5 — RBAC Admin panel (admin role only, guard in ProtectedRoute)
// Fn 4.5 & Fn 3.2 — Shows server aggregation stats + system info
import { useState, useEffect } from 'react'
import axiosInstance from '../api/axiosInstance'
import LoadingSpinner from '../components/common/LoadingSpinner'
import DynamicForm from '../components/forms/DynamicForm'

// Fn 6.5 — Dynamic form schema for admin actions
const adminActionSchema = [
  { name: 'targetUsername', label: 'Target Username', type: 'text', required: true },
  { name: 'action', label: 'Action', type: 'select', required: true,
    options: [
      { value: 'promote',  label: 'Promote to Admin' },
      { value: 'demote',   label: 'Demote to User' },
      { value: 'ban',      label: 'Ban User' },
    ]
  },
  { name: 'reason', label: 'Reason', type: 'textarea', rows: 2 },
]

export default function Admin() {
  const [stats,    setStats]    = useState(null)
  const [sysInfo,  setSysInfo]  = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axiosInstance.get('/stats/global').catch(() => ({ data: null })),
      axiosInstance.get('/stats/system').catch(() => ({ data: null })),
    ]).then(([statsRes, sysRes]) => {
      setStats(statsRes.data)
      setSysInfo(sysRes.data)
      setIsLoading(false)
    })
  }, [])

  const handleAdminAction = async (data) => {
    try {
      await axiosInstance.post('/auth/admin/action', data)
      alert(`Action "${data.action}" applied to ${data.targetUsername}`)
    } catch (err) {
      alert(err.response?.data?.message ?? 'Action failed')
    }
  }

  if (isLoading) return <LoadingSpinner text="Loading admin data…" />

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-3xl font-extrabold text-mhw-accent">Admin Dashboard</h1>

      {/* Global stats (Fn 4.5 aggregation) */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-2xl font-bold text-mhw-gold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* System info (Fn 3.2) */}
      {sysInfo && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 space-y-2">
          <h2 className="font-bold text-mhw-gold mb-3">Server Status (Fn 3.2)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {Object.entries(sysInfo).map(([k, v]) => (
              <div key={k} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3">
                <p className="text-xs text-gray-400 capitalize">{k}</p>
                <p className="text-white font-medium truncate">{String(v)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic admin form (Fn 6.5) */}
      <div className="max-w-md">
        <h2 className="font-bold text-white mb-4">User Management</h2>
        <DynamicForm schema={adminActionSchema} onSubmit={handleAdminAction} title="Admin Action" />
      </div>
    </div>
  )
}
