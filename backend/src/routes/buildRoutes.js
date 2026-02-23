// Fn 4.1 / 4.2 / 4.3 / 4.4 Build routes
const router     = require('express').Router()
const protect    = require('../middleware/auth')
const authorize  = require('../middleware/authorize')
const {
  getBuilds, getBuild, createBuild, updateBuild,
  hardDeleteBuild, softDeleteBuild, likeBuild,
} = require('../controllers/buildController')

// All routes require auth (Fn 5.3)
router.use(protect)

router.route('/')
  .get(getBuilds)       // Fn 4.4 — Pagination + $all query
  .post(createBuild)    // Fn 4.1

router.route('/:id')
  .get(getBuild)        // Fn 4.1
  .put(updateBuild)     // Fn 4.1
  .delete(softDeleteBuild) // Fn 4.2 — Soft delete

router.delete('/:id/hard', authorize('admin'), hardDeleteBuild) // Fn 4.2 — Hard delete (admin)
router.post('/:id/like', likeBuild)  // Fn 4.3 — Atomic update

module.exports = router
