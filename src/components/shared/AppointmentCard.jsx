import { Clock, CreditCard, User } from 'lucide-react'
import { Badge, Card } from '../../design-system'
import { calculateDynamicSelection, getAppointmentStatus, getPaymentStatus, money, getService, SERVICE_OPTIONS } from '../../utils/pricing'

export function AppointmentCard({ appointment, barbers, services, options = SERVICE_OPTIONS, categories = [], actions }) {
  const service = getService(appointment.serviceId, services)
  const barber = barbers.find((item) => item.id === appointment.barberId)
  const dynamic = appointment.selectedOptionsSnapshot?.length
    ? { selectedOptions: appointment.selectedOptionsSnapshot, totalMinutes: appointment.estimatedMinutes }
    : calculateDynamicSelection(appointment.selectedOptionIds || service?.optionIds || [], options)
  const title = service?.name || 'Atendimento personalizado'
  const duration = appointment.estimatedMinutes || service?.duration || dynamic.totalMinutes || 30
  const appointmentStatus = getAppointmentStatus(appointment.status)
  const payment = getPaymentStatus(appointment.paymentStatus || 'pending')
  const groupedOptions = categories.length ? dynamic.selectedOptions.reduce((groups, option) => {
    const category = categories.find((item) => item.id === option.categoryId)
    const key = option.categoryId || 'outros'
    const current = groups[key] || { id: key, name: category?.name || 'Outros', options: [] }
    return { ...groups, [key]: { ...current, options: [...current.options, option] } }
  }, {}) : null
  return (
    <Card appointment hover>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{appointment.date} as {appointment.time}</p>
        </div>
        <Badge status={appointment.status}>{appointmentStatus?.name || appointment.status}</Badge>
      </div>
      {groupedOptions ? (
        <div className="mt-3 grid gap-2">
          {Object.values(groupedOptions).slice(0, 3).map((group) => (
            <div key={group.id}>
              <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{group.name}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {group.options.slice(0, 4).map((option) => <span key={option.id} className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">{option.name}</span>)}
              </div>
            </div>
          ))}
        </div>
      ) : dynamic.selectedOptions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {dynamic.selectedOptions.slice(0, 6).map((option) => <span key={option.id} className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-xs text-[var(--text-secondary)]">{option.name}</span>)}
        </div>
      ) : null}
      <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">
        <span className="flex items-center gap-2"><User className="h-4 w-4" /> {appointment.clientName} com {barber?.name}</span>
        <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {duration} min</span>
        <span className="flex items-center gap-2"><CreditCard className="h-4 w-4" /> {money(appointment.price || service?.price || 0)} - {payment?.name || 'Pendente'}</span>
      </div>
      {appointment.cancelReason ? (
        <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--status-cancelled)] bg-red-500/10 p-3 text-sm text-red-200">
          <span className="font-semibold">Motivo do cancelamento:</span> {appointment.cancelReason}
        </div>
      ) : null}
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </Card>
  )
}
