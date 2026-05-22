import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Banknote, CalendarCheck, Clock3, CreditCard, Scissors, TrendingUp, Users, WalletCards, XCircle } from 'lucide-react'
import { Card } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { StatCard } from '../../components/shared/StatCard'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useServiceStore } from '../../store/serviceStore'
import { buildFinanceMetrics, filterAppointmentsByPeriod } from '../../utils/finance'
import { money } from '../../utils/pricing'

export function AdminDashboard() {
  const [period, setPeriod] = useState('month')
  const { appointments } = useAppointmentStore()
  const { options, categories } = useServiceStore()
  const filteredAppointments = useMemo(() => filterAppointmentsByPeriod(appointments, period), [appointments, period])
  const metrics = buildFinanceMetrics(filteredAppointments, options, categories)

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Financeiro</p>
          <h2 className="font-display text-3xl font-bold">Dashboard financeiro</h2>
        </div>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Periodo</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-12 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3">
            <option value="today">Hoje</option>
            <option value="week">Semana atual</option>
            <option value="month">Mes atual</option>
            <option value="all">Todos</option>
          </select>
        </label>
      </div>

      <motion.div variants={{ animate: { transition: { staggerChildren: 0.06 } } }} initial="initial" animate="animate" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento total" value={money(metrics.totalRevenue)} icon={TrendingUp} />
        <StatCard label="Faturamento diario" value={money(metrics.dailyRevenue)} icon={CalendarCheck} />
        <StatCard label="Faturamento semanal" value={money(metrics.weeklyRevenue)} icon={WalletCards} />
        <StatCard label="Faturamento mensal" value={money(metrics.monthlyRevenue)} icon={Banknote} />
        <StatCard label="Agendamentos pagos" value={money(metrics.paidRevenue)} icon={CreditCard} />
        <StatCard label="Cortes confirmados" value={money(metrics.confirmedRevenue)} icon={Scissors} />
        <StatCard label="Valores pendentes" value={money(metrics.pendingRevenue)} icon={Clock3} tone="text-[var(--status-pending)]" />
        <StatCard label="Valores cancelados" value={money(metrics.cancelledRevenue)} icon={XCircle} tone="text-[var(--status-cancelled)]" />
        <StatCard label="Capital final" value={money(metrics.finalCapital)} icon={Banknote} />
        <StatCard label="Agendamentos" value={metrics.appointmentCount} icon={CalendarCheck} />
        <StatCard label="Cortes concluidos" value={metrics.completedCount} icon={Scissors} />
        <StatCard label="Ticket medio" value={money(metrics.averageTicket)} icon={TrendingUp} />
        <StatCard label="Cancelamento" value={`${Math.round(metrics.cancellationRate)}%`} icon={Users} tone="text-[var(--status-cancelled)]" />
      </motion.div>

      <div className="grid gap-4 xl:grid-cols-4">
        <RankCard title="Servicos mais escolhidos" rows={metrics.topOptions} />
        <RankCard title="Categorias lucrativas" rows={metrics.topCategories} />
        <RankCard title="Clientes recorrentes" rows={metrics.topClients} />
        <RankCard title="Horarios lucrativos" rows={metrics.topHours} />
      </div>
    </Page>
  )
}

function RankCard({ title, rows }) {
  return (
    <Card>
      <h3 className="mb-4 font-display text-xl font-bold">{title}</h3>
      <div className="space-y-3">
        {rows.slice(0, 5).map((row) => (
          <div key={row.id} className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{row.name}</p>
              <span className="text-sm text-[var(--accent-text)]">{row.count}x</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{money(row.revenue)}</p>
          </div>
        ))}
        {!rows.length ? <p className="text-sm text-[var(--text-secondary)]">Sem dados ainda.</p> : null}
      </div>
    </Card>
  )
}
