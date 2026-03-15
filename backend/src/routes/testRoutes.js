const router = require('express').Router()
const protect = require('../middleware/auth')
const authorize = require('../middleware/authorize')

// Example route: only users with role 'editor' can access
router.get('/editor-only', protect, authorize('editor'), (req, res) => {
  res.json({ success: true, message: 'Hello editor', user: { _id: req.user._id, roles: req.user.roles } })
})

// Example route: editor OR manager
router.get('/editor-or-manager', protect, authorize('editor', 'manager'), (req, res) => {
  res.json({ success: true, message: 'Hello editor or manager', user: { _id: req.user._id, roles: req.user.roles } })
})

module.exports = router
