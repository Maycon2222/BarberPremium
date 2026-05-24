import { useMemo, useState } from 'react'
import { Button, Card, Input } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useServiceStore } from '../../store/serviceStore'
import { APPOINTMENT_STATUSES, PAYMENT_STATUSES, calculateDynamicSelection, getAppointmentStatus, getPaymentStatus, getService, money } from '../../utils/pricing'

export function AdminAppointments() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [barberId, setBarberId] = useState('all')
  const [date, setDate] = useState('')
  const [optionId, setOptionId] = useState('all')
  const [paymentStatus, setPaymentStatus] = useState('all')
  const { appointments, barbers, updatePaymentStatus, updateStatus } = useAppointmentStore()
  const { services, options } = useServiceStore()

  const rows = useMemo(() => appointments.map((item) => {
    const service = getService(item.serviceId, services)
    const selected = item.selectedOptionsSnapshot?.length ? item.selectedOptionsSnapshot : calculateDynamicSelection(item.selectedOptionIds || service?.optionIds || [], options).selectedOptions
    const barber = barbers.find((entry) => entry.id === item.barberId)
    const label = service?.name || selected.slice(0, 3).map((entry) => entry.name).join(' + ') || 'Atendimento personalizado'
    const appointmentStatus = getAppointmentStatus(item.status)
    const payment = getPaymentStatus(item.paymentStatus || 'pending')
    const searchable = `${item.clientName} ${item.date} ${item.time} ${barber?.name || ''} ${label} ${selected.map((entry) => entry.name).join(' ')} ${appointmentStatus?.name || item.status} ${payment?.name || item.paymentStatus || ''} ${item.cancelReason || ''}`.toLowerCase()
    return { item, service, selected, barber, label, searchable }
  }).filter((row) => {
    const selectedIds = row.selected.map((entry) => entry.id)
    const matchesSearch = row.searchable.includes(search.toLowerCase().trim())
    const matchesStatus = status === 'all' || row.item.status === status
    const matchesBarber = barberId === 'all' || row.item.barberId === barberId
    const matchesDate = !date || row.item.date === date
    const matchesOption = optionId === 'all' || selectedIds.includes(optionId)
    const matchesPayment = paymentStatus === 'all' || (row.item.paymentStatus || 'pending') === paymentStatus
    return matchesSearch && matchesStatus && matchesBarber && matchesDate && matchesOption && matchesPayment
  }), [appointments, barbers, barberId, date, optionId, options, paymentStatus, search, services, status])

  const rowMetrics = {
    total: rows.length,
    paid: rows.filter((row) => row.item.paymentStatus === 'paid').length,
    pending: rows.filter((row) => (row.item.paymentStatus || 'pending') === 'pending').length,
    cancelled: rows.filter((row) => row.item.status === 'cancelled').length,
  }

  const clearFilters = () => {
    setSearch('')
    setStatus('all')
    setBarberId('all')
    setDate('')
    setOptionId('all')
    setPaymentStatus('all')
  }

  return (
    <Page>
      <h2 className="mb-6 font-display text-3xl font-bold">Agendamentos</h2>
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_180px_180px_180px_220px_160px]">
          <Input label="Buscar" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label><span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Status</span><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3"><option value="all">Todos</option>{APPOINTMENT_STATUSES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
          <label><span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Barbeiro</span><select value={barberId} onChange={(event) => setBarberId(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3"><option value="all">Todos</option>{barbers.map((barber) => <option key={barber.id} value={barber.id}>{barber.name}</option>)}</select></label>
          <Input label="Data" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <label><span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Opcao escolhida</span><select value={optionId} onChange={(event) => setOptionId(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3"><option value="all">Todas</option>{options.filter((option) => option.active !== false).sort((a, b) => a.name.localeCompare(b.name)).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
          <label><span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Pagamento</span><select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3"><option value="all">Todos</option>{PAYMENT_STATUSES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
        </div>
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" onClick={clearFilters}>Limpar filtros</Button>
        </div>
      </Card>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniMetric label="Filtrados" value={rowMetrics.total} />
        <MiniMetric label="Pagos" value={rowMetrics.paid} />
        <MiniMetric label="Pendentes" value={rowMetrics.pending} />
        <MiniMetric label="Cancelados" value={rowMetrics.cancelled} />
      </div>
      <div className="grid gap-3 lg:hidden">
        {rows.map(({ item, selected, barber, label }) => {
          const detail = selected.length ? selected.map((entry) => entry.name).join(', ') : 'Sem opcoes vinculadas'
          return (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{item.clientName}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.date} as {item.time}</p>
                </div>
                <p className="shrink-0 font-bold text-[var(--accent-text)]">{money(item.price || 0)}</p>
              </div>
              <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3">
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{detail}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Barbeiro: {barber?.name || '-'}</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Pagamento</span>
                  <select value={item.paymentStatus || 'pending'} onChange={(event) => updatePaymentStatus(item.id, event.target.value)} className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-sm">{PAYMENT_STATUSES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Status</span>
                  <select value={item.status || 'pending'} onChange={(event) => updateStatus(item.id, event.target.value, item.cancelReason || '')} className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-sm">{APPOINTMENT_STATUSES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select>
                </label>
              </div>
              {item.status === 'cancelled' ? (
                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Motivo do cancelamento</span>
                  <input value={item.cancelReason || ''} onChange={(event) => updateStatus(item.id, 'cancelled', event.target.value)} className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-sm outline-none" />
                </label>
              ) : null}
            </Card>
          )
        })}
      </div>
      <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] lg:block">
        <table className="w-full min-w-[1080px] bg-[var(--bg-surface)] text-sm">
          <thead className="bg-[var(--bg-subtle)] text-left"><tr><th className="p-3">Cliente</th><th>Servico</th><th>Barbeiro</th><th>Data</th><th>Valor</th><th>Pagamento</th><th>Status</th><th>Motivo</th></tr></thead>
          <tbody>{rows.map(({ item, selected, barber, label }) => {
            const detail = selected.length ? selected.map((entry) => entry.name).join(', ') : 'Sem opcoes vinculadas'
            return <tr key={item.id} className="border-t border-[var(--border-default)]"><td className="p-3">{item.clientName}</td><td><div className="font-semibold">{label}</div><div className="max-w-[320px] truncate text-xs text-[var(--text-secondary)]">{detail}</div></td><td>{barber?.name || '-'}</td><td>{item.date} {item.time}</td><td>{money(item.price || 0)}</td><td><label className="sr-only" htmlFor={`payment-${item.id}`}>Status do pagamento</label><select id={`payment-${item.id}`} value={item.paymentStatus || 'pending'} onChange={(event) => updatePaymentStatus(item.id, event.target.value)} className="h-9 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-xs">{PAYMENT_STATUSES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></td><td><label className="sr-only" htmlFor={`appointment-${item.id}`}>Status do atendimento</label><select id={`appointment-${item.id}`} value={item.status || 'pending'} onChange={(event) => updateStatus(item.id, event.target.value, item.cancelReason || '')} className="h-9 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-xs">{APPOINTMENT_STATUSES.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></td><td>{item.status === 'cancelled' ? <><label className="sr-only" htmlFor={`cancel-reason-${item.id}`}>Motivo do cancelamento</label><input id={`cancel-reason-${item.id}`} value={item.cancelReason || ''} onChange={(event) => updateStatus(item.id, 'cancelled', event.target.value)} className="h-9 w-56 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-xs outline-none" /></> : <span className="text-xs text-[var(--text-secondary)]">-</span>}</td></tr>
          })}</tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">Exibindo {rows.length} registros filtrados.</p>
    </Page>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  )
}
