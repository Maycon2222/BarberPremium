import { useState } from 'react'
import { Badge, Button, Card, Input } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useServiceStore } from '../../store/serviceStore'
import { getActiveCategories, getActiveOptionsByCategory } from '../../utils/pricing'

const emptyBarber = { name: '', email: '', phone: '', active: true, specialties: [], specialtyOptionIds: [] }

export function AdminBarbers() {
  const { barbers, upsertBarber, toggleBarber } = useAppointmentStore()
  const { categories, options } = useServiceStore()
  const [draft, setDraft] = useState(emptyBarber)
  const [editingId, setEditingId] = useState('')
  const activeCategories = getActiveCategories(categories)

  const save = () => {
    upsertBarber({ ...draft, id: editingId || draft.id })
    setDraft(emptyBarber)
    setEditingId('')
  }

  const edit = (barber) => {
    setEditingId(barber.id)
    setDraft({
      ...emptyBarber,
      ...barber,
      specialtyOptionIds: barber.specialtyOptionIds || [],
    })
  }

  const toggleSpecialty = (optionId) => {
    const current = draft.specialtyOptionIds || []
    const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    setDraft({ ...draft, specialtyOptionIds: next })
  }

  return (
    <Page className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card>
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Equipe</p>
          <h2 className="font-display text-2xl font-bold">{editingId ? 'Editar barbeiro' : 'Novo barbeiro'}</h2>
        </div>
        <div className="grid gap-3">
          <Input label="Nome" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <Input label="E-mail" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          <Input label="Telefone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Barbeiro ativo</label>

          <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
            <p className="mb-1 font-semibold">Especialidades dinamicas</p>
            <p className="mb-3 text-xs text-[var(--text-secondary)]">Selecione quais opcoes esse barbeiro oferece.</p>
            <div className="max-h-80 space-y-4 overflow-y-auto thin-scrollbar pr-1">
              {activeCategories.map((category) => {
                const categoryOptions = getActiveOptionsByCategory(category.id, options)
                return (
                  <section key={category.id}>
                    <h3 className="mb-2 text-sm font-semibold text-[var(--accent-text)]">{category.name}</h3>
                    <div className="grid gap-2">
                      {categoryOptions.map((option) => (
                        <label key={option.id} className="flex items-start gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm hover:bg-[var(--bg-subtle)]">
                          <input type="checkbox" className="mt-1" checked={draft.specialtyOptionIds?.includes(option.id)} onChange={() => toggleSpecialty(option.id)} />
                          <span>
                            <span className="block font-medium">{option.name}</span>
                            <span className="text-xs text-[var(--text-secondary)]">{option.estimatedMinutes} min</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>

          <div className="flex gap-2">
            {editingId ? <Button className="flex-1" variant="secondary" onClick={() => { setDraft(emptyBarber); setEditingId('') }}>Cancelar</Button> : null}
            <Button className="flex-1" onClick={save}>Salvar</Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {barbers.map((barber) => {
          const specialtyCount = barber.specialtyOptionIds?.length || barber.specialties?.length || 0
          return (
            <Card key={barber.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button className="text-left" onClick={() => edit(barber)}>
                  <p className="font-semibold">{barber.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{barber.email}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{specialtyCount} especialidades vinculadas</p>
                </button>
                <div className="flex items-center gap-2">
                  <Badge status={barber.active ? 'completed' : 'cancelled'}>{barber.active ? 'Ativo' : 'Inativo'}</Badge>
                  <Button variant={barber.active ? 'secondary' : 'primary'} onClick={() => toggleBarber(barber.id)}>{barber.active ? 'Desativar' : 'Ativar'}</Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </Page>
  )
}
