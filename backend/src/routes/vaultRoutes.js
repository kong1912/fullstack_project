const express = require('express')
const router = express.Router()
const userAgentGuard = require('../middleware/userAgentGuard')
const vaultController = require('../controllers/vaultController')

// GET /api/vault/stream/:filename
router.get('/stream/:filename', userAgentGuard, vaultController.stream)

module.exports = router
