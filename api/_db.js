import pg from 'pg'

const { Pool } = pg

let pool

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
    })
  }
  return pool
}

export async function ensureSchema() {
  await getPool().query(`
    create table if not exists app_state (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `)
}

export async function getAllState() {
  await ensureSchema()
  const { rows } = await getPool().query('select key, value from app_state order by key')
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}

export async function getState(key) {
  await ensureSchema()
  const { rows } = await getPool().query('select value from app_state where key = $1', [key])
  return rows[0]?.value ?? null
}

export async function setState(key, value) {
  await ensureSchema()
  await getPool().query(
    `insert into app_state (key, value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  )
}

export async function deleteState(key) {
  await ensureSchema()
  await getPool().query('delete from app_state where key = $1', [key])
}

export function setCors(req, res) {
  const configuredOrigin = process.env.CORS_ORIGIN
  res.setHeader('Access-Control-Allow-Origin', configuredOrigin || req.headers.origin || '*')
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

export function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}')

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
