// Fn 1.4 — Nested Comment schema (recursive self-reference, arbitrary depth)
// Fn 4.3 — Two-collection relationship (User + Comment)
const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true,
    },
    // Target can be a build, monster ID, or weapon ID
    targetType: {
      type: String, enum: ['build', 'monster', 'weapon'], required: true,
    },
    targetId: { type: String, required: true, index: true },

    body: {
      type: String, required: [true, 'Comment body is required'],
      maxlength: 2000, trim: true,
    },

    // Fn 1.4 — Self-reference for nested/threaded comments (recursive)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Comment',
      default: null,
    },
    depth: { type: Number, default: 0, max: 5 }, // max 5 levels deep

    // Fn 4.2 — Soft delete
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,

    upvotes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
)

commentSchema.index({ targetId: 1, targetType: 1 })
commentSchema.index({ parent: 1 })

// Fn 4.5 — Virtual: replies count (populated separately)
commentSchema.virtual('replies', {
  ref:         'Comment',
  localField:  '_id',
  foreignField: 'parent',
})

module.exports = mongoose.model('Comment', commentSchema)
