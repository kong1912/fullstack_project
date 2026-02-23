// Fn 5.4 — RBAC Middleware using Factory Function pattern (maximum flexibility)
// Usage: authorize('admin', 'moderator')  — pass any number of allowed roles
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    res.statusCode = 401
    return next(new Error('Not authenticated'))
  }

  const userRoles = req.user.roles ?? ['user']
  const hasRole   = allowedRoles.some((role) => userRoles.includes(role))

  if (!hasRole) {
    res.statusCode = 403
    return next(
      new Error(
        `Role(s) [${userRoles.join(', ')}] not authorized. Required: [${allowedRoles.join(', ')}]`
      )
    )
  }

  next()
}

module.exports = authorize
