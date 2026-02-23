// Fn 4.1 — Mongoose Schema + Validation
// Fn 4.2 — Soft Delete (isDeleted flag)
// Fn 4.3 — Relationship with User (ref)
// Fn 4.5 — Virtuals
const mongoose = require('mongoose')

const armorPieceSchema = new mongoose.Schema({
  mhwId:   Number,
  name:    String,
  defense: { base: Number, max: Number, augmented: Number },
  resistances: {
    fire: Number, water: Number, thunder: Number,
    ice: Number, dragon: Number,
  },
  skills: [{ skillName: String, level: Number }],
}, { _id: false })

const buildSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
      index: true,
    },
    name: {
      type: String, required: [true, 'Build name is required'],
      trim: true, minlength: 3, maxlength: 80,
    },
    style: {
      type: String,
      enum: ['aggressive', 'defensive', 'balanced', 'support'],
      default: 'balanced',
    },
    weapon: {
      mhwId: Number, name: String, type: String,
      attack: Number, rarity: Number,
    },
    helm:   armorPieceSchema,
    chest:  armorPieceSchema,
    gloves: armorPieceSchema,
    waist:  armorPieceSchema,
    legs:   armorPieceSchema,
    notes: { type: String, maxlength: 500 },

    // Fn 4.2 — Soft Delete fields
    isDeleted:  { type: Boolean, default: false, index: true },
    deletedAt:  Date,
    deletedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    isPublic:   { type: Boolean, default: false },
    likes:      { type: Number, default: 0 },
    // Fn 4.4 — Array field for tags
    tags:       { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
)

// Fn 4.5 — Virtual: total armor defense
buildSchema.virtual('totalDefense').get(function () {
  const pieces = [this.helm, this.chest, this.gloves, this.waist, this.legs]
  return pieces.reduce((sum, p) => sum + (p?.defense?.base ?? 0), 0)
})

// Fn 4.2 — Soft delete query interceptor (exclude deleted by default)
buildSchema.pre(/^find/, function (next) {
  if (this.getOptions()?.includeDeleted) return next()
  this.where({ isDeleted: false })
  next()
})

// Fn 4.2 — Instance method: Soft delete
buildSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true
  this.deletedAt = new Date()
  this.deletedBy = userId
  return this.save()
}

module.exports = mongoose.model('Build', buildSchema)
