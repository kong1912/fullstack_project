// Fn 3.1 — Express Router setup; Fn 5.5 — Rate Limiting
const router = require('express').Router()
const { register, login, logout, getMe, adminAction, loginLimiter } = require('../controllers/authController')
const protect   = require('../middleware/auth')
const authorize = require('../middleware/authorize')

router.post('/register', register)
router.post('/login',    loginLimiter, login)  // Fn 5.5 — brute force protection
router.post('/logout',   protect, logout)
router.get( '/me',       protect, getMe)

// Admin only route (Fn 5.4 — Factory Function RBAC)
router.post('/admin/action', protect, authorize('admin'), adminAction)

module.exports = router
