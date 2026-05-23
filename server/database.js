import pg from 'pg'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL nao configurada. A API inicia, mas endpoints de banco vao falhar.')
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
})

export async function ensureSchema() {
  await pool.query(`
    create table if not exists app_state (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `)
}

export async function getAllState() {
  const { rows } = await pool.query('select key, value from app_state order by key')
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}

export async function getState(key) {
  const { rows } = await pool.query('select value from app_state where key = $1', [key])
  return rows[0]?.value ?? null
}

export async function setState(key, value) {
  await pool.query(
    `insert into app_state (key, value, updated_at)
     values ($1, $2::jsonb, now())
     on conflict (key) do update set value = excluded.value, updated_at = now()`,
    [key, JSON.stringify(value)],
  )
}

export async function deleteState(key) {
  await pool.query('delete from app_state where key = $1', [key])
}
