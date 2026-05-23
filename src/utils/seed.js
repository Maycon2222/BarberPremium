import { addDays, format } from 'date-fns'
import { PRICING_SEED_VERSION, PRODUCT_CATEGORIES, PRODUCT_FULFILLMENT_METHODS, PRODUCTS, SERVICE_CATEGORIES, SERVICE_OPTIONS, SERVICES, normalizeBarberPricing } from './pricing.js'

const barberSpecialtyPresets = {
  'barber-joao': [
    'laterais-degrade-baixo',
    'laterais-degrade-medio',
    'laterais-degrade-alto',
    'laterais-maquina-0',
    'laterais-maquina-05',
    'laterais-maquina-1',
    'laterais-social',
    'parte-cima-maquina-cima',
    'parte-cima-baixar-volume',
    'parte-cima-corte-liso',
    'acabamento-pezinho',
    'acabamento-acabamento-navalha',
    'barba-barba-completa',
    'barba-alinhar-barba',
    'barba-barba-navalha',
    'cabelo-barba-corte-barba-simples',
    'cabelo-barba-corte-barba-completa',
  ],
  'barber-carlos': [
    'laterais-social',
    'laterais-disfarcado',
    'laterais-freestyle-lateral',
    'parte-cima-tesoura',
    'parte-cima-texturizacao',
    'parte-cima-repicado',
    'parte-cima-manter-comprimento',
    'parte-cima-corte-cacheado',
    'acabamento-desenho-simples',
    'acabamento-desenho-detalhado',
    'quimica-coloracao-luzes',
    'quimica-coloracao-reflexo',
    'quimica-coloracao-descoloracao',
    'quimica-coloracao-platinado',
    'quimica-coloracao-pigmentacao',
    'finalizacao-penteado-freestyle',
  ],
  'barber-rafael': [
    'laterais-degrade-baixo',
    'laterais-degrade-medio',
    'laterais-aparar-lateral',
    'parte-cima-tesoura',
    'parte-cima-corte-cacheado',
    'parte-cima-corte-ondulado',
    'parte-cima-penteado-cima',
    'barba-degrade-barba',
    'barba-hidratacao-barba',
    'barba-relaxamento-barba',
    'cabelo-barba-corte-hidratacao',
    'tratamentos-hidratacao-capilar',
    'tratamentos-nutricao-capilar',
    'tratamentos-reconstrucao-capilar',
    'quimica-coloracao-relaxamento',
    'finalizacao-finalizacao-cacheada',
  ],
}

export const barbersSeed = [
  { id: 'barber-joao', name: 'Joao Martins', email: 'joao@barberprime.local', phone: '(11) 98888-1111', active: true, specialties: ['corte-simples', 'corte-barba', 'barba'], specialtyOptionIds: barberSpecialtyPresets['barber-joao'], pricingModel: 'fixed' },
  { id: 'barber-carlos', name: 'Carlos Vega', email: 'carlos@barberprime.local', phone: '(11) 97777-2222', active: true, specialties: ['corte-tesoura', 'pigmentacao', 'luzes'], specialtyOptionIds: barberSpecialtyPresets['barber-carlos'], pricingModel: 'duration_tier' },
  { id: 'barber-rafael', name: 'Rafael Costa', email: 'rafael@barberprime.local', phone: '(11) 96666-3333', active: true, specialties: ['relaxamento', 'hidratacao', 'corte-barba'], specialtyOptionIds: barberSpecialtyPresets['barber-rafael'], pricingModel: 'per_minute', minuteRate: 1.5 },
  { id: 'test-barber', name: 'Barbeiro Teste', email: 'barbeiro.teste@barberprime.local', phone: '(11) 97777-9000', active: true, specialties: [], specialtyOptionIds: barberSpecialtyPresets['barber-joao'], pricingModel: 'fixed' },
]

const today = new Date()
const date = (offset) => format(addDays(today, offset), 'yyyy-MM-dd')

export const usersSeed = [
  { id: 'test-admin', name: 'Admin Teste', email: 'admin.teste@barberprime.local', password: 'admin123', role: 'admin', phone: '(11) 95555-9000', cnpj: '12345678000195', razaoSocial: 'Barber Prime Teste LTDA', verified: false, verifiedAt: null },
  { id: 'test-barber', name: 'Barbeiro Teste', email: 'barbeiro.teste@barberprime.local', password: 'barbeiro123', role: 'barber', phone: '(11) 97777-9000', cnpj: '98765432000198', razaoSocial: 'Barbeiro Teste Servicos LTDA', verified: false, verifiedAt: null },
  { id: 'test-client', name: 'Cliente Teste', email: 'cliente.teste@barberprime.local', password: 'cliente123', role: 'client', phone: '(11) 99999-9000', cpf: '12345678909', fullName: 'Cliente Teste Silva', birthDate: '1995-05-20', verified: false, verifiedAt: null },
]

export const appointmentsSeed = [
  ['1', 'Cliente Demo', 'client-1', 'barber-joao', 'corte-barba', 1, '09:00', 'confirmed', 'pix'],
  ['2', 'Marcos Lima', 'client-2', 'barber-carlos', 'pigmentacao', 1, '10:30', 'pending', 'cartao'],
  ['3', 'Diego Alves', 'client-3', 'barber-rafael', 'hidratacao', 1, '14:00', 'confirmed', 'dinheiro'],
  ['4', 'Pedro Rocha', 'client-4', 'barber-joao', 'barba', 2, '08:30', 'confirmed', 'pix'],
  ['5', 'Felipe Nunes', 'client-5', 'barber-carlos', 'luzes', 2, '11:00', 'cancelled', 'cartao'],
  ['6', 'Bruno Dias', 'client-6', 'barber-rafael', 'relaxamento', 3, '13:30', 'completed', 'pix'],
  ['7', 'Andre Torres', 'client-7', 'barber-joao', 'corte-simples', -1, '15:00', 'completed', 'dinheiro'],
  ['8', 'Lucas Moura', 'client-8', 'barber-carlos', 'corte-tesoura', -2, '16:30', 'completed', 'pix'],
  ['9', 'Mateus Prado', 'client-9', 'barber-rafael', 'corte-barba', 4, '18:00', 'pending', 'cartao'],
  ['10', 'Renan Silva', 'client-10', 'barber-joao', 'corte-simples', 5, '12:00', 'confirmed', 'pix'],
].map(([id, clientName, clientId, barberId, serviceId, offset, time, status, paymentMethod]) => {
  const service = SERVICES.find((item) => item.id === serviceId)
  return {
    id,
    clientName,
    clientId,
    clientPhone: '(11) 99999-1234',
    clientEmail: `${clientName.toLowerCase().replaceAll(' ', '.')}@email.com`,
    barberId,
    serviceId,
    selectedOptionIds: service.optionIds || [],
    dynamicPricingVersion: PRICING_SEED_VERSION,
    date: date(offset),
    time,
    status,
    paymentMethod,
    price: service.price,
    receiptCode: `BP-SEED-${id.padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
  }
})

export function seedLocalStorage() {
  ensurePricingSeed()
  removeDemoCredentials()
  ensureTestAccounts()
  if (localStorage.getItem('barber-seeded') !== 'yes') {
    localStorage.setItem('barber-users', JSON.stringify(usersSeed))
    localStorage.setItem('barber-barbers', JSON.stringify(barbersSeed))
    localStorage.setItem('barber-services', JSON.stringify(SERVICES))
    localStorage.setItem('barber-appointments', JSON.stringify(appointmentsSeed))
    localStorage.setItem('barber-settings', JSON.stringify({ shopName: 'Barber Prime', start: '08:00', end: '19:00', interval: 30 }))
    localStorage.setItem('barber-seeded', 'yes')
  }
}

function ensureTestAccounts() {
  const users = mergeById(readJson('barber-users', []), usersSeed)
  const barbers = mergeById(readJson('barber-barbers', []), barbersSeed).map((barber) => ({
    ...normalizeBarberPricing(barber),
    specialtyOptionIds: normalizeBarberSpecialties(barber),
  }))
  localStorage.setItem('barber-users', JSON.stringify(users))
  localStorage.setItem('barber-barbers', JSON.stringify(barbers))
}

function removeDemoCredentials() {
  const demoUserIds = ['admin-1', 'barber-joao', 'client-1']
  const users = readJson('barber-users', [])
  const session = readJson('barber-session', null)
  const filteredUsers = users.filter((user) => !demoUserIds.includes(user.id))
  if (filteredUsers.length !== users.length) {
    localStorage.setItem('barber-users', JSON.stringify(filteredUsers))
  }
  if (session?.id && demoUserIds.includes(session.id)) {
    localStorage.removeItem('barber-session')
  }
}

export function ensurePricingSeed() {
  const hasCurrentPricing = localStorage.getItem('barber-pricing-version') === PRICING_SEED_VERSION
  const serviceCategories = mergeById(readJson('barber-service-categories', []), SERVICE_CATEGORIES)
  const serviceOptions = mergeById(readJson('barber-service-options', []), SERVICE_OPTIONS, (current, seeded) => ({
    ...seeded,
    ...current,
    compatibility: hasCurrentPricing ? current.compatibility || seeded.compatibility : seeded.compatibility,
  }))
  const productCategories = mergeById(readJson('barber-product-categories', []), PRODUCT_CATEGORIES)
  const products = mergeById(readJson('barber-products', []), PRODUCTS)
  const legacyServices = mergeById(readJson('barber-services', []), SERVICES)

  localStorage.setItem('barber-service-categories', JSON.stringify(serviceCategories))
  localStorage.setItem('barber-service-options', JSON.stringify(serviceOptions))
  localStorage.setItem('barber-product-categories', JSON.stringify(productCategories))
  localStorage.setItem('barber-products', JSON.stringify(products))
  localStorage.setItem('barber-services', JSON.stringify(legacyServices))

  if (!localStorage.getItem('barber-product-reservations')) {
    localStorage.setItem('barber-product-reservations', JSON.stringify([]))
  }
  localStorage.setItem('barber-product-fulfillment-methods', JSON.stringify(mergeById(readJson('barber-product-fulfillment-methods', []), PRODUCT_FULFILLMENT_METHODS)))

  const barbers = readJson('barber-barbers', [])
  if (barbers.length) {
    const migratedBarbers = barbers.map((barber) => ({
      ...normalizeBarberPricing(barber),
      specialtyOptionIds: normalizeBarberSpecialties(barber),
    }))
    localStorage.setItem('barber-barbers', JSON.stringify(migratedBarbers))
  }
  const appointments = readJson('barber-appointments', [])
  if (appointments.length) {
    const migrated = appointments.map((appointment) => {
      if (appointment.selectedOptionIds?.length) return appointment
      const service = SERVICES.find((item) => item.id === appointment.serviceId)
      return {
        ...appointment,
        selectedOptionIds: service?.optionIds || [],
        dynamicPricingVersion: PRICING_SEED_VERSION,
      }
    })
    localStorage.setItem('barber-appointments', JSON.stringify(migrated))
  }
  if (!hasCurrentPricing) {
    localStorage.setItem('barber-pricing-version', PRICING_SEED_VERSION)
  }
}

export function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

function mergeById(current = [], seeded = [], mergeItem = (currentItem, seededItem) => ({ ...seededItem, ...currentItem })) {
  const merged = current.map((item) => {
    const seededItem = seeded.find((candidate) => candidate.id === item.id)
    return seededItem ? mergeItem(item, seededItem) : item
  })
  const missing = seeded.filter((seededItem) => !merged.some((item) => item.id === seededItem.id))
  return [...merged, ...missing].sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
}

function normalizeBarberSpecialties(barber) {
  if (barber.specialtyOptionIds?.length >= 6) return barber.specialtyOptionIds
  const preset = barberSpecialtyPresets[barber.id] || []
  const legacy = SERVICES.flatMap((service) => barber.specialties?.includes(service.id) ? service.optionIds || [] : [])
  return [...new Set([...preset, ...legacy])]
}
