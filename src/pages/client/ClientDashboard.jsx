import { Link } from 'react-router-dom'
import { CalendarCheck, History, Plus } from 'lucide-react'
import { Button } from '../../design-system'
import { AppointmentCard } from '../../components/shared/AppointmentCard'
import { Page } from '../../components/shared/AppLayout'
import { StatCard } from '../../components/shared/StatCard'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useAuthStore } from '../../store/authStore'
import { useServiceStore } from '../../store/serviceStore'

export function ClientDashboard() {
  const { user } = useAuthStore()
  const { appointments, barbers } = useAppointmentStore()
  const { services, options, categories } = useServiceStore()
  const mine = appointments.filter((item) => item.clientId === user?.id || item.clientEmail === user?.email)
  const next = mine
    .filter((item) => ['confirmed', 'pending'].includes(item.status))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  const visibleNext = next.slice(0, 4)
  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">Cliente</p>
          <h2 className="font-display text-3xl font-bold">Seu proximo corte</h2>
        </div>
        <Link to="/client/book"><Button><Plus className="h-4 w-4" /> Novo agendamento</Button></Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <StatCard label="Proximos agendamentos" value={next.length} icon={CalendarCheck} />
        <StatCard label="Historico total" value={mine.length} icon={History} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {visibleNext.length ? visibleNext.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} barbers={barbers} services={services} options={options} categories={categories} />) : <p className="text-[var(--text-secondary)]">Nenhum agendamento ativo.</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3">
        <p className="text-sm text-[var(--text-secondary)]">{next.length} agendamentos ativos encontrados.</p>
        <Link to="/client/history" className="text-sm font-semibold text-[var(--accent-text)]">Ver historico completo</Link>
      </div>
    </Page>
  )
}
