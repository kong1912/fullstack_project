const multer = require('multer')

// Store files in memory so we can encode as base64 and save to MongoDB
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowed.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Only image files are allowed (jpg, png, gif, webp)'), false)
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB max per file (base64 bloat ~1.33x)
})

module.exports = upload
