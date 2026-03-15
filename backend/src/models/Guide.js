// Guide post model — blog-style posts with upvotes
const mongoose = require('mongoose')

const guideSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', required: true, index: true,
    },
    title: {
      type: String, required: [true, 'Title is required'],
      trim: true, minlength: 5, maxlength: 150,
    },
    body: {
      type: String, required: [true, 'Body is required'],
      trim: true, minlength: 10,
    },
    tags: { type: [String], default: [] },
    images: { type: [String], default: [] },  // stored filenames served from /uploads/
    upvotes:   { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    // track who voted so one user = one vote
    upvotedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
  },
  {
    timestamps: true,
    toJSON:  { virtuals: true },
    toObject: { virtuals: true },
  }
)

guideSchema.virtual('score').get(function () {
  return this.upvotes - this.downvotes
})

guideSchema.pre(/^find/, function () {
  if (this.getOptions()?.includeDeleted) return
  this.where({ isDeleted: false })
})

module.exports = mongoose.model('Guide', guideSchema)
