// Fn 3.4 — I/O & Memory Efficiency helpers
const os = require('os')

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return '0 B'
  const k     = 1024
  const sizes = ['B','KB','MB','GB','TB']
  const i     = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

const getMemoryUsage = () => {
  const used = process.memoryUsage()
  return {
    rss:         formatBytes(used.rss),
    heapTotal:   formatBytes(used.heapTotal),
    heapUsed:    formatBytes(used.heapUsed),
    external:    formatBytes(used.external),
    freeSystem:  formatBytes(os.freemem()),
    totalSystem: formatBytes(os.totalmem()),
  }
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

// Fn 3.5 — Data transformer: normalise MHW API response to internal format
const normalizeMhwMonster = (raw) => ({
  mhwId:       raw.id,
  name:        raw.name,
  type:        raw.type,
  species:     raw.species,
  description: raw.description ?? '',
  elements:    raw.elements ?? [],
  weaknesses:  (raw.weaknesses ?? []).map((w) => ({
    element:   w.element,
    stars:     w.stars,
    condition: w.condition ?? '',
  })),
  ailments:   (raw.ailments ?? []).map((a) => ({ mhwId: a.id, name: a.name })),
  locations:  (raw.locations ?? []).map((l) => ({ mhwId: l.id, name: l.name })),
  lastSynced: new Date(),
})

module.exports = { formatBytes, getMemoryUsage, sleep, normalizeMhwMonster }
