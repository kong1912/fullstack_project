// Fn 3.5 — Proxy / redirect to mhw-db.com for weapon data
const router = require('express').Router()
const asyncHandler  = require('../middleware/asyncHandler')
const axiosLib      = require('axios')
const createCircuitBreaker = require('../middleware/circuitBreaker')

const mhwBreaker = createCircuitBreaker('mhw-db')

// All weapon requests are proxied through our circuit breaker to mhw-db.com
router.get('/', mhwBreaker, asyncHandler(async (req, res) => {
  const { data } = await axiosLib.get('https://mhw-db.com/weapons', {
    params: req.query, timeout: 8000,
  })
  res.json({ success: true, count: data.length, data })
}))

router.get('/:id', mhwBreaker, asyncHandler(async (req, res) => {
  const { data } = await axiosLib.get(`https://mhw-db.com/weapons/${req.params.id}`, {
    timeout: 8000,
  })
  res.json({ success: true, data })
}))

module.exports = router
