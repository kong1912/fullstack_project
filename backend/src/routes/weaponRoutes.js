// Fn 3.5 — Proxy / redirect to mhw-db.com for weapon data
const router = require('express').Router()
const asyncHandler  = require('../middleware/asyncHandler')
const axiosLib      = require('axios')
const createCircuitBreaker = require('../middleware/circuitBreaker')

const mhwBreaker = createCircuitBreaker('mhw-db')

function transformWeapon(src) {
  if (!src) return null
  return {
    weaponId: src._id || src.id || null,
    weaponName: src.name || src.title || null,
    weaponType: src.type || src.weaponType || null,
    attack: src.attack || (src.damage ? { physical: src.damage } : null),
    elements: src.elements || [],
    raw: src, // keep original for debugging / backward compatibility
  }
}

// List endpoint — fetch, transform, inject headers
router.get('/', mhwBreaker, asyncHandler(async (req, res) => {
  try {
    const { data } = await axiosLib.get('https://mhw-db.com/weapons', {
      params: req.query, timeout: 8000,
    })

    const transformed = Array.isArray(data) ? data.map(transformWeapon) : []
    // Header injection required by checklist
    res.set('X-Powered-By', 'MHW-Proxy')
    res.set('X-Student-ID', process.env.STUDENT_ID || 'student-000')

    return res.json({ success: true, count: transformed.length, data: transformed })
  } catch (err) {
    console.error('Weapon proxy error (list):', err.message || err)
    // 502 Bad Gateway for upstream failures
    return res.status(502).json({ error: 'Bad Gateway', message: 'Failed to fetch weapons from upstream' })
  }
}))

// Single weapon endpoint — return upstream data unchanged
router.get('/:id', mhwBreaker, asyncHandler(async (req, res) => {
  try {
    const { data } = await axiosLib.get(`https://mhw-db.com/weapons/${req.params.id}`, {
      timeout: 8000,
    })

    // Do not transform single resource; return upstream shape
    res.set('X-Powered-By', 'MHW-Proxy')
    res.set('X-Student-ID', process.env.STUDENT_ID || 'student-000')

    return res.json({ success: true, data })
  } catch (err) {
    console.error('Weapon proxy error (single):', err.message || err)
    return res.status(502).json({ error: 'Bad Gateway', message: 'Failed to fetch weapon from upstream' })
  }
}))

module.exports = router
