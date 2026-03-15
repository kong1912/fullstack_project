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

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }))

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
