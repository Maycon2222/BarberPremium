import { endOfMonth, endOfWeek, format, isWithinInterval, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, CalendarCheck, Clock3, Scissors, TrendingUp } from 'lucide-react'
import { Button, Card, Input, Modal } from '../../design-system'
import { AppointmentCard } from '../../components/shared/AppointmentCard'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useAuthStore } from '../../store/authStore'
import { useServiceStore } from '../../store/serviceStore'
import { buildFinanceMetrics, isPaid } from '../../utils/finance'
import { APPOINTMENT_STATUSES, calculateDynamicSelection, getService, money } from '../../utils/pricing'
import { useMemo, useState } from 'react'

export function BarberDashboard() {
  const today = format(new Date(), 'yyyy-MM-dd')
  return <BarberList title="Agenda do dia" filter={(item, user) => item.barberId === user.id && item.date === today} />
}

export function BarberWeek() {
  const week = { start: startOfWeek(new Date(), { weekStartsOn: 1 }), end: endOfWeek(new Date(), { weekStartsOn: 1 }) }
  return <BarberList title="Semana" filter={(item, user) => item.barberId === user.id && ['pending', 'confirmed'].includes(item.status) && isWithinInterval(parseISO(item.date), week)} />
}

export function BarberHistory() {
  return <BarberList title="Historico" filter={(item, user) => item.barberId === user.id && ['completed', 'cancelled'].includes(item.status)} />
}

function BarberList({ title, filter }) {
  const [cancelId, setCancelId] = useState(null)
  const [reason, setReason] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { user } = useAuthStore()
  const { appointments, barbers, updateStatus } = useAppointmentStore()
  const { services, options, categories } = useServiceStore()
  const barberAppointments = useMemo(() => appointments.filter((item) => item.barberId === user?.id), [appointments, user?.id])
  const list = appointments
    .filter((item) => filter(item, user))
    .filter((item) => statusFilter === 'all' || item.status === statusFilter)
    .filter((item) => {
      const service = getService(item.serviceId, services)
      const selected = item.selectedOptionsSnapshot?.length ? item.selectedOptionsSnapshot : calculateDynamicSelection(item.selectedOptionIds || service?.optionIds || [], options).selectedOptions
      const barber = barbers.find((entry) => entry.id === item.barberId)
      const text = `${item.clientName} ${item.date} ${item.time} ${service?.name || ''} ${barber?.name || ''} ${selected.map((option) => option.name).join(' ')}`.toLowerCase()
      return text.includes(search.toLowerCase().trim())
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  return (
    <Page>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Painel do barbeiro</p>
          <h2 className="font-display text-3xl font-bold">{title}</h2>
        </div>
      </div>
      <BarberInsights appointments={barberAppointments} options={options} categories={categories} />
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <Input label="Buscar atendimento" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3">
              <option value="all">Todos</option>
              {APPOINTMENT_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
            </select>
          </label>
        </div>
      </Card>
      <div className="grid gap-4">
        {list.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            barbers={barbers}
            services={services}
            options={options}
            categories={categories}
            actions={appointment.status !== 'completed' && appointment.status !== 'cancelled' ? <>
              <Button size="sm" onClick={() => updateStatus(appointment.id, 'completed')}>Concluir</Button>
              <Button size="sm" variant="danger" onClick={() => setCancelId(appointment.id)}>Cancelar</Button>
            </> : null}
          />
        ))}
      </div>
      <Modal open={Boolean(cancelId)} title="Cancelar agendamento" onClose={() => setCancelId(null)}>
        <textarea className="min-h-28 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 outline-none" placeholder="Motivo obrigatorio" value={reason} onChange={(event) => setReason(event.target.value)} />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setCancelId(null)}>Voltar</Button>
          <Button variant="danger" disabled={reason.trim().length < 3} onClick={() => { updateStatus(cancelId, 'cancelled', reason); setCancelId(null); setReason('') }}>Confirmar</Button>
        </div>
      </Modal>
    </Page>
  )
}

function BarberInsights({ appointments, options, categories }) {
  const metrics = buildFinanceMetrics(appointments, options, categories)
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayAppointments = appointments.filter((item) => item.date === today)
  const completedToday = todayAppointments.filter((item) => item.status === 'completed').length
  const monthRevenue = buildMonthlyRevenue(appointments)
  const weekAppointments = buildWeeklyAppointments(appointments)
  const nextAppointment = appointments
    .filter((item) => ['pending', 'confirmed'].includes(item.status))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))[0]

  return (
    <div className="mb-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <InsightCard label="Hoje" value={money(metrics.dailyRevenue)} detail={`${todayAppointments.length} agendamentos`} icon={CalendarCheck} />
        <InsightCard label="Semana" value={money(metrics.weeklyRevenue)} detail="Receita ativa" icon={TrendingUp} />
        <InsightCard label="Mes" value={money(metrics.monthlyRevenue)} detail={`${metrics.completedCount} concluidos`} icon={Banknote} />
        <InsightCard label="Ticket medio" value={money(metrics.averageTicket)} detail="Por atendimento ativo" icon={Scissors} />
        <InsightCard label="Concluidos hoje" value={completedToday} detail={nextAppointment ? `Proximo ${nextAppointment.time}` : 'Sem proximo horario'} icon={Clock3} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold">Arrecadacao mensal</h3>
              <p className="text-sm text-[var(--text-secondary)]">Ultimos 6 meses considerando atendimentos confirmados e concluidos.</p>
            </div>
            <span className="rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-xs font-semibold text-[var(--accent-text)]">{money(metrics.monthlyRevenue)} neste mes</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => money(value)} />
              <Bar dataKey="revenue" name="Receita" fill="var(--accent-default)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="font-display text-xl font-bold">Agenda da semana</h3>
          <p className="mb-4 text-sm text-[var(--text-secondary)]">Volume diario de atendimentos.</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekAppointments}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" name="Agendamentos" fill="#4d8dff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

function InsightCard({ label, value, detail, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-[var(--accent-subtle)]" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</p>
          <p className="mt-2 text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">{detail}</p>
        </div>
        <Icon className="h-6 w-6 text-[var(--accent-text)]" />
      </div>
    </Card>
  )
}

function buildMonthlyRevenue(appointments) {
  return Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(new Date(), 5 - index)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const revenue = appointments
      .filter((item) => ['confirmed', 'completed'].includes(item.status) && isPaid(item) && isWithinInterval(parseISO(item.date), { start, end }))
      .reduce((sum, item) => sum + Number(item.price || 0), 0)
    return { label: format(date, 'MM/yy'), revenue }
  })
}

function buildWeeklyAppointments(appointments) {
  return Array.from({ length: 7 }, (_, index) => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    const key = format(date, 'yyyy-MM-dd')
    return {
      label: format(date, 'dd/MM'),
      total: appointments.filter((item) => item.date === key && item.status !== 'cancelled').length,
    }
  })
}
