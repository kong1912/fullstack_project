// Fn 4.1 — CRUD with Mongoose + Express
// Fn 4.2 — Hard Delete + Soft Delete
// Fn 4.3 — Atomic Update (likes, $inc)
// Fn 4.4 — Advanced query, $all on tags, Pagination
const asyncHandler = require('../middleware/asyncHandler')
const Build        = require('../models/Build')

// @GET /api/builds — get own builds with pagination (Fn 4.4)
const getBuilds = asyncHandler(async (req, res) => {
  const page  = Math.max(Number(req.query.page  ?? 1), 1)
  const limit = Math.min(Number(req.query.limit ?? 10), 50)
  const skip  = (page - 1) * limit

  // Fn 4.4 — $all operator: filter by required tags
  const query = { owner: req.user._id }
  if (req.query.tags) {
    const tags = req.query.tags.split(',').map((t) => t.trim())
    query.tags = { $all: tags }
  }

  const [builds, total] = await Promise.all([
    Build.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit)
         .populate('owner', 'username'),
    Build.countDocuments(query),
  ])

  res.json({
    success: true,
    builds,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

// @GET /api/builds/:id
const getBuild = asyncHandler(async (req, res) => {
  const build = await Build.findOne({ _id: req.params.id, owner: req.user._id })
    .populate('owner', 'username')
  if (!build) {
    res.statusCode = 404
    throw new Error('Build not found')
  }
  res.json({ success: true, build })
})

// @POST /api/builds
const createBuild = asyncHandler(async (req, res) => {
  const build = await Build.create({ ...req.body, owner: req.user._id })
  res.status(201).json({ success: true, build })
})

// @PUT /api/builds/:id
const updateBuild = asyncHandler(async (req, res) => {
  const build = await Build.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    req.body,
    { new: true, runValidators: true }
  )
  if (!build) {
    res.statusCode = 404
    throw new Error('Build not found')
  }
  res.json({ success: true, build })
})

// @DELETE /api/builds/:id/hard — Fn 4.2 Hard Delete
const hardDeleteBuild = asyncHandler(async (req, res) => {
  const build = await Build.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
  if (!build) {
    res.statusCode = 404
    throw new Error('Build not found')
  }
  res.json({ success: true, message: 'Build permanently deleted' })
})

// @DELETE /api/builds/:id — Fn 4.2 Soft Delete (default)
const softDeleteBuild = asyncHandler(async (req, res) => {
  const build = await Build.findOne({ _id: req.params.id, owner: req.user._id })
  if (!build) {
    res.statusCode = 404
    throw new Error('Build not found')
  }
  await build.softDelete(req.user._id)
  res.json({ success: true, message: 'Build moved to trash' })
})

// @POST /api/builds/:id/like — Fn 4.3 Atomic Update with $inc
const likeBuild = asyncHandler(async (req, res) => {
  const build = await Build.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },   // Fn 4.3 — Atomic increment
    { new: true }
  )
  if (!build) {
    res.statusCode = 404
    throw new Error('Build not found')
  }
  res.json({ success: true, likes: build.likes })
})

module.exports = { getBuilds, getBuild, createBuild, updateBuild, hardDeleteBuild, softDeleteBuild, likeBuild }
