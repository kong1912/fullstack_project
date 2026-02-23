// Fn 3.2 — System Information API endpoint
// Fn 3.5 — External API Integration + Data Transformation
// Fn 4.5 — Aggregation Pipeline for global stats
const asyncHandler     = require('../middleware/asyncHandler')
const User             = require('../models/User')
const Build            = require('../models/Build')
const si               = require('systeminformation')
const axios            = require('axios')
const { getMemoryUsage, normalizeMhwMonster } = require('../utils/helpers')
const circuitBreakerState = require('../utils/circuitBreakerState')

// @GET /api/stats/system — Fn 3.2 Real server system information
const getSystemInfo = asyncHandler(async (_req, res) => {
  const [cpu, mem, osInfo, nodeLoad] = await Promise.all([
    si.cpu(), si.mem(), si.osInfo(), si.currentLoad(),
  ])

  res.json({
    success: true,
    system: {
      platform:    osInfo.platform,
      distro:      osInfo.distro,
      arch:        osInfo.arch,
      cpuBrand:    cpu.brand,
      cpuCores:    cpu.cores,
      cpuLoad:     `${nodeLoad.currentLoad.toFixed(1)}%`,
      ...getMemoryUsage(),
      nodeVersion: process.version,
      uptime:      `${Math.floor(process.uptime())}s`,
    },
    circuitBreakers: circuitBreakerState.getAll(),
  })
})

// @GET /api/stats/global — Fn 4.5 Aggregation Pipeline
const getGlobalStats = asyncHandler(async (_req, res) => {
  const [buildStats, userCount] = await Promise.all([
    Build.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id:        null,
          totalBuilds:  { $sum: 1 },
          publicBuilds: { $sum: { $cond: ['$isPublic', 1, 0] } },
          totalLikes:   { $sum: '$likes' },
          avgLikes:     { $avg: '$likes' },
        },
      },
      { $project: { _id: 0 } },
    ]),
    User.countDocuments({ isActive: true }),
  ])

  res.json({
    success: true,
    ...(buildStats[0] ?? { totalBuilds: 0, publicBuilds: 0, totalLikes: 0 }),
    activeUsers: userCount,
    generatedAt: new Date(),
  })
})

// @GET /api/stats/mhw-proxy — Fn 3.5 External API Integration + Data Transformation
const getMhwData = asyncHandler(async (req, res) => {
  const type = req.query.type || 'monsters'
  const { data } = await axios.get(`https://mhw-db.com/${type}`, { timeout: 8000 })

  // Fn 3.5 — Transform to internal format
  const transformed = type === 'monsters'
    ? data.map(normalizeMhwMonster)
    : data

  res.json({ success: true, count: transformed.length, data: transformed })
})

module.exports = { getSystemInfo, getGlobalStats, getMhwData }
