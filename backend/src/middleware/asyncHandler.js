// Fn 3.1 — Async handler wrapper (eliminates try/catch boilerplate)
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

module.exports = asyncHandler
