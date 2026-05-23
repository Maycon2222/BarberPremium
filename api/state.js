import { getAllState, sendJson, setCors } from './_db.js'

export default async function handler(req, res) {
  setCors(req, res)
  if (req.method === 'OPTIONS') return sendJson(res, 204, {})

  try {
    if (req.method === 'GET') return sendJson(res, 200, await getAllState())
    return sendJson(res, 405, { error: 'Metodo nao permitido' })
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Erro interno' })
  }
}
