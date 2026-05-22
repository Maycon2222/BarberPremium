import { addHours, differenceInMinutes, format, isBefore, parseISO, setHours, setMinutes } from 'date-fns'

export const BUSINESS = {
  days: [1, 2, 3, 4, 5, 6],
  start: '08:00',
  end: '19:00',
  interval: 30,
}

export function availableTimes(settings = BUSINESS) {
  const times = []
  const interval = Math.max(5, Number(settings.interval || BUSINESS.interval))
  const start = parseTime(settings.start || BUSINESS.start)
  const end = parseTime(settings.end || BUSINESS.end)
  for (let minutes = start; minutes <= end; minutes += interval) {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    times.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
  }
  return times
}

export function toAppointmentDate(date, time) {
  if (!date || !time) return null
  const [hour, minute] = time.split(':').map(Number)
  return setMinutes(setHours(parseISO(date), hour), minute)
}

export function isWorkingDay(date) {
  const day = parseISO(date).getDay()
  return BUSINESS.days.includes(day)
}

export function isAtLeastOneHourAhead(date, time) {
  const selected = toAppointmentDate(date, time)
  return selected ? !isBefore(selected, addHours(new Date(), 1)) : false
}

export function canCancel(appointment) {
  const selected = toAppointmentDate(appointment.date, appointment.time)
  return selected ? differenceInMinutes(selected, new Date()) > 120 : false
}

export function hasConflict(appointments, barberId, date, time, ignoreId) {
  return appointments.some((appointment) => appointment.id !== ignoreId && appointment.barberId === barberId && appointment.date === date && appointment.time === time && appointment.status !== 'cancelled')
}

export function isSlotUnavailable(appointments, barberId, date, time) {
  return !isWorkingDay(date) || !isAtLeastOneHourAhead(date, time) || hasConflict(appointments, barberId, date, time)
}

export function receiptCode() {
  return `BP-${format(new Date(), 'yyyyMMdd')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

function parseTime(value) {
  if (typeof value === 'number') return value * 60
  const [hour = 0, minute = 0] = String(value).split(':').map(Number)
  return hour * 60 + minute
}
