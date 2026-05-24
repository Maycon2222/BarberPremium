import { useState } from 'react'
import { Badge, Button, Card, Input } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useAuthStore } from '../../store/authStore'
import { useShopStore } from '../../store/shopStore'
import { useToastStore } from '../../store/toastStore'
import { DEFAULT_DURATION_TIERS, PRICING_MODELS, getPricingModelLabel, money, normalizeBarberPricing } from '../../utils/pricing'

const emptyBarber = normalizeBarberPricing({
  name: '',
  email: '',
  phone: '',
  active: true,
  offeredServiceIds: [],
  customPrices: {},
  pricingModel: 'fixed',
})

export function OwnerBarbers() {
  const { user } = useAuthStore()
  const { register: createUser } = useAuthStore()
  const { shops } = useShopStore()
  const { barbers, upsertBarber, toggleBarber } = useAppointmentStore()
  const { notify } = useToastStore()
  const [draft, setDraft] = useState(emptyBarber)
  const [editingId, setEditingId] = useState('')
  const shop = shops.find((item) => item.id === user?.shopId)
  const shopServices = (shop?.services || []).filter((service) => service.active)
  const shopBarbers = barbers.filter((barber) => barber.shopId === user?.shopId)

  const save = () => {
    if (!user?.shopId) return
    if (!draft.name.trim() || !draft.email.trim()) {
      notify({ type: 'error', title: 'Dados incompletos', message: 'Informe nome e e-mail do barbeiro.' })
      return
    }
    if (!editingId && (draft.password || '123456').length < 6) {
      notify({ type: 'error', title: 'Senha invalida', message: 'Senha inicial deve ter ao menos 6 caracteres.' })
      return
    }

    const barberId = editingId || `barber-${Date.now()}`
    upsertBarber({
      ...normalizeBarberPricing(draft),
      id: barberId,
      userId: barberId,
      shopId: user.shopId,
      specialtyOptionIds: [],
      specialties: [],
    })

    if (!editingId) {
      try {
        createUser({
          id: barberId,
          name: draft.name,
          email: draft.email,
          password: draft.password || '123456',
          phone: draft.phone,
          role: 'barber',
          barberId,
          shopId: user.shopId,
        })
        localStorage.setItem('barber-session', JSON.stringify(user))
        useAuthStore.setState({ user })
      } catch {
        notify({ type: 'info', title: 'Login ja existente', message: 'Barbeiro salvo. O e-mail informado ja tinha uma conta cadastrada.' })
      }
    }

    setDraft(emptyBarber)
    setEditingId('')
    notify({ type: 'success', title: 'Barbeiro salvo', message: 'Equipe da barbearia atualizada.' })
  }

  const edit = (barber) => {
    setEditingId(barber.id)
    setDraft({
      ...emptyBarber,
      ...normalizeBarberPricing(barber),
      offeredServiceIds: barber.offeredServiceIds || [],
      customPrices: barber.customPrices || {},
      password: '',
    })
  }

  const toggleOfferedService = (serviceId) => {
    const current = draft.offeredServiceIds || []
    const next = current.includes(serviceId) ? current.filter((id) => id !== serviceId) : [...current, serviceId]
    setDraft({ ...draft, offeredServiceIds: next })
  }

  const setCustomPrice = (serviceId, value) => {
    const price = value === '' ? undefined : Number(value)
    const customPrices = { ...(draft.customPrices || {}) }
    if (price === undefined || Number.isNaN(price)) delete customPrices[serviceId]
    else customPrices[serviceId] = price
    setDraft({ ...draft, customPrices })
  }

  const updateTier = (index, key, value) => {
    const durationTiers = [...(draft.durationTiers || DEFAULT_DURATION_TIERS)]
    durationTiers[index] = { ...durationTiers[index], [key]: Number(value) }
    setDraft({ ...draft, durationTiers })
  }

  return (
    <Page className="grid gap-4 xl:grid-cols-[420px_1fr] xl:gap-6">
      <Card>
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Equipe da barbearia</p>
          <h2 className="font-display text-xl font-bold sm:text-2xl">{editingId ? 'Editar barbeiro' : 'Novo barbeiro'}</h2>
          {shop ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{shop.name}</p> : null}
        </div>
        <div className="grid gap-3">
          <Input label="Nome" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <Input label="E-mail" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          <Input label="Telefone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
          {!editingId ? <Input label="Senha inicial" type="password" placeholder="Minimo 6 caracteres" value={draft.password || ''} onChange={(event) => setDraft({ ...draft, password: event.target.value })} /> : null}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Barbeiro ativo</label>

          <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
            <p className="mb-3 font-semibold">Modelo de precificacao</p>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Modelo</span>
              <select value={draft.pricingModel || 'fixed'} onChange={(event) => setDraft({ ...draft, pricingModel: event.target.value })} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-3">
                {PRICING_MODELS.map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
              </select>
            </label>
            {draft.pricingModel === 'per_minute' ? <div className="mt-3"><Input label="Tarifa por minuto (R$)" type="number" min="0" step="0.01" value={draft.minuteRate || 0} onChange={(event) => setDraft({ ...draft, minuteRate: Number(event.target.value) })} /></div> : null}
            {draft.pricingModel === 'duration_tier' ? (
              <div className="mt-4 space-y-3">
                {(draft.durationTiers || DEFAULT_DURATION_TIERS).map((tier, index) => (
                  <div key={`${tier.upTo}-${index}`} className="grid grid-cols-2 gap-2">
                    <Input label="Ate min" type="number" min="1" value={tier.upTo} onChange={(event) => updateTier(index, 'upTo', event.target.value)} />
                    <Input label="Acrescimo R$" type="number" min="0" step="0.01" value={tier.surcharge} onChange={(event) => updateTier(index, 'surcharge', event.target.value)} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
            <p className="mb-1 font-semibold">Servicos oferecidos</p>
            <p className="mb-3 text-xs text-[var(--text-secondary)]">Selecione os servicos da barbearia que este barbeiro faz.</p>
            <div className="max-h-80 space-y-2 overflow-y-auto thin-scrollbar pr-1">
              {shopServices.map((service) => (
                <div key={service.id} className="rounded-[var(--radius-sm)] px-2 py-2 hover:bg-[var(--bg-subtle)]">
                  <label className="flex items-start gap-2 text-sm">
                    <input type="checkbox" className="mt-1" checked={(draft.offeredServiceIds || []).includes(service.id)} onChange={() => toggleOfferedService(service.id)} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{service.name}</span>
                      <span className="text-xs text-[var(--text-secondary)]">{service.estimatedMinutes} min - {money(service.price)}</span>
                    </span>
                  </label>
                  {(draft.offeredServiceIds || []).includes(service.id) ? (
                    <div className="mt-2 pl-6">
                      <Input label="Preco customizado opcional" type="number" min="0" step="0.01" value={draft.customPrices?.[service.id] ?? ''} onChange={(event) => setCustomPrice(service.id, event.target.value)} />
                    </div>
                  ) : null}
                </div>
              ))}
              {!shopServices.length ? <p className="text-sm text-[var(--text-secondary)]">Cadastre servicos na barbearia antes de vincular barbeiros.</p> : null}
            </div>
          </div>

          <div className="flex gap-2">
            {editingId ? <Button className="flex-1" variant="secondary" onClick={() => { setDraft(emptyBarber); setEditingId('') }}>Cancelar</Button> : null}
            <Button className="flex-1" onClick={save}>Salvar</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {shopBarbers.map((barber) => (
          <Card key={barber.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <button className="text-left" onClick={() => edit(barber)}>
                <p className="font-semibold">{barber.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">{barber.email}</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{barber.offeredServiceIds?.length || 0} servicos vinculados</p>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{getPricingModelLabel(barber.pricingModel)}</p>
              </button>
              <div className="flex items-center gap-2">
                <Badge status={barber.active ? 'completed' : 'cancelled'}>{barber.active ? 'Ativo' : 'Inativo'}</Badge>
                <Button variant={barber.active ? 'secondary' : 'primary'} onClick={() => toggleBarber(barber.id)}>{barber.active ? 'Desativar' : 'Ativar'}</Button>
              </div>
            </div>
          </Card>
        ))}
        {!shopBarbers.length ? (
          <Card>
            <p className="text-sm text-[var(--text-secondary)]">Nenhum barbeiro cadastrado para esta barbearia.</p>
          </Card>
        ) : null}
      </div>
    </Page>
  )
}
