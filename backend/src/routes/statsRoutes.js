// Fn 3.2 — System Info API; Fn 4.5 — Aggregation Pipeline stats
const router   = require('express').Router()
const protect  = require('../middleware/auth')
const authorize = require('../middleware/authorize')
const { getSystemInfo, getGlobalStats, getMhwData } = require('../controllers/statsController')

router.get('/global', getGlobalStats)              // Public
router.get('/system', protect, authorize('admin'), getSystemInfo) // Admin only
router.get('/mhw',    getMhwData)                  // Proxy with transform

module.exports = router
