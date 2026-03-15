// Middleware: allow only non-browser API clients (Postman/curl/etc.)
module.exports = function userAgentGuard(req, res, next) {
  const ua = req.headers['user-agent']
  if (!ua) {
    return res.status(403).json({ error: 'Forbidden', message: 'Missing User-Agent' })
  }

  // Whitelist common API/testing clients
  const allowedClient = /PostmanRuntime|curl|HTTPie|python-requests|Wget|okhttp/i
  if (allowedClient.test(ua)) {
    return next()
  }

  // Block typical browser user agents explicitly
  const browser = /Mozilla|Chrome|Firefox|Safari|Edg/i
  if (browser.test(ua)) {
    return res.status(403).json({ error: 'Forbidden', message: 'User-Agent not allowed' })
  }

  // Default: block unknown agents to be strict
  return res.status(403).json({ error: 'Forbidden', message: 'User-Agent not allowed' })
}
