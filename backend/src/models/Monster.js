// Fn 4.1 — Cached Monster data from mhw-db.com (for aggregation/search)
// Fn 4.4 — Array operators + Pagination
const mongoose = require('mongoose')

const weaknessSchema = new mongoose.Schema({
  element: String, stars: Number, condition: String,
}, { _id: false })

const monsterSchema = new mongoose.Schema(
  {
    mhwId:    { type: Number, unique: true, required: true },
    name:     { type: String, required: true, index: true },
    type:     { type: String, index: true },
    species:  String,
    // Fn 4.4 — Array field queried with $all operator
    elements:   [{ type: { type: String }, stars: Number }],
    weaknesses: [weaknessSchema],
    ailments:   [{ mhwId: Number, name: String }],
    locations:  [{ mhwId: Number, name: String }],
    description: String,
    // Caching metadata
    lastSynced: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

monsterSchema.index({ name: 'text' })

module.exports = mongoose.model('Monster', monsterSchema)
