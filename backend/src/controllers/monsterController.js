// Fn 3.5 — External API Integration: fetch + cache MHW monsters
// Fn 4.4 — Advanced query + pagination + $all operator
const asyncHandler        = require('../middleware/asyncHandler')
const Monster             = require('../models/Monster')
const axios               = require('axios')
const { normalizeMhwMonster } = require('../utils/helpers')

// @GET /api/monsters — Fn 3.1 Query Parameters + Fn 4.4 Pagination
const getMonsters = asyncHandler(async (req, res) => {
  const page  = Math.max(Number(req.query.page  ?? 1), 1)
  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const skip  = (page - 1) * limit

  const query = {}
  if (req.query.type)    query.type = req.query.type
  if (req.query.search)  query.$text = { $search: req.query.search }
  // Fn 4.4 — $all: find monsters with ALL specified elements
  if (req.query.elements) {
    const elems = req.query.elements.split(',').map((e) => e.trim())
    query['elements.type'] = { $all: elems }
  }

  const [monsters, total] = await Promise.all([
    Monster.find(query).sort({ name: 1 }).skip(skip).limit(limit),
    Monster.countDocuments(query),
  ])

  res.json({
    success: true,
    monsters,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

// @GET /api/monsters/:id
const getMonster = asyncHandler(async (req, res) => {
  const monster = await Monster.findOne({ mhwId: Number(req.params.id) })
  if (!monster) {
    res.statusCode = 404
    throw new Error('Monster not found')
  }
  res.json({ success: true, monster })
})

// @POST /api/monsters/sync — Admin: sync from mhw-db.com (Fn 3.5)
const syncMonsters = asyncHandler(async (_req, res) => {
  const { data } = await axios.get('https://mhw-db.com/monsters', { timeout: 15000 })

  let synced = 0
  for (const raw of data) {
    const normalized = normalizeMhwMonster(raw)
    await Monster.findOneAndUpdate(
      { mhwId: normalized.mhwId },
      normalized,
      { upsert: true, new: true, runValidators: true }
    )
    synced++
  }

  res.json({ success: true, message: `Synced ${synced} monsters from mhw-db.com` })
})

module.exports = { getMonsters, getMonster, syncMonsters }
