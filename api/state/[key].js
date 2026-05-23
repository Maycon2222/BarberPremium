import { deleteState, getState, readBody, sendJson, setCors, setState } from '../_db.js'

export default async function handler(req, res) {
  setCors(req, res)
  if (req.method === 'OPTIONS') return sendJson(res, 204, {})

  try {
    const key = req.query?.key
    if (!key || Array.isArray(key)) return sendJson(res, 400, { error: 'Chave invalida' })

    if (req.method === 'GET') return sendJson(res, 200, { key, value: await getState(key) })
    if (req.method === 'PUT') {
      const body = await readBody(req)
      await setState(key, body.value)
      return sendJson(res, 200, { ok: true })
    }
    if (req.method === 'DELETE') {
      await deleteState(key)
      return sendJson(res, 200, { ok: true })
    }

    return sendJson(res, 405, { error: 'Metodo nao permitido' })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Erro interno' })
  }
}
