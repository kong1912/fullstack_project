// Concurrency test: send many concurrent order requests to the API
// Usage:
//   cd backend
//   npm install axios
//   node scripts/concurrency-test.js
// Environment variables (optional):
//   TARGET (default http://localhost:5000)
//   PRODUCT_ID (required)
//   QTY (default 1)
//   CONCURRENCY (default 20)
//   REQUESTS (default 50)
//   AUTH_TOKEN (optional) - a Bearer token or cookie string if needed

const axios = require('axios')

const TARGET = process.env.TARGET || 'http://localhost:5000'
const PRODUCT_ID = process.env.PRODUCT_ID || ''
const QTY = Number(process.env.QTY || 1)
const CONCURRENCY = Number(process.env.CONCURRENCY || 20)
const REQUESTS = Number(process.env.REQUESTS || 50)
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''

if (!PRODUCT_ID) {
  console.error('Set PRODUCT_ID environment variable to the product _id to test against.')
  process.exit(1)
}

const url = `${TARGET.replace(/\/$/, '')}/api/orders`

let success = 0
let failed = 0

async function makeRequest(i) {
  try {
    const headers = {}
    if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`

    const body = { productId: PRODUCT_ID, quantity: QTY }
    const res = await axios.post(url, body, { headers, timeout: 10000 })
    console.log(i, '->', res.status)
    if (res.status >= 200 && res.status < 300) success++
    else failed++
  } catch (err) {
    failed++
    if (err.response) {
      console.log(i, 'ERR', err.response.status, err.response.data)
    } else {
      console.log(i, 'ERR', err.message)
    }
  }
}

async function run() {
  console.log('Target:', url)
  console.log('Product:', PRODUCT_ID, 'Qty:', QTY, 'Concurrency:', CONCURRENCY, 'Requests:', REQUESTS)

  const batches = Math.ceil(REQUESTS / CONCURRENCY)
  for (let b = 0; b < batches; b++) {
    const tasks = []
    for (let i = 0; i < CONCURRENCY && b * CONCURRENCY + i < REQUESTS; i++) {
      tasks.push(makeRequest(b * CONCURRENCY + i + 1))
    }
    await Promise.all(tasks)
  }

  console.log('Done. success=', success, 'failed=', failed)
}

run().catch((e) => console.error(e))
