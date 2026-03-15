// Fn 3.3 — Circuit Breaker Middleware: per-IP rate limit, no external library
// C1: uses req.ip as key  C2: 429 after limit  C3: auto-reset after window
// C4: delete cleans up old entries (no memory leak)  C5: retry_after in seconds

const WINDOW_MS = 10 * 1000  // 10 seconds
const MAX_REQUESTS = 5        // per window per IP

// In-memory tracker — plain JS object (no external DB)
const ipTracker = {}

const ipRateLimit = (req, res, next) => {
  const clientIp = req.ip  // C1: IP as key
  const now = Date.now()

  if (!ipTracker[clientIp]) {
    // First request from this IP — create record
    ipTracker[clientIp] = { count: 1, startTime: now }
    // C4: schedule auto-cleanup after window expires to prevent memory leak
    setTimeout(() => { delete ipTracker[clientIp] }, WINDOW_MS)
    return next()
  }

  const record = ipTracker[clientIp]

  // C3: window expired — reset count and start fresh
  if (now - record.startTime > WINDOW_MS) {
    delete ipTracker[clientIp]
    ipTracker[clientIp] = { count: 1, startTime: now }
    setTimeout(() => { delete ipTracker[clientIp] }, WINDOW_MS)
    return next()
  }

  record.count += 1

  // C2: over limit — block with 429
  if (record.count > MAX_REQUESTS) {
    // C5: accurate remaining time in seconds
    const retryAfter = Math.ceil((record.startTime + WINDOW_MS - now) / 1000)
    return res.status(429).json({
      error: 'Too many requests, try again later',
      retry_after: retryAfter,
    })
  }

  next()
}

module.exports = ipRateLimit
