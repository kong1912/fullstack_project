const router = require('express').Router()
const protect = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const { register } = require('../controllers/authController')
const { getUsers, getTrash, softDeleteUser, restoreUser } = require('../controllers/userController')

// Public registration endpoint (reuse authController.register)
router.post('/', register)

// Admin-only user management
router.use(protect, authorize('admin'))
router.get('/', getUsers)
router.get('/trash', getTrash)
router.delete('/:id', softDeleteUser)
router.patch('/:id/restore', restoreUser)

module.exports = router
