import http from 'node:http'
import { deleteState, ensureSchema, getAllState, getState, pool, setState } from './database.js'

const PORT = Number(process.env.PORT || 8787)
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://127.0.0.1:5173'

await ensureSchema().catch((error) => {
  console.error('Falha ao preparar schema do banco:', error.message)
})

const server = http.createServer(async (req, res) => {
  setCors(res)
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`)
    if (req.method === 'GET' && url.pathname === '/api/health') {
      await pool.query('select 1')
      return json(res, 200, { ok: true })
    }

    if (req.method === 'GET' && url.pathname === '/api/state') {
      return json(res, 200, await getAllState())
    }

    const stateMatch = url.pathname.match(/^\/api\/state\/([^/]+)$/)
    if (stateMatch) {
      const key = decodeURIComponent(stateMatch[1])
      if (req.method === 'GET') return json(res, 200, { key, value: await getState(key) })
      if (req.method === 'PUT') {
        const body = await readJson(req)
        await setState(key, body.value)
        return json(res, 200, { ok: true })
      }
      if (req.method === 'DELETE') {
        await deleteState(key)
        return json(res, 200, { ok: true })
      }
    }

    json(res, 404, { error: 'Rota nao encontrada' })
  } catch (error) {
    json(res, 500, { error: error.message || 'Erro interno' })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`API Barber Prime em http://127.0.0.1:${PORT}`)
})

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(payload))
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 15 * 1024 * 1024) {
        reject(new Error('Payload muito grande'))
        req.destroy()
      }
    })
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('JSON invalido'))
      }
    })
    req.on('error', reject)
  })
}
