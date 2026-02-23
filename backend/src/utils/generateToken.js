// Fn 5.2 / Fn 5.3 — JWT signing utility
const jwt = require('jsonwebtoken')

/**
 * Generate JWT and set it as an HttpOnly cookie (Fn 5.3)
 * @param {object} res   - Express response
 * @param {string} userId
 */
const generateTokenAndCookie = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

  // Fn 5.3 — HttpOnly cookie: JavaScript cannot read this
  res.cookie('jwt', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  })

  return token
}

module.exports = generateTokenAndCookie
