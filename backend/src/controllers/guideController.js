// Guide CRUD + voting controller
const asyncHandler = require('../middleware/asyncHandler')
const Guide        = require('../models/Guide')

// GET /api/guides — list all published guides, paginated
const getGuides = asyncHandler(async (req, res) => {
  const page  = Math.max(Number(req.query.page  ?? 1), 1)
  const limit = Math.min(Number(req.query.limit ?? 10), 50)
  const skip  = (page - 1) * limit

  const query = {}
  if (req.query.tags) {
    query.tags = { $all: req.query.tags.split(',').map(t => t.trim()) }
  }
  if (req.query.search) {
    const re = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = [{ title: re }, { body: re }]
  }

  const [guides, total] = await Promise.all([
    Guide.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
         .populate('author', 'username'),
    Guide.countDocuments(query),
  ])

  res.json({ success: true, guides, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
})

// GET /api/guides/search?tags=node,express&page=1&limit=5
const searchGuides = asyncHandler(async (req, res) => {
  const page  = Math.max(Number(req.query.page  ?? 1), 1)
  const limit = Math.min(Number(req.query.limit ?? 5), 50)
  const skip  = (page - 1) * limit

  const query = {}
  if (req.query.tags) {
    // Parse comma-separated tags into array and require all tags to be present
    const tags = req.query.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (tags.length > 0) query.tags = { $all: tags }
  }

  // Support free-text search (title or body) for server-side search
  if (req.query.search) {
    const re = new RegExp(req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    query.$or = query.$or ? [...query.$or, { title: re }, { body: re }] : [{ title: re }, { body: re }]
  }

  const [guides, total] = await Promise.all([
    Guide.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
         .populate('author', 'username'),
    Guide.countDocuments(query),
  ])

  const totalPages = Math.ceil(total / limit) || 0
  // Per checklist: return 200 with data array (possibly empty) and metadata
  res.json({ success: true, data: guides, metadata: { page, limit, totalItems: total, totalPages } })
})

// GET /api/guides/:id
const getGuide = asyncHandler(async (req, res) => {
  const guide = await Guide.findById(req.params.id).populate('author', 'username')
  if (!guide) { res.statusCode = 404; throw new Error('Guide not found') }
  res.json({ success: true, guide })
})

// POST /api/guides — create (auth required)
const createGuide = asyncHandler(async (req, res) => {
  const guide = await Guide.create({ ...req.body, author: req.user._id })
  await guide.populate('author', 'username')
  res.status(201).json({ success: true, guide })
})

// PUT /api/guides/:id — update own guide
const updateGuide = asyncHandler(async (req, res) => {
  const guide = await Guide.findOneAndUpdate(
    { _id: req.params.id, author: req.user._id },
    { title: req.body.title, body: req.body.body, tags: req.body.tags },
    { new: true, runValidators: true }
  ).populate('author', 'username')
  if (!guide) { res.statusCode = 404; throw new Error('Guide not found or not yours') }
  res.json({ success: true, guide })
})

// DELETE /api/guides/:id — soft delete own guide (or admin)
const deleteGuide = asyncHandler(async (req, res) => {
  const filter = req.user.roles.includes('admin')
    ? { _id: req.params.id }
    : { _id: req.params.id, author: req.user._id }
  const guide = await Guide.findOneAndUpdate(
    filter,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  )
  if (!guide) { res.statusCode = 404; throw new Error('Guide not found or not yours') }
  res.json({ success: true, message: 'Guide deleted' })
})

// POST /api/guides/:id/vote — body: { vote: 'up' | 'down' | 'none' }
const voteGuide = asyncHandler(async (req, res) => {
  const { vote } = req.body   // 'up' | 'down' | 'none'
  const userId = req.user._id
  const guide  = await Guide.findById(req.params.id)
  if (!guide) { res.statusCode = 404; throw new Error('Guide not found') }

  const alreadyUp   = guide.upvotedBy.some(id => id.equals(userId))
  const alreadyDown = guide.downvotedBy.some(id => id.equals(userId))

  // Remove existing vote regardless
  if (alreadyUp)   { guide.upvotedBy.pull(userId);   guide.upvotes   = Math.max(0, guide.upvotes   - 1) }
  if (alreadyDown) { guide.downvotedBy.pull(userId);  guide.downvotes = Math.max(0, guide.downvotes - 1) }

  if (vote === 'up' && !alreadyUp) {
    guide.upvotedBy.push(userId)
    guide.upvotes += 1
  } else if (vote === 'down' && !alreadyDown) {
    guide.downvotedBy.push(userId)
    guide.downvotes += 1
  }

  await guide.save()
  const userVote = guide.upvotedBy.some(id => id.equals(userId)) ? 'up'
                 : guide.downvotedBy.some(id => id.equals(userId)) ? 'down' : 'none'
  res.json({ success: true, upvotes: guide.upvotes, downvotes: guide.downvotes, userVote })
})

// POST /api/guides/:id/images — upload 1-5 images, append to guide.images
const uploadGuideImages = asyncHandler(async (req, res) => {
  const guide = await Guide.findOne({ _id: req.params.id, author: req.user._id })
  if (!guide) { res.statusCode = 404; throw new Error('Guide not found or not yours') }
  if (!req.files?.length) { res.statusCode = 400; throw new Error('No files uploaded') }

  // Convert each uploaded file buffer to a base64 data URL and store in MongoDB
  const dataUrls = req.files.map(f => `data:${f.mimetype};base64,${f.buffer.toString('base64')}`)
  guide.images.push(...dataUrls)
  await guide.save()
  res.json({ success: true, newImages: dataUrls, images: guide.images })
})

module.exports = { getGuides, searchGuides, getGuide, createGuide, updateGuide, deleteGuide, voteGuide, uploadGuideImages }
