import { endOfMonth, endOfWeek, format, isWithinInterval, parseISO, startOfMonth, startOfWeek } from 'date-fns'
import { calculateDynamicSelection, getAppointmentStatus, getCategory, getPaymentMethod, getPaymentStatus } from './pricing.js'

const revenueStatuses = ['completed', 'confirmed']

export function filterAppointmentsByPeriod(appointments, period = 'all') {
  if (period === 'all') return appointments
  const now = new Date()
  const todayKey = format(now, 'yyyy-MM-dd')
  if (period === 'today') return appointments.filter((item) => item.date === todayKey)
  const start = period === 'week' ? startOfWeek(now, { weekStartsOn: 1 }) : startOfMonth(now)
  const end = period === 'week' ? endOfWeek(now, { weekStartsOn: 1 }) : endOfMonth(now)
  return appointments.filter((item) => isWithinInterval(parseISO(item.date), { start, end }))
}

export function appointmentValue(appointment) {
  return Number(appointment.price || 0)
}

export function isPaid(appointment) {
  return getPaymentRevenueState(appointment) === 'paid' && appointment.status !== 'cancelled'
}

export function getPaymentRevenueState(appointment) {
  const explicitStatus = getPaymentStatus(appointment.paymentStatus)
  if (explicitStatus) return explicitStatus.revenueState
  return getPaymentMethod(appointment.paymentMethod)?.prepaid ? 'paid' : 'pending'
}

export function buildFinanceMetrics(appointments, options = [], categories = []) {
  const now = new Date()
  const todayKey = format(now, 'yyyy-MM-dd')
  const week = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
  const month = { start: startOfMonth(now), end: endOfMonth(now) }
  const activeRevenue = appointments.filter((item) => revenueStatuses.includes(item.status))
  const completed = appointments.filter((item) => item.status === 'completed')
  const confirmed = appointments.filter((item) => item.status === 'confirmed')
  const cancelled = appointments.filter((item) => item.status === 'cancelled')
  const paid = activeRevenue.filter(isPaid)
  const pending = activeRevenue.filter((item) => !isPaid(item))
  const totalRevenue = activeRevenue.reduce((sum, item) => sum + appointmentValue(item), 0)
  const paidRevenue = paid.reduce((sum, item) => sum + appointmentValue(item), 0)
  const confirmedRevenue = confirmed.reduce((sum, item) => sum + appointmentValue(item), 0)
  const pendingRevenue = pending.reduce((sum, item) => sum + appointmentValue(item), 0)
  const cancelledRevenue = cancelled.reduce((sum, item) => sum + appointmentValue(item), 0)
  const dailyRevenue = activeRevenue.filter((item) => item.date === todayKey).reduce((sum, item) => sum + appointmentValue(item), 0)
  const weeklyRevenue = activeRevenue.filter((item) => isWithinInterval(parseISO(item.date), week)).reduce((sum, item) => sum + appointmentValue(item), 0)
  const monthlyRevenue = activeRevenue.filter((item) => isWithinInterval(parseISO(item.date), month)).reduce((sum, item) => sum + appointmentValue(item), 0)
  const ticket = activeRevenue.length ? totalRevenue / activeRevenue.length : 0

  const optionMap = countOptions(activeRevenue, options)
  const categoryMap = countCategories(activeRevenue, options, categories)
  const clientMap = countClients(activeRevenue)
  const hourMap = countHours(activeRevenue)

  return {
    totalRevenue,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    paidRevenue,
    confirmedRevenue,
    pendingRevenue,
    cancelledRevenue,
    finalCapital: paidRevenue,
    appointmentCount: appointments.length,
    completedCount: completed.length,
    averageTicket: ticket,
    cancellationRate: appointments.length ? (cancelled.length / appointments.length) * 100 : 0,
    topOptions: sortRank(optionMap),
    topCategories: sortRank(categoryMap),
    topClients: sortRank(clientMap),
    topHours: sortRank(hourMap),
    revenueByDay: groupRevenueByDay(activeRevenue),
    statusRevenue: [
      { name: getPaymentStatus('paid')?.name || 'Pago', value: paidRevenue },
      { name: getAppointmentStatus('confirmed')?.name || 'Confirmado', value: confirmedRevenue },
      { name: getPaymentStatus('pending')?.name || 'Pendente', value: pendingRevenue },
      { name: getAppointmentStatus('cancelled')?.name || 'Cancelado', value: cancelledRevenue },
    ].filter((item) => item.value > 0),
  }
}

function countOptions(appointments, options) {
  return appointments.reduce((acc, appointment) => {
    const selected = appointment.selectedOptionsSnapshot?.length
      ? appointment.selectedOptionsSnapshot
      : calculateDynamicSelection(appointment.selectedOptionIds || [], options).selectedOptions
    const optionRevenue = selected.length ? appointmentValue(appointment) / selected.length : 0
    selected.forEach((option) => {
      const current = acc[option.id] || { id: option.id, name: option.name, count: 0, revenue: 0 }
      acc[option.id] = { ...current, count: current.count + 1, revenue: current.revenue + optionRevenue }
    })
    return acc
  }, {})
}

function countCategories(appointments, options, categories) {
  return appointments.reduce((acc, appointment) => {
    const selected = appointment.selectedOptionsSnapshot?.length
      ? appointment.selectedOptionsSnapshot
      : calculateDynamicSelection(appointment.selectedOptionIds || [], options).selectedOptions
    const optionRevenue = selected.length ? appointmentValue(appointment) / selected.length : 0
    selected.forEach((option) => {
      const category = getCategory(option.categoryId, categories)
      const current = acc[option.categoryId] || { id: option.categoryId, name: category?.name || option.categoryId, count: 0, revenue: 0 }
      acc[option.categoryId] = { ...current, count: current.count + 1, revenue: current.revenue + optionRevenue }
    })
    return acc
  }, {})
}

function countClients(appointments) {
  return appointments.reduce((acc, appointment) => {
    const key = appointment.clientEmail || appointment.clientName
    const current = acc[key] || { id: key, name: appointment.clientName, count: 0, revenue: 0 }
    acc[key] = { ...current, count: current.count + 1, revenue: current.revenue + appointmentValue(appointment) }
    return acc
  }, {})
}

function countHours(appointments) {
  return appointments.reduce((acc, appointment) => {
    const key = appointment.time?.slice(0, 2) || '00'
    const current = acc[key] || { id: key, name: `${key}:00`, count: 0, revenue: 0 }
    acc[key] = { ...current, count: current.count + 1, revenue: current.revenue + appointmentValue(appointment) }
    return acc
  }, {})
}

function groupRevenueByDay(appointments) {
  const map = appointments.reduce((acc, appointment) => {
    const current = acc[appointment.date] || { date: appointment.date.slice(5), revenue: 0, total: 0 }
    acc[appointment.date] = { ...current, revenue: current.revenue + appointmentValue(appointment), total: current.total + 1 }
    return acc
  }, {})
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

function sortRank(map) {
  return Object.values(map).sort((a, b) => b.revenue - a.revenue || b.count - a.count)
}
