import {
  SERVICE_OPTIONS,
  calculateDynamicSelection,
  findSelectionConflicts,
  getCompatibilityBlock,
  getOption,
  productSupportsFulfillment,
} from '../src/utils/pricing.js'
import { buildFinanceMetrics } from '../src/utils/finance.js'
import { availableTimes, hasConflict, isSlotUnavailable } from '../src/utils/businessRules.js'
import { ensurePricingSeed } from '../src/utils/seed.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const block = getCompatibilityBlock(getOption('parte-cima-tesoura', SERVICE_OPTIONS), ['laterais-maquina-0'], SERVICE_OPTIONS)
assert(block?.includes('Maquina 0'), 'Tesoura deve bloquear com Maquina 0 selecionada')

const platinadoConflicts = findSelectionConflicts(['quimica-coloracao-platinado'], SERVICE_OPTIONS)
assert(platinadoConflicts[0]?.message.includes('Descoloracao'), 'Platinado deve exigir Descoloracao')

const selection = calculateDynamicSelection(['laterais-degrade-baixo', 'parte-cima-tesoura'], SERVICE_OPTIONS)
assert(selection.totalPrice === 5, 'Media esperada para Degrade baixo + Tesoura deve ser 5')
assert(selection.totalMinutes === 40, 'Tempo esperado para Degrade baixo + Tesoura deve ser 40')

const configuredTimes = availableTimes({ start: '09:00', end: '10:00', interval: 30 })
assert(configuredTimes.join(',') === '09:00,09:30,10:00', 'Horarios devem respeitar configuracao administrativa')
assert(hasConflict([{ id: 'x1', barberId: 'b1', date: '2026-05-23', time: '09:00', status: 'confirmed' }], 'b1', '2026-05-23', '09:00'), 'Conflito deve bloquear agendamento ativo')
assert(!hasConflict([{ id: 'x2', barberId: 'b1', date: '2026-05-23', time: '09:00', status: 'cancelled' }], 'b1', '2026-05-23', '09:00'), 'Conflito deve ignorar agendamento cancelado')
assert(isSlotUnavailable([], 'b1', '2026-05-24', '09:00'), 'Domingo deve ficar indisponivel')

const metrics = buildFinanceMetrics([
  {
    id: 'a1',
    date: '2026-05-20',
    time: '10:00',
    status: 'confirmed',
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    price: 10,
    clientName: 'Cliente A',
    clientEmail: 'a@email.com',
    selectedOptionIds: ['laterais-degrade-baixo', 'parte-cima-tesoura'],
  },
  {
    id: 'a2',
    date: '2026-05-20',
    time: '11:00',
    status: 'cancelled',
    paymentMethod: 'cartao',
    price: 5,
    clientName: 'Cliente B',
    clientEmail: 'b@email.com',
    selectedOptionIds: ['laterais-maquina-0'],
  },
  {
    id: 'a3',
    date: '2026-05-20',
    time: '12:00',
    status: 'confirmed',
    paymentMethod: 'dinheiro',
    paymentStatus: 'pending',
    price: 7,
    clientName: 'Cliente C',
    clientEmail: 'c@email.com',
    selectedOptionIds: ['barba-barba-completa'],
  },
  {
    id: 'a4',
    date: '2026-05-20',
    time: '13:00',
    status: 'confirmed',
    paymentMethod: 'pix',
    price: 8,
    clientName: 'Cliente D',
    clientEmail: 'd@email.com',
    selectedOptionIds: ['acabamento-pezinho'],
  },
], SERVICE_OPTIONS, [])

assert(metrics.totalRevenue === 25, 'Faturamento ativo esperado deve ser 25')
assert(metrics.paidRevenue === 18, 'Faturamento pago esperado deve ser 18')
assert(metrics.pendingRevenue === 7, 'Faturamento pendente esperado deve ser 7')
assert(metrics.cancelledRevenue === 5, 'Valor cancelado esperado deve ser 5')
assert(metrics.finalCapital === 18, 'Capital final deve considerar somente valor recebido')
assert(metrics.topOptions[0]?.name === 'Pezinho', 'Ranking esperado deve iniciar com opcao ativa de maior receita')
assert(!metrics.topOptions.some((option) => option.id === 'laterais-maquina-0'), 'Ranking nao deve considerar opcao de agendamento cancelado')

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
}

localStorage.setItem('barber-pricing-version', 'old-version')
localStorage.setItem('barber-barbers', JSON.stringify([{ id: 'barber-joao', name: 'Joao Martins', specialties: ['corte-simples'] }]))
localStorage.setItem('barber-service-options', JSON.stringify([
  {
    id: 'laterais-maquina-0',
    name: 'Maquina zero custom',
    categoryId: 'laterais',
    price: 99,
    estimatedMinutes: 15,
    active: true,
    required: true,
    optionType: 'required',
    order: 50,
    compatibility: { incompatibleOptionIds: [], requiresOptionIds: [], notes: '' },
  },
]))
ensurePricingSeed()
const migratedOptions = JSON.parse(localStorage.getItem('barber-service-options'))
const migratedMachineZero = migratedOptions.find((option) => option.id === 'laterais-maquina-0')
const migratedBarbers = JSON.parse(localStorage.getItem('barber-barbers'))
const migratedJoao = migratedBarbers.find((item) => item.id === 'barber-joao')
assert(migratedMachineZero.price === 99, 'Migracao deve preservar preco customizado')
assert(migratedMachineZero.name === 'Maquina zero custom', 'Migracao deve preservar nome customizado')
assert(migratedMachineZero.compatibility.incompatibleOptionIds.includes('parte-cima-tesoura'), 'Migracao deve atualizar compatibilidade seedada')
assert(migratedOptions.some((option) => option.id === 'parte-cima-tesoura'), 'Migracao deve inserir opcoes seedadas ausentes')
assert(migratedJoao.specialtyOptionIds.includes('laterais-degrade-baixo'), 'Migracao deve aplicar preset de especialidades do barbeiro')
assert(migratedJoao.specialtyOptionIds.includes('parte-cima-maquina-cima'), 'Migracao deve preservar especialidades legadas convertidas')

const barber = { name: 'Joao', specialtyOptionIds: ['laterais-degrade-baixo'] }
const unsupported = ['laterais-degrade-baixo', 'parte-cima-tesoura']
  .map((id) => SERVICE_OPTIONS.find((option) => option.id === id))
  .filter((option) => option && !barber.specialtyOptionIds.includes(option.id))
assert(unsupported.length === 1 && unsupported[0].id === 'parte-cima-tesoura', 'Especialidades do barbeiro devem identificar opcoes nao oferecidas')

const pickupOnlyProduct = { pickupEnabled: true, deliveryEnabled: false }
assert(productSupportsFulfillment(pickupOnlyProduct, 'pickup'), 'Produto com retirada deve aceitar retirada')
assert(!productSupportsFulfillment(pickupOnlyProduct, 'delivery'), 'Produto sem entrega nao deve aceitar entrega')

localStorage.setItem('barber-products', JSON.stringify([{ id: 'produto-1', name: 'Pomada teste', price: 20, stock: 3, active: true, pickupEnabled: true, deliveryEnabled: false }]))
localStorage.setItem('barber-product-reservations', JSON.stringify([]))
const { useProductStore } = await import('../src/store/productStore.js')
useProductStore.setState({ products: JSON.parse(localStorage.getItem('barber-products')), reservations: [] })
const reservation = useProductStore.getState().reserveProduct({ productId: 'produto-1', clientId: 'cliente-1', quantity: 2, fulfillmentMethod: 'pickup' })
assert(useProductStore.getState().products.find((product) => product.id === 'produto-1').stock === 1, 'Reserva deve baixar estoque')
useProductStore.getState().updateReservation(reservation.id, { status: 'cancelled' })
assert(useProductStore.getState().products.find((product) => product.id === 'produto-1').stock === 3, 'Cancelamento de reserva deve devolver estoque')

console.log('Regras criticas validadas com sucesso.')
