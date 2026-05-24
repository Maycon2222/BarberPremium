import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { Button, Card } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useServiceStore } from '../../store/serviceStore'
import { calculateDynamicSelection, calculatePrice, getPaymentMethod, getPaymentStatus, getService, money } from '../../utils/pricing'

export function Receipt() {
  const { id } = useParams()
  const { appointments, barbers } = useAppointmentStore()
  const { services, options, categories } = useServiceStore()
  const appointment = appointments.find((item) => item.id === id)
  const service = getService(appointment?.serviceId, services)
  const barber = barbers.find((item) => item.id === appointment?.barberId)
  if (!appointment) return <Page>Comprovante nao encontrado.</Page>
  const dynamic = appointment.selectedOptionsSnapshot?.length
    ? { selectedOptions: appointment.selectedOptionsSnapshot, totalPrice: appointment.basePrice || appointment.price, totalMinutes: appointment.estimatedMinutes }
    : calculateDynamicSelection(appointment.selectedOptionIds || service?.optionIds || [], options)
  const priceInfo = appointment.pricingBreakdown
    ? { finalPrice: appointment.price, breakdown: appointment.pricingBreakdown }
    : calculatePrice(dynamic, barber)
  const paymentMethod = getPaymentMethod(appointment.paymentMethod)
  const paymentStatus = getPaymentStatus(appointment.paymentStatus || 'pending')
  const selectedShopServices = appointment.selectedServicesSnapshot || []
  const groupedOptions = dynamic.selectedOptions.reduce((groups, option) => {
    const category = categories.find((item) => item.id === option.categoryId)
    const key = option.categoryId || 'outros'
    const current = groups[key] || { id: key, name: category?.name || 'Outros', options: [] }
    return { ...groups, [key]: { ...current, options: [...current.options, option] } }
  }, {})
  return (
    <Page className="mx-auto max-w-2xl">
      <Card className="text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-[var(--status-completed)]" />
        <h2 className="mt-4 font-display text-3xl font-bold">Agendamento confirmado</h2>
        <p className="mt-2 text-[var(--text-secondary)]">Codigo unico: <span className="font-mono text-[var(--accent-text)]">{appointment.receiptCode}</span></p>
        <div className="mx-auto my-8 max-w-sm rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-subtle)] px-5 py-4">
          <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">Codigo do comprovante</p>
          <p className="mt-2 break-all font-mono text-2xl font-bold text-[var(--accent-text)]">{appointment.receiptCode}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Modo demonstracao: este codigo identifica a reserva, mas nao representa pagamento real.</p>
        </div>
        <div className="grid gap-3 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-4 text-left">
          <p><strong>Servico:</strong> {selectedShopServices.length ? selectedShopServices.map((item) => item.name).join(' + ') : service?.name || 'Atendimento personalizado'}</p>
          <p><strong>Barbeiro:</strong> {barber?.name}</p>
          <p><strong>Quando:</strong> {appointment.date} as {appointment.time}</p>
          <p><strong>Tempo estimado:</strong> {appointment.estimatedMinutes || appointment.totalMinutes || service?.duration || dynamic.totalMinutes || 30} min</p>
          <p><strong>Valor:</strong> {money(priceInfo.finalPrice)}</p>
          <p><strong>Calculo:</strong> {priceInfo.breakdown}</p>
          <p><strong>Pagamento:</strong> {paymentMethod?.name || 'Nao informado'}</p>
          <p><strong>Status do pagamento:</strong> {paymentStatus?.name || 'Pendente'}</p>
          {selectedShopServices.length ? (
            <div>
              <strong>Servicos escolhidos:</strong>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedShopServices.map((item) => <span key={item.id} className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs">{item.name}</span>)}
              </div>
            </div>
          ) : dynamic.selectedOptions.length ? (
            <div>
              <strong>Opcoes escolhidas:</strong>
              <div className="mt-2 grid gap-2">
                {Object.values(groupedOptions).map((group) => (
                  <div key={group.id} className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-3">
                    <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{group.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.options.map((option) => <span key={option.id} className="rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-xs">{option.name}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <Link to="/client/dashboard" className="mt-6 inline-block"><Button>Voltar ao dashboard</Button></Link>
      </Card>
    </Page>
  )
}
