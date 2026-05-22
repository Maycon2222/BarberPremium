import { create } from 'zustand'
import { canCancel, hasConflict, receiptCode } from '../utils/businessRules'
import { readJson } from '../utils/seed'

const persistAppointments = (appointments) => localStorage.setItem('barber-appointments', JSON.stringify(appointments))
const persistBarbers = (barbers) => localStorage.setItem('barber-barbers', JSON.stringify(barbers))

export const useAppointmentStore = create((set, get) => ({
  appointments: readJson('barber-appointments', []),
  barbers: readJson('barber-barbers', []),
  settings: readJson('barber-settings', { shopName: 'Barber Prime', start: '08:00', end: '19:00', interval: 30 }),
  createAppointment: (payload) => {
    const appointments = readJson('barber-appointments', get().appointments)
    if (hasConflict(appointments, payload.barberId, payload.date, payload.time)) throw new Error('Horario ocupado para este barbeiro')
    const appointment = {
      id: `${Date.now()}`,
      status: 'confirmed',
      receiptCode: receiptCode(),
      createdAt: new Date().toISOString(),
      ...payload,
    }
    const next = [...appointments, appointment]
    persistAppointments(next)
    set({ appointments: next })
    return appointment
  },
  updateStatus: (id, status, cancelReason = '') => {
    const next = get().appointments.map((appointment) => {
      if (appointment.id !== id) return appointment
      return status === 'cancelled'
        ? { ...appointment, status, cancelReason: cancelReason || appointment.cancelReason || 'Cancelado' }
        : { ...appointment, status, cancelReason: '' }
    })
    persistAppointments(next)
    set({ appointments: next })
  },
  updatePaymentStatus: (id, paymentStatus) => {
    const next = get().appointments.map((appointment) => (appointment.id === id ? { ...appointment, paymentStatus } : appointment))
    persistAppointments(next)
    set({ appointments: next })
  },
  cancelAppointment: (id, reason = 'Cancelado pelo usuario') => {
    const appointment = get().appointments.find((item) => item.id === id)
    if (!appointment || !canCancel(appointment)) throw new Error('Cancelamento permitido somente com mais de 2h de antecedencia')
    get().updateStatus(id, 'cancelled', reason)
  },
  upsertBarber: (barber) => {
    const exists = get().barbers.some((item) => item.id === barber.id)
    const next = exists ? get().barbers.map((item) => (item.id === barber.id ? barber : item)) : [...get().barbers, { ...barber, id: `barber-${Date.now()}` }]
    persistBarbers(next)
    set({ barbers: next })
  },
  toggleBarber: (id) => {
    const next = get().barbers.map((barber) => (barber.id === id ? { ...barber, active: !barber.active } : barber))
    persistBarbers(next)
    set({ barbers: next })
  },
  saveSettings: (settings) => {
    localStorage.setItem('barber-settings', JSON.stringify(settings))
    set({ settings })
  },
}))
