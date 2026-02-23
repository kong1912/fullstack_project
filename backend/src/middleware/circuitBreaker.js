// Fn 3.3 — Circuit Breaker Middleware: temporarily cuts off IPs that exceed call limits
// States: CLOSED (normal) → OPEN (blocked) → HALF_OPEN (testing recovery)

const circuitBreakerState = require('../utils/circuitBreakerState')

const DEFAULTS = {
  threshold:    5,    // failures before OPEN
  timeout:      30000, // ms to stay OPEN before HALF_OPEN
  halfOpenMax:  2,    // max requests allowed in HALF_OPEN state
}

/**
 * Factory: creates a circuit breaker middleware for a specific service key
 * @param {string} serviceKey  - e.g. 'mhw-db', 'mongodb'
 * @param {object} [options]
 */
const createCircuitBreaker = (serviceKey, options = {}) => {
  const config = { ...DEFAULTS, ...options }

  return (req, res, next) => {
    const cb = circuitBreakerState.get(serviceKey)

    if (cb.state === 'OPEN') {
      const elapsed = Date.now() - cb.lastFailureTime
      if (elapsed > config.timeout) {
        // Attempt recovery
        circuitBreakerState.transition(serviceKey, 'HALF_OPEN')
      } else {
        return res.status(503).json({
          success: false,
          message: `Service "${serviceKey}" is temporarily unavailable. Retry after ${Math.ceil((config.timeout - elapsed) / 1000)}s.`,
          circuitBreaker: 'OPEN',
        })
      }
    }

    if (cb.state === 'HALF_OPEN' && cb.halfOpenRequests >= config.halfOpenMax) {
      return res.status(503).json({
        success: false,
        message: `Service "${serviceKey}" is recovering. Please wait.`,
        circuitBreaker: 'HALF_OPEN',
      })
    }

    // Track the request for the service
    res.on('finish', () => {
      if (res.statusCode >= 500) {
        circuitBreakerState.recordFailure(serviceKey, config)
      } else {
        circuitBreakerState.recordSuccess(serviceKey)
      }
    })

    if (cb.state === 'HALF_OPEN') {
      circuitBreakerState.incrementHalfOpen(serviceKey)
    }

    next()
  }
}

module.exports = createCircuitBreaker
