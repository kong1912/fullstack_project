// Fn 3.1 — Node.js project setup, Middleware, Query Parameters, HTTP Status Codes
const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const dotenv     = require('dotenv')
const connectDB  = require('./src/config/db')
const errorHandler = require('./src/middleware/errorHandler')

dotenv.config()
connectDB()

const app = express()

// ── Core Middleware ────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,             // Required for HttpOnly cookie (Fn 5.3)
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Cookie parser for HttpOnly JWT (Fn 5.3)
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// Fn 3.3 — Circuit Breaker: per-IP rate limit (max 5 req / 10 s, no external lib)
const ipRateLimit = require('./src/middleware/ipRateLimit')
// Apply IP rate limit only to the /health route below (don't register globally)

// Serve uploaded guide images
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./src/routes/authRoutes'))
app.use('/api/monsters',  require('./src/routes/monsterRoutes'))
app.use('/api/weapons',   require('./src/routes/weaponRoutes'))
app.use('/api/builds',    require('./src/routes/buildRoutes'))
app.use('/api/stats',     require('./src/routes/statsRoutes'))
app.use('/api/guides',    require('./src/routes/guideRoutes'))
app.use('/api/comments',  require('./src/routes/commentRoutes'))
app.use('/api/vault',     require('./src/routes/vaultRoutes'))
app.use('/api/users',     require('./src/routes/userRoutes'))
app.use('/api/test',      require('./src/routes/testRoutes'))

// Fn 3.2 — Interactive real-time health monitoring (C1-C5)
// GET /health — system metrics via Node.js built-in os/process modules
app.get('/health', ipRateLimit, (_req, res) => {
  const mem = process.memoryUsage()
  res.status(200).json({
    status: 'ok',
    uptime:           Math.floor(process.uptime()),          // C2: real-time, grows each refresh
    memory_usage_mb:  Math.round(mem.rss / 1024 / 1024 * 10) / 10, // C3: Bytes → MB
    timestamp:        new Date().toISOString(),               // C4: ISO 8601 with T and Z
  })
})

// Fn 3.1 — Identity Scanner: reads req.query.token, returns 200/401 JSON
app.get('/scan', (req, res) => {
  const userToken = req.query.token
  if (userToken === 'admin') {
    return res.status(200).json({ status: 'authorized', clearance: 'high' })
  }
  return res.status(401).json({ status: 'unauthorized', clearance: 'none' })
})

// ── Error handler (must be last) ───────────────────────────────────────────────
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`🐉 MHW API running on port ${PORT} [${process.env.NODE_ENV}]`)
)

module.exports = app
