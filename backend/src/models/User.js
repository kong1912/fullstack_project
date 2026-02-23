// Fn 5.1 — User model: auto-hash password pre-save, prevent password leakage via API
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String, required: [true, 'Username is required'],
      unique: true, trim: true, minlength: 3, maxlength: 30,
    },
    email: {
      type: String, required: [true, 'Email is required'],
      unique: true, lowercase: true, trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String, required: [true, 'Password is required'],
      minlength: 8,
      select: false, // Fn 5.1 — prevent password leaking through API
    },
    roles: {
      type: [String], enum: ['user', 'admin', 'moderator'],
      default: ['user'],
    },
    isActive: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
)

// Fn 5.1 — Auto-hash password before saving (pre-save hook)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

// Fn 5.2 — Safe password comparison method
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Fn 4.5 — Virtual: full display name
userSchema.virtual('displayName').get(function () {
  return `${this.username} (${this.roles.join('/')})`
})

module.exports = mongoose.model('User', userSchema)
