const asyncHandler = require('../middleware/asyncHandler')
const User = require('../models/User')

// @GET /api/users — list non-deleted users (admin)
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: false }).select('-password')
  res.json({ success: true, users })
})

// @GET /api/users/trash — list deleted users (admin)
const getTrash = asyncHandler(async (req, res) => {
  const users = await User.find({ isDeleted: true }).select('-password')
  res.json({ success: true, users })
})

// @DELETE /api/users/:id — soft delete
const softDeleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  if (user.isDeleted) {
    return res.json({ success: true, message: 'User already deleted' })
  }
  user.isDeleted = true
  user.deletedAt = new Date()
  await user.save()
  res.json({ success: true, message: 'User soft-deleted', user: { _id: user._id, username: user.username, isDeleted: user.isDeleted, deletedAt: user.deletedAt } })
})

// @PATCH /api/users/:id/restore — restore soft-deleted user
const restoreUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }
  user.isDeleted = false
  user.deletedAt = null
  await user.save()
  res.json({ success: true, message: 'User restored', user: { _id: user._id, username: user.username } })
})

module.exports = { getUsers, getTrash, softDeleteUser, restoreUser }
