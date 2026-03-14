// Comment controller — threaded comments with like/dislike voting
const asyncHandler = require('../middleware/asyncHandler')
const Comment      = require('../models/Comment')

// GET /api/comments?targetType=guide&targetId=xxx&parent=null&page=1
const getComments = asyncHandler(async (req, res) => {
  const { targetType, targetId, parent = 'null' } = req.query
  const page  = Math.max(Number(req.query.page  ?? 1), 1)
  const limit = Math.min(Number(req.query.limit ?? 20), 100)
  const skip  = (page - 1) * limit

  const query = { targetType, targetId, isDeleted: false }
  query.parent = parent === 'null' ? null : parent

  const [comments, total] = await Promise.all([
    Comment.find(query)
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate('author', 'username'),
    Comment.countDocuments(query),
  ])

  // Attach reply counts
  const ids   = comments.map(c => c._id)
  const counts = await Comment.aggregate([
    { $match: { parent: { $in: ids }, isDeleted: false } },
    { $group: { _id: '$parent', count: { $sum: 1 } } },
  ])
  const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]))
  const withCounts = comments.map(c => ({
    ...c.toObject(),
    replyCount: countMap[c._id.toString()] ?? 0,
  }))

  res.json({ success: true, comments: withCounts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
})

// POST /api/comments
const createComment = asyncHandler(async (req, res) => {
  const { targetType, targetId, body, parent } = req.body
  let depth = 0
  if (parent) {
    const parentDoc = await Comment.findById(parent)
    if (!parentDoc) { res.statusCode = 404; throw new Error('Parent comment not found') }
    depth = Math.min((parentDoc.depth ?? 0) + 1, 5)
  }
  const comment = await Comment.create({
    author: req.user._id, targetType, targetId, body,
    parent: parent || null, depth,
  })
  await comment.populate('author', 'username')
  res.status(201).json({ success: true, comment })
})

// DELETE /api/comments/:id — soft delete own comment
const deleteComment = asyncHandler(async (req, res) => {
  const filter = req.user.roles?.includes('admin')
    ? { _id: req.params.id }
    : { _id: req.params.id, author: req.user._id }
  const comment = await Comment.findOneAndUpdate(
    filter,
    { isDeleted: true, deletedAt: new Date(), body: '[deleted]' },
    { new: true }
  )
  if (!comment) { res.statusCode = 404; throw new Error('Comment not found') }
  res.json({ success: true, message: 'Comment deleted' })
})

// POST /api/comments/:id/vote  body: { vote: 'up'|'down'|'none' }
const voteComment = asyncHandler(async (req, res) => {
  const { vote } = req.body
  const userId = req.user._id
  const comment = await Comment.findById(req.params.id)
  if (!comment) { res.statusCode = 404; throw new Error('Comment not found') }

  const alreadyUp   = comment.upvotedBy?.some(id => id.equals(userId))
  const alreadyDown = comment.downvotedBy?.some(id => id.equals(userId))

  if (alreadyUp)   { comment.upvotedBy.pull(userId);   comment.upvotes   = Math.max(0, comment.upvotes   - 1) }
  if (alreadyDown) { comment.downvotedBy.pull(userId);  comment.downvotes = Math.max(0, comment.downvotes - 1) }

  if (vote === 'up'   && !alreadyUp)   { comment.upvotedBy.push(userId);   comment.upvotes   += 1 }
  if (vote === 'down' && !alreadyDown) { comment.downvotedBy.push(userId);  comment.downvotes += 1 }

  await comment.save()
  const userVote = comment.upvotedBy?.some(id => id.equals(userId)) ? 'up'
                 : comment.downvotedBy?.some(id => id.equals(userId)) ? 'down' : 'none'
  res.json({ success: true, upvotes: comment.upvotes, downvotes: comment.downvotes, userVote })
})

module.exports = { getComments, createComment, deleteComment, voteComment }
