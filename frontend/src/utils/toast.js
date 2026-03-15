// Minimal toast helper using CustomEvent to decouple UI
export function toast(type, message, opts = {}) {
  window.dispatchEvent(new CustomEvent('mhw-toast', { detail: { type, message, opts } }))
}

export const toastSuccess = (msg, opts) => toast('success', msg, opts)
export const toastError = (msg, opts) => toast('error', msg, opts)
export const toastInfo = (msg, opts) => toast('info', msg, opts)
