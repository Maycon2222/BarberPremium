import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useServiceStore } from '../../store/serviceStore'
import { buildFinanceMetrics, filterAppointmentsByPeriod } from '../../utils/finance'
import { money } from '../../utils/pricing'

const palette = ['#c9962a', '#4d8dff', '#36b37e', '#e25555', '#f3b43f', '#9b7cff']

export function AdminReports() {
  const [period, setPeriod] = useState('all')
  const { appointments } = useAppointmentStore()
  const { options, categories } = useServiceStore()
  const filteredAppointments = useMemo(() => filterAppointmentsByPeriod(appointments, period), [appointments, period])
  const metrics = buildFinanceMetrics(filteredAppointments, options, categories)

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Relatorios</p>
          <h2 className="font-display text-3xl font-bold">Analise financeira</h2>
        </div>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Periodo</span>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-12 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3">
            <option value="all">Todos</option>
            <option value="today">Hoje</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Faturamento" value={money(metrics.totalRevenue)} />
        <SummaryCard label="Pago" value={money(metrics.paidRevenue)} />
        <SummaryCard label="Pendente" value={money(metrics.pendingRevenue)} tone="text-[var(--status-pending)]" />
        <SummaryCard label="Cancelado" value={money(metrics.cancelledRevenue)} tone="text-[var(--status-cancelled)]" />
        <SummaryCard label="Ticket medio" value={money(metrics.averageTicket)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-2xl font-bold">Faturamento por dia</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={metrics.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => name === 'revenue' ? money(value) : value} />
              <Bar dataKey="revenue" name="Faturamento" fill="var(--accent-default)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-2xl font-bold">Receita por status</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={metrics.statusRevenue} dataKey="value" nameKey="name" outerRadius={110} label>
                {metrics.statusRevenue.map((_, index) => <Cell key={index} fill={palette[index % palette.length]} />)}
              </Pie>
              <Tooltip formatter={(value) => money(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RankTable title="Servicos mais escolhidos" rows={metrics.topOptions} />
        <RankTable title="Categorias mais lucrativas" rows={metrics.topCategories} />
        <RankTable title="Clientes que mais agendaram" rows={metrics.topClients} />
        <RankTable title="Horarios mais lucrativos" rows={metrics.topHours} />
      </div>
    </Page>
  )
}

function SummaryCard({ label, value, tone = 'text-[var(--accent-text)]' }) {
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tone}`}>{value}</p>
    </Card>
  )
}

function RankTable({ title, rows }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--border-default)] p-4">
        <h3 className="font-display text-xl font-bold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-[var(--bg-subtle)] text-left text-[var(--text-secondary)]">
            <tr><th className="p-3">Nome</th><th>Quantidade</th><th>Receita</th></tr>
          </thead>
          <tbody>
            {rows.slice(0, 8).map((row) => (
              <tr key={row.id} className="border-t border-[var(--border-default)]">
                <td className="p-3 font-semibold">{row.name}</td>
                <td>{row.count}</td>
                <td>{money(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
