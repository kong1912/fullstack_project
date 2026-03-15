const router  = require('express').Router()
const protect = require('../middleware/auth')
const upload  = require('../middleware/upload')
const {
  getGuides, getGuide, createGuide, updateGuide, deleteGuide, voteGuide, uploadGuideImages,
} = require('../controllers/guideController')

// Public read
router.get('/',    getGuides)
// Dedicated search endpoint matching Function 4.4 checklist
router.get('/search', require('../controllers/guideController').searchGuides)
router.get('/:id', getGuide)

// Auth required for write
router.use(protect)
router.post('/',          createGuide)
router.put('/:id',        updateGuide)
router.delete('/:id',     deleteGuide)
router.post('/:id/vote',  voteGuide)
router.post('/:id/images', upload.array('images', 5), uploadGuideImages)

module.exports = router
