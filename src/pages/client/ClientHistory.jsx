import { useState } from 'react'
import { Card, Input } from '../../design-system'
import { AppointmentCard } from '../../components/shared/AppointmentCard'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useAuthStore } from '../../store/authStore'
import { useServiceStore } from '../../store/serviceStore'
import { APPOINTMENT_STATUSES, calculateDynamicSelection, getService } from '../../utils/pricing'

export function ClientHistory() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const { user } = useAuthStore()
  const { appointments, barbers } = useAppointmentStore()
  const { services, options, categories } = useServiceStore()
  const mine = appointments
    .filter((item) => item.clientId === user?.id || item.clientEmail === user?.email)
    .filter((item) => status === 'all' || item.status === status)
    .filter((item) => {
      const service = getService(item.serviceId, services)
      const selected = item.selectedOptionsSnapshot?.length ? item.selectedOptionsSnapshot : calculateDynamicSelection(item.selectedOptionIds || service?.optionIds || [], options).selectedOptions
      const barber = barbers.find((entry) => entry.id === item.barberId)
      const text = `${item.date} ${item.time} ${service?.name || ''} ${barber?.name || ''} ${selected.map((option) => option.name).join(' ')}`.toLowerCase()
      return text.includes(search.toLowerCase().trim())
    })
  return (
    <Page>
      <h2 className="mb-6 font-display text-3xl font-bold">Historico</h2>
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input label="Buscar no historico" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3">
              <option value="all">Todos</option>
              {APPOINTMENT_STATUSES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </select>
          </label>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {mine.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} barbers={barbers} services={services} options={options} categories={categories} />)}
      </div>
    </Page>
  )
}
