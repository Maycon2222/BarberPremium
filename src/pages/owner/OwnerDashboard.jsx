import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, CalendarCheck, Scissors, Star } from 'lucide-react'
import { Card } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { StatCard } from '../../components/shared/StatCard'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useAuthStore } from '../../store/authStore'
import { useShopStore } from '../../store/shopStore'
import { money } from '../../utils/pricing'

export function OwnerDashboard() {
  const { user } = useAuthStore()
  const { shops } = useShopStore()
  const { appointments, barbers } = useAppointmentStore()
  const shop = shops.find((item) => item.id === user?.shopId)
  const shopAppointments = appointments.filter((item) => item.shopId === shop?.id)
  const activeAppointments = shopAppointments.filter((item) => item.status !== 'cancelled')
  const completed = shopAppointments.filter((item) => item.status === 'completed')
  const revenue = activeAppointments.reduce((sum, item) => sum + Number(item.price || item.totalPrice || 0), 0)
  const averageTicket = activeAppointments.length ? revenue / activeAppointments.length : 0
  const cancelRate = shopAppointments.length ? Math.round((shopAppointments.filter((item) => item.status === 'cancelled').length / shopAppointments.length) * 100) : 0
  const barberRows = barbers
    .filter((barber) => barber.shopId === shop?.id)
    .map((barber) => {
      const barberAppointments = shopAppointments.filter((item) => item.barberId === barber.id)
      const barberRevenue = barberAppointments.filter((item) => item.status !== 'cancelled').reduce((sum, item) => sum + Number(item.price || item.totalPrice || 0), 0)
      const goal = barber.goals?.monthlyRevenue || 1
      return { barber, appointments: barberAppointments.length, revenue: barberRevenue, progress: Math.round((barberRevenue / goal) * 100) }
    })
  const chart = barberRows.map((row) => ({ name: row.barber.name.split(' ')[0], revenue: row.revenue }))

  if (!shop) {
    return (
      <Page>
        <Card>
          <h2 className="font-display text-2xl font-bold">Nenhuma barbearia vinculada</h2>
          <p className="mt-2 text-[var(--text-secondary)]">Cadastre uma barbearia para acessar o painel owner.</p>
          <Link to="/cadastro/barbearia" className="mt-4 inline-block text-sm font-semibold text-[var(--accent-text)]">Cadastrar barbearia</Link>
        </Card>
      </Page>
    )
  }

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Owner dashboard</p>
          <h2 className="font-display text-3xl font-bold">{shop.name}</h2>
          <p className="text-[var(--text-secondary)]">{shop.address}</p>
        </div>
        <Link to={`/shop/${shop.slug}`} className="text-sm font-semibold text-[var(--accent-text)]">Ver pagina publica</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Faturamento" value={money(revenue)} icon={Banknote} />
        <StatCard label="Agendamentos" value={shopAppointments.length} icon={CalendarCheck} />
        <StatCard label="Ticket medio" value={money(averageTicket)} icon={Scissors} />
        <StatCard label="Cancelamento" value={`${cancelRate}%`} icon={CalendarCheck} />
        <StatCard label="Avaliacao media" value="4.8" icon={Star} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <h3 className="mb-4 font-display text-xl font-bold">Faturamento por barbeiro</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => money(value)} />
              <Bar dataKey="revenue" fill="var(--accent-default)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="mb-4 font-display text-xl font-bold">Ranking de rendimento</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[var(--text-secondary)]"><tr><th className="p-2">Nome</th><th>Agend.</th><th>Faturamento</th><th>Meta</th><th>Status</th></tr></thead>
              <tbody>
                {barberRows.map((row) => (
                  <tr key={row.barber.id} className="border-t border-[var(--border-default)]">
                    <td className="p-2 font-semibold">{row.barber.name}</td>
                    <td>{row.appointments}</td>
                    <td>{money(row.revenue)}</td>
                    <td>{row.progress}%</td>
                    <td><span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.progress >= 90 ? 'bg-green-500/15 text-green-400' : row.progress >= 70 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-red-500/15 text-red-400'}`}>{row.progress >= 90 ? 'No prazo' : row.progress >= 70 ? 'Atencao' : 'Atrasado'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Page>
  )
}
