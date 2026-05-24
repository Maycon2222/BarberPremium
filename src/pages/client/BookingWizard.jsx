import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { addDays, format } from 'date-fns'
import { Building2, CalendarDays, Check, CreditCard, MapPin, Scissors, User } from 'lucide-react'
import { Avatar, Button, Card, Input } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { appointmentSchema } from '../../schemas/appointmentSchema'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useAuthStore } from '../../store/authStore'
import { useShopStore } from '../../store/shopStore'
import { useToastStore } from '../../store/toastStore'
import { availableTimes, isSlotUnavailable, isWorkingDay } from '../../utils/businessRules'
import { formatPhoneBR } from '../../utils/br'
import { PAYMENT_METHODS, getPaymentStatusForMethod, getPricingModelLabel, money } from '../../utils/pricing'

const steps = ['Barbearia', 'Barbeiro', 'Horario', 'Servico', 'Confirmacao']

export function BookingWizard() {
  const [searchParams] = useSearchParams()
  const preselectedShopId = searchParams.get('shopId') || ''
  const preselectedBarberId = searchParams.get('barberId') || ''
  const initialStep = preselectedBarberId ? 2 : preselectedShopId ? 1 : 0
  const [step, setStep] = useState(initialStep)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { shops } = useShopStore()
  const { appointments, barbers, createAppointment, settings } = useAppointmentStore()
  const { notify } = useToastStore()
  const dates = useMemo(() => Array.from({ length: 10 }, (_, index) => format(addDays(new Date(), index), 'yyyy-MM-dd')), [])
  const defaultDate = useMemo(() => dates.find((day) => isWorkingDay(day)) || dates[0], [dates])
  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    mode: 'onChange',
    defaultValues: {
      clientName: user?.name || '',
      clientPhone: user?.phone || '',
      clientEmail: user?.email || '',
      serviceId: 'shop-services',
      selectedServiceIds: [],
      barberId: preselectedBarberId,
      shopId: preselectedShopId,
      date: defaultDate,
      time: '',
      paymentMethod: 'pix',
    },
  })

  const selectedBarber = barbers.find((barber) => barber.id === form.watch('barberId'))
  const selectedShop = shops.find((shop) => shop.id === (form.watch('shopId') || selectedBarber?.shopId || preselectedShopId))
  const scheduleSettings = selectedShop ? toBusinessSettings(selectedShop.settings) : settings
  const selectedServiceIds = form.watch('selectedServiceIds') || []
  const availableServices = useMemo(() => {
    if (!selectedShop) return []
    const shopServices = (selectedShop.services || []).filter((service) => service.active)
    if (!selectedBarber?.offeredServiceIds?.length) return shopServices
    return shopServices.filter((service) => selectedBarber.offeredServiceIds.includes(service.id))
  }, [selectedBarber, selectedShop])
  const selectedServices = availableServices.filter((service) => selectedServiceIds.includes(service.id))
  const totalPrice = selectedServices.reduce((sum, service) => sum + getServicePrice(service, selectedBarber), 0)
  const totalMinutes = selectedServices.reduce((sum, service) => sum + Number(service.estimatedMinutes || 0), 0)

  useEffect(() => {
    if (!preselectedShopId && !preselectedBarberId) {
      navigate('/explore', { replace: true })
    }
  }, [preselectedShopId, preselectedBarberId, navigate])

  useEffect(() => {
    if (!form.getValues('shopId') && selectedBarber?.shopId) {
      form.setValue('shopId', selectedBarber.shopId, { shouldValidate: true })
    }
  }, [form, selectedBarber])

  if (!preselectedShopId && !preselectedBarberId) return null

  const next = async () => {
    if (step === 0 && !form.watch('shopId')) {
      notify({ type: 'error', title: 'Escolha a barbearia', message: 'Selecione uma barbearia para continuar.' })
      return
    }
    const fields = step === 0 ? ['shopId'] : step === 1 ? ['barberId'] : step === 2 ? ['date', 'time'] : step === 3 ? ['selectedServiceIds'] : ['clientName', 'clientPhone', 'clientEmail', 'paymentMethod']
    const valid = await form.trigger(fields)
    if (valid) setStep((value) => Math.min(value + 1, steps.length - 1))
  }

  const submit = form.handleSubmit((data) => {
    const shopId = data.shopId || preselectedShopId || selectedBarber?.shopId
    if (!shopId) {
      notify({ type: 'error', title: 'Erro', message: 'Barbearia nao identificada. Volte ao explorar.' })
      navigate('/explore', { replace: true })
      return
    }
    try {
      const appointment = createAppointment({
        ...data,
        serviceId: 'shop-services',
        serviceIds: data.selectedServiceIds,
        selectedServiceIds: data.selectedServiceIds,
        selectedServicesSnapshot: selectedServices.map((service) => ({
          ...service,
          price: getServicePrice(service, selectedBarber),
        })),
        selectedOptionIds: [],
        selectedOptionsSnapshot: [],
        shopId,
        clientId: user?.id || 'guest',
        clientEmail: user?.email || data.clientEmail,
        clientName: user?.name || data.clientName,
        clientPhone: user?.phone || data.clientPhone,
        price: totalPrice,
        totalPrice,
        basePrice: totalPrice,
        estimatedMinutes: totalMinutes,
        totalMinutes,
        pricingModel: selectedBarber?.pricingModel || 'fixed',
        pricingBreakdown: `Servicos da barbearia: ${money(totalPrice)}`,
        paymentStatus: getPaymentStatusForMethod(data.paymentMethod),
      })
      notify({ type: 'success', title: 'Confirmado', message: 'Comprovante gerado.' })
      navigate(`/client/booking/${appointment.id}`)
    } catch (error) {
      notify({ type: 'error', title: 'Nao foi possivel agendar', message: error.message })
    }
  })

  return (
    <Page className="mx-auto max-w-6xl">
      <div className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Agendamento</p>
            <h2 className="font-display text-3xl font-bold">Escolha seu atendimento</h2>
          </div>
          <LiveSummary totalPrice={totalPrice} totalMinutes={totalMinutes} />
        </div>
        <div className="mt-5 h-2 rounded-full bg-[var(--bg-subtle)]">
          <motion.div className="h-2 rounded-full bg-[var(--accent-default)]" animate={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {steps.map((label, index) => (
            <div key={label} className={`rounded-[var(--radius-md)] border px-3 py-2 text-xs font-semibold ${index <= step ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)] text-[var(--accent-text)]' : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'}`}>
              {index + 1}. {label}
            </div>
          ))}
        </div>
      </div>
      <Card>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={{ duration: 0.24 }}>
            {step === 0 && <ShopStep shops={shops} barbers={barbers} selected={form.watch('shopId')} select={(id) => { form.setValue('shopId', id, { shouldValidate: true }); form.setValue('barberId', '', { shouldValidate: true }); form.setValue('time', '', { shouldValidate: true }); form.setValue('selectedServiceIds', [], { shouldValidate: true }) }} />}
            {step === 1 && <BarberStep barbers={barbers.filter((barber) => barber.shopId === form.watch('shopId'))} selected={form.watch('barberId')} select={(id) => { const barber = barbers.find((item) => item.id === id); form.setValue('barberId', id, { shouldValidate: true }); form.setValue('shopId', barber?.shopId || form.watch('shopId'), { shouldValidate: true }); form.setValue('time', '', { shouldValidate: true }); form.setValue('selectedServiceIds', [], { shouldValidate: true }) }} />}
            {step === 2 && <TimeStep dates={dates} times={availableTimes(scheduleSettings)} form={form} appointments={appointments} />}
            {step === 3 && <ServiceStep form={form} selectedBarber={selectedBarber} availableServices={availableServices} getPrice={(service) => getServicePrice(service, selectedBarber)} totalPrice={totalPrice} totalMinutes={totalMinutes} />}
            {step === 4 && <ConfirmStep form={form} selectedServices={selectedServices} selectedBarber={selectedBarber} selectedShop={selectedShop} totalPrice={totalPrice} totalMinutes={totalMinutes} />}
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Voltar</Button>
          {step < steps.length - 1 ? <Button onClick={next}>Continuar</Button> : <Button onClick={submit}><Check className="h-4 w-4" /> Confirmar</Button>}
        </div>
      </Card>
    </Page>
  )
}

function LiveSummary({ totalPrice, totalMinutes }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-right">
      <p className="text-sm text-[var(--text-secondary)]">Total parcial</p>
      <p className="text-xl font-bold text-[var(--accent-text)]">{money(totalPrice)} <span className="text-sm font-medium text-[var(--text-secondary)]">/ {totalMinutes} min</span></p>
    </div>
  )
}

function ShopStep({ shops, barbers, selected, select }) {
  const activeShops = shops.filter((shop) => shop.active)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {activeShops.map((shop) => {
        const shopBarbers = barbers.filter((barber) => barber.active && barber.shopId === shop.id)
        const start = formatBusinessHour(shop.settings?.workingHours?.start || '08:00')
        const end = formatBusinessHour(shop.settings?.workingHours?.end || '19:00')
        return (
          <button key={shop.id} type="button" onClick={() => select(shop.id)} className={`overflow-hidden rounded-[var(--radius-lg)] border text-left transition ${selected === shop.id ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : 'border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--accent-default)]'}`}>
            <div className="h-36 bg-[var(--bg-subtle)]">
              {shop.coverImage ? <img src={shop.coverImage} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Building2 className="h-10 w-10 text-[var(--text-secondary)]" /></div>}
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl font-bold">{shop.name}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{shop.description}</p>
                </div>
                {selected === shop.id ? <span className="rounded-full bg-[var(--accent-default)] p-1 text-[var(--bg-default)]"><Check className="h-4 w-4" /></span> : null}
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[var(--text-secondary)]">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {shop.address}</p>
                <p className="flex items-center gap-2"><Scissors className="h-4 w-4" /> {shopBarbers.length} barbeiro{shopBarbers.length === 1 ? '' : 's'} disponiveis</p>
                <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {start} as {end}</p>
              </div>
            </div>
          </button>
        )
      })}
      {!activeShops.length ? <EmptyState>Nenhuma barbearia ativa no momento.</EmptyState> : null}
    </div>
  )
}

function BarberStep({ barbers, selected, select }) {
  const list = barbers.filter((barber) => barber.active)
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((barber) => (
          <button key={barber.id} type="button" onClick={() => select(barber.id)} className={`rounded-[var(--radius-md)] border p-5 text-left transition ${selected === barber.id ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : 'border-[var(--border-default)] bg-[var(--bg-elevated)]'}`}>
            <Avatar name={barber.name} size="lg" />
            <p className="mt-4 font-semibold">{barber.name}</p>
            <p className="text-sm text-[var(--text-secondary)]">{barber.offeredServiceIds?.length || 0} servicos cadastrados</p>
            <span className="mt-3 inline-flex rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-xs font-semibold text-[var(--accent-text)]">{getPricingModelLabel(barber.pricingModel)}</span>
          </button>
        ))}
      </div>
      {!list.length ? <EmptyState>Esta barbearia ainda nao tem barbeiros ativos.</EmptyState> : null}
    </>
  )
}

function TimeStep({ dates, times, form, appointments }) {
  const barberId = form.watch('barberId')
  const date = form.watch('date')
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="grid gap-2">
        {dates.map((day) => {
          const hasAvailableSlot = times.some((slot) => !isSlotUnavailable(appointments, barberId, day, slot))
          const disabled = !isWorkingDay(day) || (barberId ? !hasAvailableSlot : false)
          return (
            <button key={day} type="button" disabled={disabled} onClick={() => form.setValue('date', day, { shouldValidate: true })} className={`rounded-[var(--radius-md)] border px-3 py-2 text-left disabled:cursor-not-allowed disabled:opacity-45 ${date === day ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : 'border-[var(--border-default)] bg-[var(--bg-elevated)]'}`}>
              <CalendarDays className="mr-2 inline h-4 w-4" />{day}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {times.map((time) => {
          const disabled = barberId ? isSlotUnavailable(appointments, barberId, date, time) : false
          return <button key={time} type="button" disabled={disabled} onClick={() => form.setValue('time', time, { shouldValidate: true })} className={`rounded-[var(--radius-md)] border px-3 py-3 text-sm ${form.watch('time') === time ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : 'border-[var(--border-default)] bg-[var(--bg-elevated)]'} disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through`}>{time}</button>
        })}
      </div>
    </div>
  )
}

function ServiceStep({ form, selectedBarber, availableServices, getPrice, totalPrice, totalMinutes }) {
  const [serviceSearch, setServiceSearch] = useState('')
  const selectedServiceIds = form.watch('selectedServiceIds') || []
  const visibleServices = availableServices.filter((service) => `${service.name} ${service.description || ''}`.toLowerCase().includes(serviceSearch.toLowerCase().trim()))
  const toggleService = (serviceId) => {
    const next = selectedServiceIds.includes(serviceId) ? selectedServiceIds.filter((id) => id !== serviceId) : [...selectedServiceIds, serviceId]
    form.setValue('selectedServiceIds', next, { shouldValidate: true })
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[var(--radius-lg)] border border-[var(--accent-default)] bg-[var(--accent-subtle)] p-4">
        <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">{selectedBarber?.name || 'Barbeiro selecionado'}</p>
        <p className="mt-1 text-2xl font-bold">{money(totalPrice)}</p>
        <p className="text-sm text-[var(--text-secondary)]">{totalMinutes} min estimados</p>
      </div>
      <Input label="Buscar servico" value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} />
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {visibleServices.map((service) => {
          const selected = selectedServiceIds.includes(service.id)
          return (
            <button key={service.id} type="button" onClick={() => toggleService(service.id)} className={`rounded-[var(--radius-md)] border p-4 text-left transition ${selected ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : 'border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--accent-default)]'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{service.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{service.description}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{service.estimatedMinutes} min</p>
                </div>
                <p className="font-bold text-[var(--accent-text)]">{money(getPrice(service))}</p>
              </div>
            </button>
          )
        })}
      </div>
      {!visibleServices.length ? <EmptyState>Este barbeiro ainda nao tem servicos vinculados.</EmptyState> : null}
    </div>
  )
}

function ConfirmStep({ form, selectedServices, selectedBarber, selectedShop, totalPrice, totalMinutes }) {
  const { register, setValue, formState: { errors } } = form
  const date = form.watch('date')
  const time = form.watch('time')
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="Nome" prefix={<User className="h-4 w-4" />} {...register('clientName')} error={errors.clientName?.message} />
      <Input label="Telefone" prefix={<User className="h-4 w-4" />} {...register('clientPhone', { onChange: (event) => setValue('clientPhone', formatPhoneBR(event.target.value), { shouldValidate: true }) })} error={errors.clientPhone?.message} />
      <Input label="E-mail" {...register('clientEmail')} error={errors.clientEmail?.message} />
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Pagamento</span>
        <select className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3" {...register('paymentMethod')}>
          {PAYMENT_METHODS.filter((method) => method.active).map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
        </select>
      </label>
      <div className="md:col-span-2 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-4">
        <CreditCard className="mb-2 h-5 w-5 text-[var(--accent-default)]" />
        <p className="font-semibold">Total: {money(totalPrice)} em {totalMinutes} min</p>
        {selectedShop ? <p className="mt-1 text-sm text-[var(--text-secondary)]">Barbearia: {selectedShop.name}</p> : null}
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Com {selectedBarber?.name || 'barbeiro selecionado'} em {date} as {time}</p>
        <p className="text-sm text-[var(--text-secondary)]">Modo demonstracao: pagamentos nao sao processados. PIX e cartao entram como pagos na simulacao.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedServices.map((service) => <span key={service.id} className="rounded-full bg-[var(--bg-elevated)] px-3 py-1 text-xs">{service.name}</span>)}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ children }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-center text-sm text-[var(--text-secondary)] md:col-span-2">
      {children}
    </div>
  )
}

function getServicePrice(service, barber) {
  return Number(barber?.customPrices?.[service.id] ?? service.price ?? 0)
}

function toBusinessSettings(shopSettings) {
  return {
    start: shopSettings?.workingHours?.start || '08:00',
    end: shopSettings?.workingHours?.end || '19:00',
    interval: shopSettings?.slotInterval || 30,
  }
}

function formatBusinessHour(value) {
  if (typeof value === 'number') return `${String(value).padStart(2, '0')}:00`
  return String(value || '')
}
