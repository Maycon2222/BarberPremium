export const PRICING_SEED_VERSION = 'dynamic-pricing-v2'

export const PRICING_MODELS = [
  { id: 'fixed', name: 'Preco fixo' },
  { id: 'per_minute', name: 'Tarifa por minuto' },
  { id: 'duration_tier', name: 'Faixas de duracao' },
  { id: 'slot_only', name: 'Preco fixo + slots' },
]

export const DEFAULT_DURATION_TIERS = [
  { upTo: 30, surcharge: 0 },
  { upTo: 60, surcharge: 15 },
  { upTo: 999, surcharge: 30 },
]

export const SERVICE_CATEGORIES = [
  { id: 'laterais', name: 'Laterais', description: 'Estilo e altura das laterais.', required: true, active: true, order: 10 },
  { id: 'parte-cima', name: 'Parte de cima', description: 'Tecnica aplicada no topo do cabelo.', required: true, active: true, order: 20 },
  { id: 'acabamento', name: 'Acabamento', description: 'Detalhes finais do corte.', required: false, active: true, order: 30 },
  { id: 'barba', name: 'Barba', description: 'Servicos de barba e bigode.', required: false, active: true, order: 40 },
  { id: 'cabelo-barba', name: 'Cabelo + barba', description: 'Combos e pacotes prontos.', required: false, active: true, order: 50 },
  { id: 'quimica-coloracao', name: 'Quimica e coloracao', description: 'Coloracao, pigmentacao e transformacoes.', required: false, active: true, order: 60 },
  { id: 'tratamentos', name: 'Tratamentos', description: 'Tratamentos capilares e couro cabeludo.', required: false, active: true, order: 70 },
  { id: 'finalizacao', name: 'Finalizacao', description: 'Produtos e finalizacoes.', required: false, active: true, order: 80 },
  { id: 'infantil', name: 'Servicos infantis', description: 'Cortes e pacotes para criancas.', required: false, active: true, order: 90 },
  { id: 'extras', name: 'Servicos extras', description: 'Taxas, atendimento especial e conveniencias.', required: false, active: true, order: 100 },
]

const optionGroups = {
  laterais: [
    ['degrade-baixo', 'Degrade baixo', 5, 20],
    ['degrade-medio', 'Degrade medio', 5, 25],
    ['degrade-alto', 'Degrade alto', 5, 25],
    ['degrade-navalhado', 'Degrade navalhado', 8, 35],
    ['maquina-0', 'Maquina 0', 4, 15],
    ['maquina-05', 'Maquina 0.5', 4, 15],
    ['maquina-1', 'Maquina 1', 4, 15],
    ['maquina-15', 'Maquina 1.5', 4, 15],
    ['maquina-2', 'Maquina 2', 4, 15],
    ['maquina-3', 'Maquina 3', 4, 15],
    ['aparar-lateral', 'So aparar lateral', 3, 10],
    ['disfarcado', 'Disfarcado', 6, 25],
    ['social', 'Social', 5, 25],
    ['freestyle-lateral', 'Freestyle lateral', 10, 40],
  ],
  'parte-cima': [
    ['tesoura', 'Tesoura', 5, 20],
    ['maquina-cima', 'Maquina', 4, 15],
    ['aparar-cima', 'So aparar', 3, 10],
    ['texturizacao', 'Texturizacao', 5, 20],
    ['repicado', 'Repicado', 5, 20],
    ['baixar-volume', 'Baixar volume', 4, 15],
    ['manter-comprimento', 'Manter comprimento', 3, 10],
    ['corte-cacheado', 'Corte cacheado', 8, 30],
    ['corte-ondulado', 'Corte ondulado', 7, 25],
    ['corte-liso', 'Corte liso', 6, 25],
    ['penteado-cima', 'Finalizacao com penteado', 4, 10],
  ],
  acabamento: [
    ['pezinho', 'Pezinho', 2, 5],
    ['linha-frontal', 'Linha frontal', 2, 5],
    ['linha-lateral', 'Linha lateral', 2, 5],
    ['acabamento-navalha', 'Acabamento com navalha', 4, 10],
    ['acabamento-maquina', 'Acabamento com maquina', 3, 8],
    ['sobrancelha-navalha', 'Sobrancelha na navalha', 3, 8],
    ['sobrancelha-pinca', 'Sobrancelha na pinca', 4, 12],
    ['risquinho-simples', 'Risquinho simples', 2, 5],
    ['risquinho-duplo', 'Risquinho duplo', 3, 8],
    ['desenho-simples', 'Desenho simples', 5, 15],
    ['desenho-detalhado', 'Desenho detalhado', 8, 25],
    ['freestyle-desenho', 'Freestyle/desenho avancado', 12, 35],
  ],
  barba: [
    ['barba-completa', 'Barba completa', 5, 20],
    ['alinhar-barba', 'So alinhar barba', 3, 10],
    ['barba-navalha', 'Barba com navalha', 6, 25],
    ['barba-maquina', 'Barba com maquina', 4, 15],
    ['degrade-barba', 'Degrade na barba', 4, 15],
    ['bigode', 'Bigode', 2, 5],
    ['cavanhaque', 'Cavanhaque', 3, 10],
    ['hidratacao-barba', 'Hidratacao de barba', 6, 20],
    ['pigmentacao-barba', 'Pigmentacao de barba', 8, 30],
    ['relaxamento-barba', 'Relaxamento de barba', 8, 30],
  ],
  'cabelo-barba': [
    ['corte-barba-simples', 'Corte + barba simples', 8, 45],
    ['corte-barba-completa', 'Corte + barba completa', 12, 60],
    ['corte-sobrancelha', 'Corte + sobrancelha', 8, 40],
    ['corte-barba-sobrancelha', 'Corte + barba + sobrancelha', 14, 70],
    ['corte-pigmentacao', 'Corte + pigmentacao', 15, 75],
    ['corte-hidratacao', 'Corte + hidratacao', 14, 65],
    ['pacote-completo', 'Pacote completo', 22, 100],
  ],
  'quimica-coloracao': [
    ['luzes', 'Luzes', 12, 90],
    ['platinado', 'Platinado', 25, 150],
    ['nevou', 'Nevou', 20, 120],
    ['reflexo', 'Reflexo', 12, 75],
    ['pigmentacao', 'Pigmentacao', 12, 60],
    ['tintura-completa', 'Tintura completa', 18, 90],
    ['descoloracao', 'Descoloracao', 18, 100],
    ['matizacao', 'Matizacao', 10, 45],
    ['relaxamento', 'Relaxamento', 10, 60],
    ['progressiva', 'Progressiva', 25, 120],
    ['botox-capilar', 'Botox capilar', 20, 90],
    ['selagem', 'Selagem', 22, 100],
  ],
  tratamentos: [
    ['hidratacao-capilar', 'Hidratacao capilar', 10, 45],
    ['nutricao-capilar', 'Nutricao capilar', 12, 50],
    ['reconstrucao-capilar', 'Reconstrucao capilar', 14, 60],
    ['limpeza-profunda', 'Limpeza profunda', 10, 40],
    ['esfoliacao-capilar', 'Esfoliacao capilar', 8, 30],
    ['tratamento-anticaspa', 'Tratamento anticaspa', 12, 45],
    ['tratamento-queda', 'Tratamento para queda', 15, 60],
    ['cronograma-capilar', 'Cronograma capilar', 30, 120],
  ],
  finalizacao: [
    ['pomada', 'Pomada', 2, 3],
    ['gel', 'Gel', 2, 3],
    ['spray-fixador', 'Spray fixador', 3, 3],
    ['escova', 'Escova', 5, 15],
    ['prancha', 'Prancha', 6, 20],
    ['penteado-social', 'Penteado social', 8, 25],
    ['penteado-freestyle', 'Penteado freestyle', 10, 30],
    ['finalizacao-cacheada', 'Finalizacao cacheada', 6, 20],
    ['finalizacao-brilho', 'Finalizacao com brilho', 4, 8],
  ],
  infantil: [
    ['corte-infantil-simples', 'Corte infantil simples', 5, 25],
    ['corte-infantil-desenho', 'Corte infantil com desenho', 8, 35],
    ['corte-infantil-tesoura', 'Corte infantil na tesoura', 7, 35],
    ['corte-infantil-maquina', 'Corte infantil na maquina', 5, 25],
    ['pacote-infantil', 'Pacote infantil', 12, 50],
  ],
  extras: [
    ['fora-horario', 'Atendimento fora do horario', 10, 0],
    ['domicilio', 'Atendimento em domicilio', 20, 30],
    ['urgencia', 'Urgencia/encaixe', 10, 0],
    ['vip', 'Agendamento VIP', 15, 0],
    ['taxa-atraso', 'Taxa de atraso', 5, 0],
    ['cancelamento-fora-prazo', 'Cancelamento fora do prazo', 8, 0],
    ['horario-premium', 'Horario premium', 8, 0],
  ],
}

export const SERVICE_OPTIONS = Object.entries(optionGroups).flatMap(([categoryId, items]) =>
  items.map(([slug, name, price, estimatedMinutes], index) => ({
    id: `${categoryId}-${slug}`,
    name,
    categoryId,
    price,
    description: '',
    estimatedMinutes,
    active: true,
    required: SERVICE_CATEGORIES.find((category) => category.id === categoryId)?.required || false,
    optionType: SERVICE_CATEGORIES.find((category) => category.id === categoryId)?.required ? 'required' : 'additional',
    order: (index + 1) * 10,
    compatibility: compatibilityFor(`${categoryId}-${slug}`),
  })),
)

export const SERVICES = [
  { id: 'corte-simples', name: 'Corte Simples', price: 5, duration: 30, category: 'basic', optionIds: ['laterais-social', 'parte-cima-maquina-cima'] },
  { id: 'corte-tesoura', name: 'Corte na Tesoura', price: 5, duration: 40, category: 'basic', optionIds: ['laterais-social', 'parte-cima-tesoura'] },
  { id: 'barba', name: 'Barba', price: 5, duration: 20, category: 'basic', optionIds: ['barba-barba-completa'] },
  { id: 'corte-barba', name: 'Corte + Barba', price: 8, duration: 50, category: 'combo', optionIds: ['cabelo-barba-corte-barba-simples'] },
  { id: 'pigmentacao', name: 'Pigmentacao', price: 12, duration: 60, category: 'premium', optionIds: ['quimica-coloracao-pigmentacao'] },
  { id: 'relaxamento', name: 'Relaxamento', price: 10, duration: 60, category: 'premium', optionIds: ['quimica-coloracao-relaxamento'] },
  { id: 'luzes', name: 'Luzes / Descoloracao', price: 12, duration: 90, category: 'premium', optionIds: ['quimica-coloracao-luzes'] },
  { id: 'hidratacao', name: 'Hidratacao Capilar', price: 10, duration: 45, category: 'premium', optionIds: ['tratamentos-hidratacao-capilar'] },
]

export const PRODUCT_CATEGORIES = [
  { id: 'pomadas', name: 'Pomadas', active: true, order: 10 },
  { id: 'gel', name: 'Gel', active: true, order: 20 },
  { id: 'shampoo', name: 'Shampoo', active: true, order: 30 },
  { id: 'condicionador', name: 'Condicionador', active: true, order: 40 },
  { id: 'tintas', name: 'Tintas', active: true, order: 50 },
  { id: 'barba', name: 'Produtos para barba', active: true, order: 60 },
  { id: 'cremes', name: 'Cremes', active: true, order: 70 },
  { id: 'finalizadores', name: 'Finalizadores', active: true, order: 80 },
]

export const PRODUCTS = [
  { id: 'pomada-matte', name: 'Pomada efeito matte', categoryId: 'pomadas', price: 18, stock: 12, active: true, description: 'Fixacao media sem brilho.', pickupEnabled: true, deliveryEnabled: true, order: 10 },
  { id: 'gel-forte', name: 'Gel fixacao forte', categoryId: 'gel', price: 12, stock: 18, active: true, description: 'Controle para finalizacao diaria.', pickupEnabled: true, deliveryEnabled: true, order: 20 },
  { id: 'shampoo-anticaspa', name: 'Shampoo anticaspa', categoryId: 'shampoo', price: 22, stock: 8, active: true, description: 'Cuidado para couro cabeludo.', pickupEnabled: true, deliveryEnabled: false, order: 30 },
  { id: 'condicionador-nutricao', name: 'Condicionador nutricao', categoryId: 'condicionador', price: 20, stock: 10, active: true, description: 'Maciez e hidratacao para uso semanal.', pickupEnabled: true, deliveryEnabled: true, order: 40 },
  { id: 'tinta-preta', name: 'Tinta preta', categoryId: 'tintas', price: 25, stock: 6, active: true, description: 'Coloracao para cabelo ou barba.', pickupEnabled: true, deliveryEnabled: false, order: 50 },
  { id: 'oleo-barba', name: 'Oleo para barba', categoryId: 'barba', price: 28, stock: 9, active: true, description: 'Hidratacao e brilho para barba.', pickupEnabled: true, deliveryEnabled: true, order: 60 },
  { id: 'creme-modelador', name: 'Creme modelador', categoryId: 'cremes', price: 24, stock: 7, active: true, description: 'Modelagem leve com aspecto natural.', pickupEnabled: true, deliveryEnabled: true, order: 70 },
  { id: 'spray-brilho', name: 'Spray de brilho', categoryId: 'finalizadores', price: 16, stock: 11, active: true, description: 'Finalizacao com brilho controlado.', pickupEnabled: true, deliveryEnabled: true, order: 80 },
]

export const PRODUCT_FULFILLMENT_METHODS = [
  { id: 'pickup', name: 'Retirar no dia do corte', active: true },
  { id: 'delivery', name: 'Receber por entrega', active: true },
]

export const PRODUCT_FULFILLMENT_METHOD_IDS = PRODUCT_FULFILLMENT_METHODS.map((method) => method.id)

export const PRODUCT_RESERVATION_STATUSES = [
  { id: 'reserved', name: 'Reservado', activeStock: true },
  { id: 'paid', name: 'Pago', activeStock: true },
  { id: 'delivered', name: 'Entregue', activeStock: false },
  { id: 'cancelled', name: 'Cancelado', activeStock: false },
]

export const PRODUCT_RESERVATION_STATUS_IDS = PRODUCT_RESERVATION_STATUSES.map((status) => status.id)

export function getProductFulfillmentMethod(id) {
  return PRODUCT_FULFILLMENT_METHODS.find((method) => method.id === id)
}

export function getProductReservationStatus(id) {
  return PRODUCT_RESERVATION_STATUSES.find((status) => status.id === id)
}

export function productSupportsFulfillment(product, fulfillmentMethod) {
  if (!product) return false
  if (fulfillmentMethod === 'pickup') return Boolean(product.pickupEnabled)
  if (fulfillmentMethod === 'delivery') return Boolean(product.deliveryEnabled)
  return false
}

export const PAYMENT_METHODS = [
  { id: 'pix', name: 'PIX antecipado', prepaid: true, active: true },
  { id: 'cartao', name: 'Cartao antecipado', prepaid: true, active: true },
  { id: 'dinheiro', name: 'Dinheiro no local', prepaid: false, active: true },
]

export const PAYMENT_METHOD_IDS = PAYMENT_METHODS.map((method) => method.id)

export const PAYMENT_STATUSES = [
  { id: 'pending', name: 'Pendente', revenueState: 'pending' },
  { id: 'paid', name: 'Pago', revenueState: 'paid' },
  { id: 'cancelled', name: 'Cancelado', revenueState: 'cancelled' },
  { id: 'refunded', name: 'Estornado', revenueState: 'cancelled' },
]

export const APPOINTMENT_STATUSES = [
  { id: 'pending', name: 'Pendente' },
  { id: 'confirmed', name: 'Confirmado' },
  { id: 'completed', name: 'Concluido' },
  { id: 'cancelled', name: 'Cancelado' },
]

export function getAppointmentStatus(id) {
  return APPOINTMENT_STATUSES.find((status) => status.id === id)
}

export function getPaymentMethod(id) {
  return PAYMENT_METHODS.find((method) => method.id === id)
}

export function getPaymentStatus(id) {
  return PAYMENT_STATUSES.find((status) => status.id === id)
}

export function getPaymentStatusForMethod(methodId) {
  return getPaymentMethod(methodId)?.prepaid ? 'paid' : 'pending'
}

export function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

export function getPricingModelLabel(modelId = 'fixed') {
  return PRICING_MODELS.find((model) => model.id === modelId)?.name || 'Preco fixo'
}

export function getService(id, services = SERVICES) {
  return services.find((service) => service.id === id)
}

export function getOption(id, options = SERVICE_OPTIONS) {
  return options.find((option) => option.id === id)
}

export function getCategory(id, categories = SERVICE_CATEGORIES) {
  return categories.find((category) => category.id === id)
}

export function getActiveCategories(categories = SERVICE_CATEGORIES) {
  return [...categories].filter((category) => category.active).sort((a, b) => a.order - b.order)
}

export function getActiveOptionsByCategory(categoryId, options = SERVICE_OPTIONS) {
  return [...options]
    .filter((option) => option.categoryId === categoryId && option.active)
    .sort((a, b) => a.order - b.order)
}

export function calculateDynamicSelection(optionIds = [], options = SERVICE_OPTIONS) {
  const selectedOptions = optionIds.map((id) => getOption(id, options)).filter(Boolean)
  const totalOptionPrice = selectedOptions.reduce((sum, option) => sum + Number(option.price || 0), 0)
  return {
    selectedOptions,
    totalPrice: selectedOptions.length ? totalOptionPrice / selectedOptions.length : 0,
    totalMinutes: selectedOptions.reduce((sum, option) => sum + Number(option.estimatedMinutes || 0), 0),
  }
}

export function calculatePrice(baseResult = {}, barber = {}) {
  const totalMinutes = Number(baseResult.totalMinutes || 0)
  const basePrice = Number(baseResult.totalPrice || 0)
  const pricingModel = barber?.pricingModel || 'fixed'

  if (pricingModel === 'per_minute') {
    const minuteRate = Number(barber.minuteRate || 0)
    return {
      finalPrice: totalMinutes * minuteRate,
      breakdown: `${totalMinutes}min x ${money(minuteRate)}/min`,
    }
  }

  if (pricingModel === 'duration_tier') {
    const tiers = normalizeDurationTiers(barber.durationTiers)
    const tier = tiers.find((item) => totalMinutes <= Number(item.upTo || 0)) || tiers.at(-1)
    const surcharge = Number(tier?.surcharge || 0)
    return {
      finalPrice: basePrice + surcharge,
      breakdown: `Base ${money(basePrice)} + faixa ${money(surcharge)} ate ${tier?.upTo || totalMinutes}min`,
    }
  }

  if (pricingModel === 'slot_only') {
    return {
      finalPrice: basePrice,
      breakdown: `${money(basePrice)} com reserva operacional de slots`,
    }
  }

  return {
    finalPrice: basePrice,
    breakdown: `${money(basePrice)} pelo modelo ${getPricingModelLabel(pricingModel)}`,
  }
}

export function normalizeBarberPricing(barber = {}) {
  return {
    ...barber,
    pricingModel: barber.pricingModel || 'fixed',
    minuteRate: Number(barber.minuteRate || 1.5),
    durationTiers: normalizeDurationTiers(barber.durationTiers),
  }
}

export function normalizeDurationTiers(tiers = DEFAULT_DURATION_TIERS) {
  const normalized = (Array.isArray(tiers) && tiers.length ? tiers : DEFAULT_DURATION_TIERS)
    .map((tier) => ({
      upTo: Number(tier.upTo || 0),
      surcharge: Number(tier.surcharge || 0),
    }))
    .filter((tier) => tier.upTo > 0)
    .sort((a, b) => a.upTo - b.upTo)
  return normalized.length ? normalized : DEFAULT_DURATION_TIERS
}

export function getCompatibilityBlock(option, selectedOptionIds = [], options = SERVICE_OPTIONS) {
  if (!option) return null
  const selected = selectedOptionIds.filter((id) => id !== option.id)
  const incompatible = option.compatibility?.incompatibleOptionIds || []
  const reverseIncompatible = selected.filter((id) => getOption(id, options)?.compatibility?.incompatibleOptionIds?.includes(option.id))
  const directConflictId = selected.find((id) => incompatible.includes(id)) || reverseIncompatible[0]
  if (directConflictId) {
    const conflict = getOption(directConflictId, options)
    return `Incompativel com ${conflict?.name || directConflictId}`
  }
  const requires = option.compatibility?.requiresOptionIds || []
  const missingRequirementId = requires.find((id) => !selectedOptionIds.includes(id))
  if (missingRequirementId) {
    const requirement = getOption(missingRequirementId, options)
    return `Requer ${requirement?.name || missingRequirementId}`
  }
  return null
}

export function findSelectionConflicts(optionIds = [], options = SERVICE_OPTIONS) {
  return optionIds
    .map((id) => {
      const option = getOption(id, options)
      const message = getCompatibilityBlock(option, optionIds, options)
      return message ? { optionId: id, optionName: option?.name || id, message } : null
    })
    .filter(Boolean)
}

export function normalizeDynamicAppointment(appointment, services = SERVICES) {
  if (appointment.selectedOptionIds?.length) return appointment
  const service = getService(appointment.serviceId, services)
  return {
    ...appointment,
    selectedOptionIds: service?.optionIds || [],
    dynamicPricingVersion: PRICING_SEED_VERSION,
  }
}

function compatibilityFor(optionId) {
  const rules = {
    'laterais-maquina-0': {
      incompatibleOptionIds: ['parte-cima-tesoura', 'parte-cima-manter-comprimento', 'parte-cima-penteado-cima'],
      requiresOptionIds: [],
      notes: 'Maquina 0 combina melhor com topo feito na maquina ou volume reduzido.',
    },
    'laterais-maquina-05': {
      incompatibleOptionIds: ['parte-cima-penteado-cima'],
      requiresOptionIds: [],
      notes: 'Evite penteado elaborado quando a lateral for muito baixa.',
    },
    'laterais-freestyle-lateral': {
      incompatibleOptionIds: ['acabamento-risquinho-simples', 'acabamento-risquinho-duplo'],
      requiresOptionIds: [],
      notes: 'Freestyle lateral substitui risquinhos simples.',
    },
    'acabamento-desenho-detalhado': {
      incompatibleOptionIds: ['acabamento-risquinho-simples', 'acabamento-risquinho-duplo'],
      requiresOptionIds: [],
      notes: 'Desenho detalhado substitui risquinhos.',
    },
    'acabamento-freestyle-desenho': {
      incompatibleOptionIds: ['acabamento-risquinho-simples', 'acabamento-risquinho-duplo', 'acabamento-desenho-simples'],
      requiresOptionIds: [],
      notes: 'Freestyle avancado substitui desenhos menores.',
    },
    'quimica-coloracao-platinado': {
      incompatibleOptionIds: ['quimica-coloracao-pigmentacao', 'quimica-coloracao-tintura-completa'],
      requiresOptionIds: ['quimica-coloracao-descoloracao'],
      notes: 'Platinado exige descoloracao e nao combina com pigmentacao no mesmo horario.',
    },
    'quimica-coloracao-nevou': {
      incompatibleOptionIds: ['quimica-coloracao-pigmentacao', 'quimica-coloracao-tintura-completa'],
      requiresOptionIds: ['quimica-coloracao-descoloracao'],
      notes: 'Nevou exige descoloracao.',
    },
    'extras-fora-horario': {
      incompatibleOptionIds: ['extras-horario-premium'],
      requiresOptionIds: [],
      notes: 'Use uma taxa de horario especial por agendamento.',
    },
  }
  return rules[optionId] || { incompatibleOptionIds: [], requiresOptionIds: [], notes: '' }
}
