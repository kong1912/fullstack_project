// Fn 7.4 — Network Status hook: tracks online/offline + flushes offline queue
import { useState, useEffect, useCallback } from 'react'
import useSyncQueueStore from '../store/syncQueueStore'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const flushQueue = useSyncQueueStore((s) => s.flushQueue)
  const queueLength = useSyncQueueStore((s) => s.queue.length)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    // Auto-flush when back online (Fn 7.4 Cache + Fn 7.5 Queue Sync)
    flushQueue()
  }, [flushQueue])

  const handleOffline = useCallback(() => setIsOnline(false), [])

  useEffect(() => {
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return { isOnline, pendingSync: queueLength }
}

export default useNetworkStatus
