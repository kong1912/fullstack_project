// Fn 5.1 — Registration with auto-hash
// Fn 5.2 — Login with safe password check
// Fn 5.3 — HttpOnly cookie JWT
// Fn 5.5 — Brute force protection + Token Blacklisting logout
const asyncHandler        = require('../middleware/asyncHandler')
const User                = require('../models/User')
const generateTokenAndCookie = require('../utils/generateToken')
const tokenBlacklist      = require('../utils/tokenBlacklist')
const rateLimit           = require('express-rate-limit')

// Fn 5.5 — Brute-force guard (exported for use in router)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  // C1: limit brute-force attempts by IP. Allow 5 attempts, block thereafter.
  max:      5,
  message:  { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

// @POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    res.statusCode = 400
    throw new Error('All fields are required')
  }

  const exists = await User.findOne({ $or: [{ email }, { username }] })
  if (exists) {
    res.statusCode = 400
    throw new Error(exists.email === email ? 'Email already registered' : 'Username taken')
  }

  // Password is hashed by User pre-save hook (Fn 5.1)
  const user = await User.create({ username, email, password })
  generateTokenAndCookie(res, user._id)

  res.status(201).json({
    success: true,
    user: { _id: user._id, username: user.username, email: user.email, roles: user.roles },
  })
})

// @POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Artificial delay to slow brute-force scripts (C2)
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
  const DELAY_MS = 2000

  if (!email || !password) {
    await sleep(DELAY_MS)
    res.statusCode = 400
    throw new Error('Email and password required')
  }

  // Fn 5.2 — Must explicitly select password (select: false in schema)
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    await sleep(DELAY_MS)
    res.statusCode = 401
    throw new Error('Invalid credentials')
  }

  // Fn 5.2 — Safe comparison via bcrypt
  const match = await user.matchPassword(password)
  if (!match) {
    await sleep(DELAY_MS)
    res.statusCode = 401
    throw new Error('Invalid credentials')
  }

  if (!user.isActive) {
    await sleep(DELAY_MS)
    res.statusCode = 403
    throw new Error('Account is deactivated')
  }

  user.lastLogin = new Date()
  await user.save({ validateBeforeSave: false })

  // Delay before responding (both success and failure) to mitigate rapid automated retries
  await sleep(DELAY_MS)

  generateTokenAndCookie(res, user._id)

  res.json({
    success: true,
    user: { _id: user._id, username: user.username, email: user.email, roles: user.roles },
  })
})

// @POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.jwt

  // Fn 5.5 — Blacklist the token so it can never be reused
  if (token) tokenBlacklist.add(token)

  res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })
  res.json({ success: true, message: 'Logged out successfully' })
})

// @GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  // req.user set by protect middleware
  res.json({ success: true, user: req.user })
})

// @POST /api/auth/admin/action (admin only, Fn 5.4)
const adminAction = asyncHandler(async (req, res) => {
  const { targetUsername, action, reason } = req.body
  const target = await User.findOne({ username: targetUsername })
  if (!target) {
    res.statusCode = 404
    throw new Error('User not found')
  }

  switch (action) {
    case 'promote':  target.roles = [...new Set([...target.roles, 'admin'])]; break
    case 'demote':   target.roles = target.roles.filter((r) => r !== 'admin'); break
    case 'ban':      target.isActive = false; break
    default:
      res.statusCode = 400
      throw new Error('Unknown action')
  }
  await target.save()
  res.json({ success: true, message: `Action "${action}" applied to ${targetUsername}`, reason })
})

module.exports = { register, login, logout, getMe, adminAction, loginLimiter }
