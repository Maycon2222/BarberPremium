import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { addDays, format } from 'date-fns'
import { CalendarDays, Check, CreditCard, Scissors, User } from 'lucide-react'
import { Avatar, Button, Card, Input } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { appointmentSchema } from '../../schemas/appointmentSchema'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useAuthStore } from '../../store/authStore'
import { useServiceStore } from '../../store/serviceStore'
import { useToastStore } from '../../store/toastStore'
import { availableTimes, isSlotUnavailable, isWorkingDay } from '../../utils/businessRules'
import { formatPhoneBR } from '../../utils/br'
import { PAYMENT_METHODS, calculateDynamicSelection, calculatePrice, findSelectionConflicts, getActiveCategories, getActiveOptionsByCategory, getCompatibilityBlock, getPaymentStatusForMethod, getPricingModelLabel, money } from '../../utils/pricing'

const steps = ['Barbeiro', 'Horario', 'Servico', 'Confirmacao']

export function BookingWizard() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { categories, options } = useServiceStore()
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
      serviceId: 'custom-dynamic',
      selectedOptionIds: [],
      barberId: '',
      date: defaultDate,
      time: '',
      paymentMethod: 'pix',
    },
  })
  const selectedOptionIds = form.watch('selectedOptionIds') || []
  const totals = calculateDynamicSelection(selectedOptionIds, options)
  const selectedBarber = barbers.find((barber) => barber.id === form.watch('barberId'))
  const priceInfo = calculatePrice(totals, selectedBarber)
  const requiredCategoryIds = getActiveCategories(categories).filter((category) => category.required).map((category) => category.id)
  const missingRequired = requiredCategoryIds.filter((categoryId) => !totals.selectedOptions.some((option) => option.categoryId === categoryId))
  const selectionConflicts = findSelectionConflicts(selectedOptionIds, options)
  const unsupportedOptions = getUnsupportedOptions(selectedOptionIds, selectedBarber, options)

  const next = async () => {
    const fields = step === 0 ? ['barberId'] : step === 1 ? ['date', 'time'] : step === 2 ? ['selectedOptionIds'] : ['clientName', 'clientPhone', 'clientEmail', 'paymentMethod']
    const valid = await form.trigger(fields)
    if (step === 2 && missingRequired.length) {
      notify({ type: 'error', title: 'Escolha incompleta', message: 'Selecione uma opcao nas categorias obrigatorias.' })
      return
    }
    if (step === 2 && selectionConflicts.length) {
      notify({ type: 'error', title: 'Opcao incompativel', message: selectionConflicts[0].message })
      return
    }
    if (step === 2 && unsupportedOptions.length) {
      notify({ type: 'error', title: 'Especialidade indisponivel', message: `${selectedBarber?.name} nao oferece ${unsupportedOptions[0].name}.` })
      return
    }
    if (valid) setStep((value) => Math.min(value + 1, steps.length - 1))
  }

  const submit = form.handleSubmit((data) => {
    if (missingRequired.length) {
      notify({ type: 'error', title: 'Escolha incompleta', message: 'Selecione uma opcao nas categorias obrigatorias.' })
      return
    }
    try {
      const appointment = createAppointment({
        ...data,
        serviceId: 'custom-dynamic',
        clientId: user?.id || 'guest',
        price: priceInfo.finalPrice,
        pricingModel: selectedBarber?.pricingModel || 'fixed',
        pricingBreakdown: priceInfo.breakdown,
        basePrice: totals.totalPrice,
        estimatedMinutes: totals.totalMinutes,
        selectedOptionIds,
        selectedOptionsSnapshot: totals.selectedOptions,
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
            <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Agendamento dinamico</p>
            <h2 className="font-display text-3xl font-bold">Monte seu atendimento</h2>
          </div>
          <LiveSummary totals={totals} priceInfo={priceInfo} />
        </div>
        <div className="mt-5 h-2 rounded-full bg-[var(--bg-subtle)]">
          <motion.div className="h-2 rounded-full bg-[var(--accent-default)]" animate={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
            {step === 0 && <BarberStep barbers={barbers} options={options} selected={form.watch('barberId')} select={(id) => form.setValue('barberId', id, { shouldValidate: true })} />}
            {step === 1 && <TimeStep dates={dates} times={availableTimes(settings)} form={form} appointments={appointments} />}
            {step === 2 && <DynamicServiceStep form={form} categories={categories} options={options} selectedBarber={selectedBarber} missingRequired={missingRequired} selectionConflicts={selectionConflicts} priceInfo={priceInfo} />}
            {step === 3 && <ConfirmStep form={form} totals={totals} categories={categories} selectedBarber={selectedBarber} priceInfo={priceInfo} />}
          </motion.div>
        </AnimatePresence>
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Voltar</Button>
          {step < 3 ? <Button onClick={next}>Continuar</Button> : <Button onClick={submit}><Check className="h-4 w-4" /> Confirmar</Button>}
        </div>
      </Card>
    </Page>
  )
}

function LiveSummary({ totals, priceInfo }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-right">
      <p className="text-sm text-[var(--text-secondary)]">Total parcial</p>
      <p className="text-xl font-bold text-[var(--accent-text)]">{money(priceInfo.finalPrice)} <span className="text-sm font-medium text-[var(--text-secondary)]">/ {totals.totalMinutes} min</span></p>
      <p className="mt-1 max-w-xs text-xs text-[var(--text-secondary)]">{priceInfo.breakdown}</p>
    </div>
  )
}

function BarberStep({ barbers, options, selected, select }) {
  const list = barbers.filter((barber) => barber.active)
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {list.map((barber) => {
        const specialtyNames = (barber.specialtyOptionIds || [])
          .map((id) => options.find((option) => option.id === id)?.name)
          .filter(Boolean)
          .slice(0, 4)
        return (
          <button key={barber.id} type="button" onClick={() => select(barber.id)} className={`rounded-[var(--radius-md)] border p-5 text-left transition ${selected === barber.id ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : 'border-[var(--border-default)] bg-[var(--bg-elevated)]'}`}>
            <Avatar name={barber.name} size="lg" />
            <p className="mt-4 font-semibold">{barber.name}</p>
            <p className="text-sm text-[var(--text-secondary)]">{(barber.specialtyOptionIds?.length || barber.specialties?.length || 0)} especialidades cadastradas</p>
            <span className="mt-3 inline-flex rounded-full bg-[var(--accent-subtle)] px-3 py-1 text-xs font-semibold text-[var(--accent-text)]">{getPricingModelLabel(barber.pricingModel)}</span>
            {specialtyNames.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {specialtyNames.map((name) => <span key={name} className="rounded-full bg-[var(--bg-subtle)] px-2 py-1 text-xs text-[var(--text-secondary)]">{name}</span>)}
              </div>
            ) : null}
          </button>
        )
      })}
    </div>
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
          // TODO: no modelo slot_only, bloquear slots adjacentes quando a duracao ja estiver definida.
          return <button key={time} type="button" disabled={disabled} onClick={() => form.setValue('time', time, { shouldValidate: true })} className={`rounded-[var(--radius-md)] border px-3 py-3 text-sm ${form.watch('time') === time ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : 'border-[var(--border-default)] bg-[var(--bg-elevated)]'} disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through`}>{time}</button>
        })}
      </div>
    </div>
  )
}

function DynamicServiceStep({ form, categories, options, selectedBarber, missingRequired, selectionConflicts, priceInfo }) {
  const [serviceSearch, setServiceSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const selected = form.watch('selectedOptionIds') || []
  const activeCategories = getActiveCategories(categories)
  const matchesFilters = (option) => {
    const matchesSearch = `${option.name} ${option.description || ''}`.toLowerCase().includes(serviceSearch.toLowerCase().trim())
    const matchesType = typeFilter === 'all' || (typeFilter === 'required' ? option.required || option.optionType === 'required' : option.optionType === typeFilter)
    return matchesSearch && matchesType
  }
  const visibleCategoryGroups = activeCategories
    .map((category) => ({ category, options: getActiveOptionsByCategory(category.id, options).filter(matchesFilters) }))
    .filter((group) => group.options.length)
  const toggleOption = (option, category) => {
    const current = form.getValues('selectedOptionIds') || []
    const categoryOptions = getActiveOptionsByCategory(category.id, options).map((item) => item.id)
    const withoutSameRequiredCategory = category.required ? current.filter((id) => !categoryOptions.includes(id)) : current
    const exists = current.includes(option.id)
    const next = exists ? current.filter((id) => id !== option.id) : [...withoutSameRequiredCategory, option.id]
    form.setValue('selectedOptionIds', next, { shouldValidate: true })
  }

  return (
    <div className="grid gap-5">
      <div className="rounded-[var(--radius-lg)] border border-[var(--accent-default)] bg-[var(--accent-subtle)] p-4">
        <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">{selectedBarber?.name || 'Barbeiro selecionado'} - {getPricingModelLabel(selectedBarber?.pricingModel)}</p>
        <p className="mt-1 text-2xl font-bold">{money(priceInfo.finalPrice)}</p>
        <p className="text-sm text-[var(--text-secondary)]">{priceInfo.breakdown}</p>
      </div>
      <div className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-subtle)] p-4 md:grid-cols-[1fr_220px]">
        <Input label="Buscar servico" value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} />
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Tipo</span>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3">
            <option value="all">Todos</option>
            <option value="required">Obrigatorios</option>
            <option value="additional">Adicionais</option>
            <option value="combo">Combos/pacotes</option>
          </select>
        </label>
      </div>
      {!visibleCategoryGroups.length ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-6 text-center text-sm text-[var(--text-secondary)]">
          Nenhuma opcao encontrada para os filtros atuais.
        </div>
      ) : null}
      {visibleCategoryGroups.map(({ category, options: categoryOptions }) => {
        const missing = missingRequired.includes(category.id)
        return (
          <section key={category.id} className={`rounded-[var(--radius-lg)] border p-4 ${missing ? 'border-[var(--status-cancelled)]' : 'border-[var(--border-default)]'}`}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-xl font-bold">{category.name}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{category.description}</p>
              </div>
              <span className="rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">{category.required ? 'Obrigatorio' : 'Adicional'}</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {categoryOptions.map((option) => {
                const checked = selected.includes(option.id)
                const specialtyReason = !checked ? getSpecialtyBlock(option, selectedBarber) : null
                const compatibilityReason = !checked ? getCompatibilityBlock(option, selected, options) : null
                const blockReason = specialtyReason || compatibilityReason
                const hasConflict = selectionConflicts.some((conflict) => conflict.optionId === option.id)
                return (
                  <button key={option.id} type="button" disabled={Boolean(blockReason)} onClick={() => toggleOption(option, category)} className={`rounded-[var(--radius-md)] border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-45 ${checked ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : hasConflict ? 'border-[var(--status-cancelled)] bg-red-500/10' : 'border-[var(--border-default)] bg-[var(--bg-elevated)] hover:border-[var(--accent-default)]'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{option.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{option.estimatedMinutes} min</p>
                        {blockReason ? <p className="mt-1 text-xs text-[var(--status-cancelled)]">{blockReason}</p> : null}
                        {hasConflict ? <p className="mt-1 text-xs text-[var(--status-cancelled)]">{selectionConflicts.find((conflict) => conflict.optionId === option.id)?.message}</p> : null}
                      </div>
                      <p className="font-bold text-[var(--accent-text)]">{money(option.price)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function getSpecialtyBlock(option, barber) {
  if (!barber?.specialtyOptionIds?.length) return null
  return barber.specialtyOptionIds.includes(option.id) ? null : `${barber.name} nao oferece esta opcao`
}

function getUnsupportedOptions(optionIds, barber, options) {
  if (!barber?.specialtyOptionIds?.length) return []
  return optionIds
    .map((id) => options.find((option) => option.id === id))
    .filter((option) => option && !barber.specialtyOptionIds.includes(option.id))
}

function ConfirmStep({ form, totals, categories, selectedBarber, priceInfo }) {
  const { register, setValue, formState: { errors } } = form
  const date = form.watch('date')
  const time = form.watch('time')
  const groupedOptions = categories
    .map((category) => ({
      category,
      options: totals.selectedOptions.filter((option) => option.categoryId === category.id),
    }))
    .filter((group) => group.options.length)
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
        <p className="font-semibold">Total: {money(priceInfo.finalPrice)} em {totals.totalMinutes} min</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{priceInfo.breakdown}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Com {selectedBarber?.name || 'barbeiro selecionado'} em {date} as {time}</p>
        <p className="text-sm text-[var(--text-secondary)]">Modo demonstracao: pagamentos nao sao processados. PIX e cartao entram como pagos na simulacao.</p>
        <div className="mt-4 grid gap-3">
          {groupedOptions.map((group) => (
            <div key={group.category.id} className="rounded-[var(--radius-md)] bg-[var(--bg-elevated)] p-3">
              <p className="text-xs font-semibold uppercase text-[var(--text-secondary)]">{group.category.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.options.map((option) => <span key={option.id} className="rounded-full bg-[var(--bg-subtle)] px-3 py-1 text-xs">{option.name}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
