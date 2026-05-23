export const SYNC_KEYS = [
  'barber-users',
  'barber-barbers',
  'barber-shops',
  'barber-appointments',
  'barber-settings',
  'barber-services',
  'barber-service-categories',
  'barber-service-options',
  'barber-products',
  'barber-product-categories',
  'barber-product-reservations',
  'barber-product-fulfillment-methods',
  'barber-pricing-version',
  'barber-seeded',
]

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787'

let installed = false
let syncingFromRemote = false

export async function syncLocalStorageFromApi() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/api/state`)
    if (!response.ok) throw new Error('API indisponivel')
    const state = await response.json()
    syncingFromRemote = true
    Object.entries(state).forEach(([key, value]) => {
      if (SYNC_KEYS.includes(key)) localStorage.setItem(key, JSON.stringify(value))
    })
  } catch {
    console.info('Banco remoto indisponivel. Usando armazenamento local.')
  } finally {
    syncingFromRemote = false
  }
}

export async function pushLocalStorageToApi() {
  await Promise.all(SYNC_KEYS.map(async (key) => {
    const raw = localStorage.getItem(key)
    if (raw == null) return
    try {
      await saveRemoteState(key, JSON.parse(raw))
    } catch {
      // Mantem o app local-first se a API estiver offline.
    }
  }))
}

export function installRemoteStorageSync() {
  if (installed) return
  installed = true
  const originalSetItem = localStorage.setItem.bind(localStorage)
  const originalRemoveItem = localStorage.removeItem.bind(localStorage)

  localStorage.setItem = (key, value) => {
    originalSetItem(key, value)
    if (SYNC_KEYS.includes(key) && !syncingFromRemote) {
      try {
        saveRemoteState(key, JSON.parse(value))
      } catch {
        saveRemoteState(key, value)
      }
    }
  }

  localStorage.removeItem = (key) => {
    originalRemoveItem(key)
    if (SYNC_KEYS.includes(key) && !syncingFromRemote) {
      fetch(`${API_URL}/api/state/${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => {})
    }
  }
}

async function saveRemoteState(key, value) {
  await fetch(`${API_URL}/api/state/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  })
}

async function fetchWithTimeout(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1500)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}
