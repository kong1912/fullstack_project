const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

const vaultDir = path.join(__dirname, '../../vault')

exports.stream = (req, res) => {
  const filename = req.params.filename
  if (!filename) return res.status(400).json({ error: 'Bad Request', message: 'Missing filename' })

  // Prevent path traversal
  const requested = path.normalize(path.join(vaultDir, filename))
  if (!requested.startsWith(vaultDir)) {
    return res.status(400).json({ error: 'Bad Request', message: 'Invalid filename' })
  }

  fs.stat(requested, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.status(404).json({ error: 'Not Found' })
    }

    const contentType = mime.lookup(requested) || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', stats.size)

    // Stream file in chunks to avoid loading into RAM
    const stream = fs.createReadStream(requested, { highWaterMark: 64 * 1024 })

    stream.on('error', (streamErr) => {
      console.error('Vault stream error', streamErr)
      if (!res.headersSent) return res.status(500).json({ error: 'Stream Error' })
      res.destroy()
    })

    stream.pipe(res)
  })
}
