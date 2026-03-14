const router  = require('express').Router()
const protect = require('../middleware/auth')
const {
  getComments, createComment, deleteComment, voteComment,
} = require('../controllers/commentController')

// Public read
router.get('/', getComments)

// Auth required
router.use(protect)
router.post('/',              createComment)
router.delete('/:id',         deleteComment)
router.post('/:id/vote',      voteComment)

module.exports = router
