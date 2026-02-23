// Fn 7.5 — Offline Queue Sync: stores pending mutations when offline, replays on reconnect
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import axiosInstance from '../api/axiosInstance'

const useSyncQueueStore = create(
  persist(
    (set, get) => ({
      queue: [],       // Array of { id, method, url, data, timestamp }
      isSyncing: false,

      // Enqueue a mutation when offline
      enqueue: (method, url, data = {}) => {
        const item = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          method: method.toUpperCase(),
          url,
          data,
          timestamp: new Date().toISOString(),
        }
        set((s) => ({ queue: [...s.queue, item] }))
      },

      dequeue: (id) =>
        set((s) => ({ queue: s.queue.filter((item) => item.id !== id) })),

      // Flush all queued operations when back online
      flushQueue: async () => {
        const { queue, isSyncing, dequeue } = get()
        if (isSyncing || queue.length === 0) return

        set({ isSyncing: true })
        for (const item of queue) {
          try {
            await axiosInstance({ method: item.method, url: item.url, data: item.data })
            dequeue(item.id)
          } catch (err) {
            // Leave in queue if server-side error; remove on 4xx (invalid)
            if (err.response?.status >= 400 && err.response?.status < 500) {
              dequeue(item.id)
            }
          }
        }
        set({ isSyncing: false })
      },

      clearQueue: () => set({ queue: [] }),
    }),
    {
      name: 'mhw-sync-queue',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useSyncQueueStore
