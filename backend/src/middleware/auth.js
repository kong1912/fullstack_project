// Fn 5.3 — Protect middleware: verifies JWT from HttpOnly cookie
// Thoroughly checks current user status (not just token validity)
const jwt        = require('jsonwebtoken')
const asyncHandler = require('./asyncHandler')
const User       = require('../models/User')
const tokenBlacklist = require('../utils/tokenBlacklist')

const protect = asyncHandler(async (req, res, next) => {
  // 1. Extract token from HttpOnly cookie (Fn 5.3 — JS cannot steal it)
  const token = req.cookies?.jwt

  if (!token) {
    res.statusCode = 401
    throw new Error('Not authenticated — no token')
  }

  // 2. Check blacklist (Fn 5.5 — logout invalidation)
  if (tokenBlacklist.has(token)) {
    res.statusCode = 401
    throw new Error('Token has been invalidated. Please log in again.')
  }

  // 3. Verify signature + expiry
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  // 4. Fn 5.3 — Check user still exists and is still active
  const user = await User.findById(decoded.id).select('-password')
  if (!user) {
    res.statusCode = 401
    throw new Error('User no longer exists')
  }
  if (!user.isActive) {
    res.statusCode = 403
    throw new Error('Account is deactivated')
  }

  req.user  = user
  req.token = token
  next()
})

module.exports = protect
