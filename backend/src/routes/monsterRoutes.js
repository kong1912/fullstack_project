const router     = require('express').Router()
const protect    = require('../middleware/auth')
const authorize  = require('../middleware/authorize')
const { getMonsters, getMonster, syncMonsters } = require('../controllers/monsterController')
const createCircuitBreaker = require('../middleware/circuitBreaker')

// Fn 3.3 — Circuit breaker for external API-backed routes
const mhwBreaker = createCircuitBreaker('mhw-db', { threshold: 5, timeout: 30000 })

router.get('/',     getMonsters)
router.get('/:id',  getMonster)

// Admin: sync from mhw-db.com (Fn 3.3 circuit breaker + Fn 5.4 RBAC)
router.post('/sync', protect, authorize('admin'), mhwBreaker, syncMonsters)

module.exports = router
