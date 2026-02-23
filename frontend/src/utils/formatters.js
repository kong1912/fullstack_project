// Fn 1.3 — Shared utility functions (modern JS)

export const capitalize = (str = '') =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const formatWeaponType = (type = '') =>
  type.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : '—'

export const formatNumber = (n) =>
  typeof n === 'number' ? n.toLocaleString() : '—'

export const starRating = (stars, max = 3) =>
  '★'.repeat(Math.min(stars, max)) + '☆'.repeat(Math.max(0, max - stars))

export const truncate = (str = '', len = 120) =>
  str.length > len ? str.slice(0, len) + '…' : str

export const cn = (...classes) => classes.filter(Boolean).join(' ')
