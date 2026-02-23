// Fn 3.3 — In-memory circuit breaker state manager
const states = new Map()

function getDefault(key) {
  if (!states.has(key)) {
    states.set(key, {
      state: 'CLOSED',           // CLOSED | OPEN | HALF_OPEN
      failures: 0,
      lastFailureTime: null,
      halfOpenRequests: 0,
    })
  }
  return states.get(key)
}

module.exports = {
  get: getDefault,

  recordFailure(key, config) {
    const cb = getDefault(key)
    cb.failures++
    cb.lastFailureTime = Date.now()
    if (cb.failures >= config.threshold && cb.state === 'CLOSED') {
      cb.state = 'OPEN'
      console.warn(`⚡ Circuit Breaker OPEN for service: ${key}`)
    }
    if (cb.state === 'HALF_OPEN') {
      cb.state = 'OPEN'
      cb.halfOpenRequests = 0
    }
  },

  recordSuccess(key) {
    const cb = getDefault(key)
    if (cb.state === 'HALF_OPEN') {
      // Recovery successful
      cb.state = 'CLOSED'
      cb.failures = 0
      cb.halfOpenRequests = 0
      console.info(`✅ Circuit Breaker CLOSED (recovered) for service: ${key}`)
    }
    if (cb.state === 'CLOSED') {
      cb.failures = 0
    }
  },

  transition(key, targetState) {
    const cb = getDefault(key)
    cb.state = targetState
    if (targetState === 'HALF_OPEN') cb.halfOpenRequests = 0
  },

  incrementHalfOpen(key) {
    getDefault(key).halfOpenRequests++
  },

  getAll: () => Object.fromEntries(states),
}
