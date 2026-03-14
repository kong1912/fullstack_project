const router  = require('express').Router()
const protect = require('../middleware/auth')
const {
  getGuides, getGuide, createGuide, updateGuide, deleteGuide, voteGuide,
} = require('../controllers/guideController')

// Public read
router.get('/',    getGuides)
router.get('/:id', getGuide)

// Auth required for write
router.use(protect)
router.post('/',          createGuide)
router.put('/:id',        updateGuide)
router.delete('/:id',     deleteGuide)
router.post('/:id/vote',  voteGuide)

module.exports = router
