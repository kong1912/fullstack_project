// Fn 2.4 — Persistent local storage hook
import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const toStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(toStore)
      window.localStorage.setItem(key, JSON.stringify(toStore))
    } catch (err) {
      console.error('useLocalStorage set error:', err)
    }
  }

  const removeValue = () => {
    window.localStorage.removeItem(key)
    setStoredValue(initialValue)
  }

  return [storedValue, setValue, removeValue]
}

export default useLocalStorage
