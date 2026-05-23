const SERPRO_TOKEN = import.meta.env.VITE_SERPRO_TOKEN || null
const SERPRO_BASE_URL = 'https://gateway.apiserpro.serpro.gov.br/datavalid/v2'
const RECEITAWS_BASE_URL = 'https://receitaws.com.br/v1/cnpj'

export async function verifyCPF(payload) {
  if (!SERPRO_TOKEN) {
    return { verified: false, reason: 'api_not_configured', message: 'Dados registrados sem verificacao externa.' }
  }

  try {
    const answer = {
      nome: payload.name,
      data_nascimento: payload.birthDate,
    }

    const response = await fetchWithTimeout(`${SERPRO_BASE_URL}/validate/pf`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SERPRO_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: { cpf: payload.cpf },
        answer,
      }),
    })
    const data = await response.json()
    const checks = data.answer || data
    if (checks.nome === true && checks.data_nascimento === true) {
      return { verified: true, reason: 'success' }
    }
    const field = checks.nome !== true ? 'nome' : 'data_nascimento'
    return { verified: false, reason: 'data_mismatch', field }
  } catch {
    return { verified: false, reason: 'api_error', message: 'Nao foi possivel verificar os dados agora.' }
  }
}

export async function verifyCNPJ(cnpj) {
  try {
    const response = await fetchWithTimeout(`${RECEITAWS_BASE_URL}/${cnpj}`)
    if (response.status === 429) return { verified: false, reason: 'rate_limit', message: 'Limite da ReceitaWS atingido.' }
    if (response.status === 404) return { verified: false, reason: 'not_found', message: 'CNPJ nao encontrado na Receita Federal.' }

    const data = await response.json()
    if (data.status !== 'OK') return { verified: false, reason: 'not_found', message: data.message || 'CNPJ nao encontrado na Receita Federal.' }
    if (data.situacao !== 'ATIVA') {
      return { verified: false, reason: 'inactive', situacao: data.situacao, razaoSocial: data.nome, message: `Este CNPJ esta com situacao '${data.situacao}' na Receita Federal.` }
    }
    return { verified: true, reason: 'success', situacao: data.situacao, razaoSocial: data.nome }
  } catch {
    return { verified: false, reason: 'api_error', message: 'Nao foi possivel verificar seus dados agora.' }
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}
