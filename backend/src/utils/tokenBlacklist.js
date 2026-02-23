// Fn 5.5 — Token Blacklist (in-memory Set; replace with Redis in production)
// Stores invalidated JWT tokens until they expire

const blacklist = new Set()

// Auto-prune expired tokens every 15 minutes to prevent memory leak
setInterval(() => {
  const jwt = require('jsonwebtoken')
  for (const token of blacklist) {
    try {
      jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      blacklist.delete(token) // expired — no need to blacklist
    }
  }
}, 15 * 60 * 1000)

module.exports = blacklist
