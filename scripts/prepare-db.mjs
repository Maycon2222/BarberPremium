import { ensureSchema, getPool } from '../api/_db.js'

if (!process.env.DATABASE_URL) {
  console.info('DATABASE_URL nao configurada. Pulando preparo do banco.')
  process.exit(0)
}

try {
  await ensureSchema()
  await getPool().end()
  console.info('Schema do banco preparado com sucesso.')
} catch (error) {
  console.error('Falha ao preparar schema do banco:', error.message)
  process.exit(1)
}
