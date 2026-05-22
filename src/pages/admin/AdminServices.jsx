import { useMemo, useState } from 'react'
import { BarChart3, CheckCircle2, Layers3, Plus, Power, Save, Search, XCircle } from 'lucide-react'
import { Badge, Button, Card, Input } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useServiceStore } from '../../store/serviceStore'
import { serviceCategorySchema, serviceOptionSchema } from '../../schemas/serviceSchema'
import { money } from '../../utils/pricing'

const emptyCategory = { name: '', description: '', required: false, active: true, order: 10 }
const emptyOption = { name: '', categoryId: '', price: 0, description: '', estimatedMinutes: 15, active: true, required: false, optionType: 'additional', order: 10, compatibility: { incompatibleOptionIds: [], requiresOptionIds: [], notes: '' } }
const optionTypeLabels = { required: 'Obrigatoria', additional: 'Adicional', combo: 'Combo/pacote' }

export function AdminServices({ mode = 'admin' }) {
  const { categories, options, addCategory, updateCategory, toggleCategory, addOption, updateOption, toggleOption, removeOption } = useServiceStore()
  const { appointments } = useAppointmentStore()
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '')
  const [categoryDraft, setCategoryDraft] = useState(emptyCategory)
  const [optionDraft, setOptionDraft] = useState({ ...emptyOption, categoryId: selectedCategoryId })
  const [editingOptionId, setEditingOptionId] = useState('')
  const [search, setSearch] = useState('')
  const [optionTypeFilter, setOptionTypeFilter] = useState('all')
  const [error, setError] = useState('')

  const selectedCategory = categories.find((category) => category.id === selectedCategoryId)
  const filteredOptions = options
    .filter((option) => (!selectedCategoryId || option.categoryId === selectedCategoryId) && option.name.toLowerCase().includes(search.toLowerCase()))
    .filter((option) => optionTypeFilter === 'all' || (optionTypeFilter === 'required' ? option.required || option.optionType === 'required' : option.optionType === optionTypeFilter))
    .sort((a, b) => a.order - b.order)
  const optionRanking = useMemo(() => {
    const counts = appointments.flatMap((appointment) => appointment.selectedOptionIds || []).reduce((acc, id) => ({ ...acc, [id]: (acc[id] || 0) + 1 }), {})
    return options.map((option) => ({ ...option, count: counts[option.id] || 0 })).sort((a, b) => b.count - a.count).slice(0, 6)
  }, [appointments, options])
  const compatibilityOptions = options
    .filter((option) => option.id !== editingOptionId)
    .sort((a, b) => {
      const categoryA = categories.find((category) => category.id === a.categoryId)?.order || 0
      const categoryB = categories.find((category) => category.id === b.categoryId)?.order || 0
      return categoryA - categoryB || a.order - b.order
    })

  const saveCategory = () => {
    const parsed = serviceCategorySchema.safeParse(categoryDraft)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Categoria invalida')
      return
    }
    addCategory(parsed.data)
    setCategoryDraft(emptyCategory)
    setError('')
  }

  const saveOption = () => {
    const parsed = serviceOptionSchema.safeParse(optionDraft)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Opcao invalida')
      return
    }
    if (editingOptionId) {
      updateOption(editingOptionId, parsed.data)
    } else {
      addOption(parsed.data)
    }
    setEditingOptionId('')
    setOptionDraft({ ...emptyOption, categoryId: selectedCategoryId })
    setError('')
  }

  const editOption = (option) => {
    setEditingOptionId(option.id)
    setOptionDraft({
      name: option.name,
      categoryId: option.categoryId,
      price: option.price,
      description: option.description || '',
      estimatedMinutes: option.estimatedMinutes,
      active: option.active,
      required: option.required,
      optionType: option.optionType || 'additional',
      order: option.order,
      compatibility: option.compatibility || emptyOption.compatibility,
    })
  }

  const toggleCompatibilityId = (field, optionId) => {
    const current = optionDraft.compatibility[field] || []
    const next = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId]
    setOptionDraft({ ...optionDraft, compatibility: { ...optionDraft.compatibility, [field]: next } })
  }

  const compatibilitySummary = (option) => {
    const incompatible = (option.compatibility?.incompatibleOptionIds || [])
      .map((id) => options.find((entry) => entry.id === id)?.name || id)
      .slice(0, 2)
    const requires = (option.compatibility?.requiresOptionIds || [])
      .map((id) => options.find((entry) => entry.id === id)?.name || id)
      .slice(0, 2)
    return [
      incompatible.length ? `Bloqueia: ${incompatible.join(', ')}` : '',
      requires.length ? `Requer: ${requires.join(', ')}` : '',
    ].filter(Boolean).join(' | ')
  }

  const title = mode === 'barber' ? 'Meus servicos e precos' : 'Precificacao dinamica'

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">{mode === 'barber' ? 'Barbeiro' : 'Admin'}</p>
          <h2 className="font-display text-3xl font-bold">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Cadastre categorias, opcoes, combos, tempo medio, ordem e disponibilidade. A estrutura ja guarda compatibilidade para restricoes futuras.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Metric label="Categorias" value={categories.length} />
          <Metric label="Opcoes ativas" value={options.filter((option) => option.active).length} />
          <Metric label="Combos" value={options.filter((option) => option.optionType === 'combo').length} />
        </div>
      </div>

      {error ? <div className="rounded-[var(--radius-md)] border border-[var(--status-cancelled)] bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold"><Layers3 className="h-5 w-5 text-[var(--accent-default)]" /> Categorias</h3>
            <div className="space-y-2">
              {[...categories].sort((a, b) => a.order - b.order).map((category) => (
                <button key={category.id} type="button" onClick={() => { setSelectedCategoryId(category.id); setOptionDraft((draft) => ({ ...draft, categoryId: category.id })) }} className={`w-full rounded-[var(--radius-md)] border p-3 text-left transition ${selectedCategoryId === category.id ? 'border-[var(--accent-default)] bg-[var(--accent-subtle)]' : 'border-[var(--border-default)] bg-[var(--bg-elevated)]'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{category.name}</span>
                    <Badge status={category.active ? 'completed' : 'cancelled'}>{category.active ? 'Ativa' : 'Inativa'}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{category.required ? 'Categoria obrigatoria' : 'Categoria adicional'} - ordem {category.order}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-display text-xl font-bold">Nova categoria</h3>
            <div className="grid gap-3">
              <Input label="Nome" value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} />
              <Input label="Descricao" value={categoryDraft.description} onChange={(event) => setCategoryDraft({ ...categoryDraft, description: event.target.value })} />
              <Input label="Ordem" type="number" value={categoryDraft.order} onChange={(event) => setCategoryDraft({ ...categoryDraft, order: Number(event.target.value) })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={categoryDraft.required} onChange={(event) => setCategoryDraft({ ...categoryDraft, required: event.target.checked })} /> Obrigatoria no agendamento</label>
              <Button onClick={saveCategory}><Plus className="h-4 w-4" /> Criar categoria</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-2xl font-bold">{selectedCategory?.name || 'Todas as opcoes'}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{selectedCategory?.description}</p>
              </div>
              {selectedCategory ? <Button variant="secondary" onClick={() => toggleCategory(selectedCategory.id)}><Power className="h-4 w-4" /> {selectedCategory.active ? 'Desativar categoria' : 'Ativar categoria'}</Button> : null}
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_180px]">
              <Input label="Buscar opcao" value={search} onChange={(event) => setSearch(event.target.value)} prefix={<Search className="h-4 w-4" />} />
              <Input label="Ordem categoria" type="number" value={selectedCategory?.order || 0} onChange={(event) => selectedCategory && updateCategory(selectedCategory.id, { order: Number(event.target.value) })} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Obrigatoria</span>
                <select className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3" value={selectedCategory?.required ? 'yes' : 'no'} onChange={(event) => selectedCategory && updateCategory(selectedCategory.id, { required: event.target.value === 'yes' })}>
                  <option value="yes">Sim</option>
                  <option value="no">Nao</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Tipo de opcao</span>
                <select className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3" value={optionTypeFilter} onChange={(event) => setOptionTypeFilter(event.target.value)}>
                  <option value="all">Todas</option>
                  <option value="required">Obrigatorias</option>
                  <option value="additional">Adicionais</option>
                  <option value="combo">Combos/pacotes</option>
                </select>
              </label>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-display text-xl font-bold">{editingOptionId ? 'Editar opcao' : 'Nova opcao'}</h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Input label="Nome" value={optionDraft.name} onChange={(event) => setOptionDraft({ ...optionDraft, name: event.target.value })} />
              <Input label="Preco" type="number" value={optionDraft.price} onChange={(event) => setOptionDraft({ ...optionDraft, price: Number(event.target.value) })} />
              <Input label="Tempo medio" type="number" value={optionDraft.estimatedMinutes} onChange={(event) => setOptionDraft({ ...optionDraft, estimatedMinutes: Number(event.target.value) })} />
              <Input label="Ordem" type="number" value={optionDraft.order} onChange={(event) => setOptionDraft({ ...optionDraft, order: Number(event.target.value) })} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Categoria</span>
                <select className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3" value={optionDraft.categoryId} onChange={(event) => setOptionDraft({ ...optionDraft, categoryId: event.target.value })}>
                  <option value="">Selecione</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Tipo</span>
                <select className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3" value={optionDraft.optionType} onChange={(event) => setOptionDraft({ ...optionDraft, optionType: event.target.value, required: event.target.value === 'required' })}>
                  <option value="required">Obrigatoria</option>
                  <option value="additional">Adicional</option>
                  <option value="combo">Combo/pacote</option>
                </select>
              </label>
              <Input label="Descricao" value={optionDraft.description} onChange={(event) => setOptionDraft({ ...optionDraft, description: event.target.value })} />
              <Input label="Notas de compatibilidade" value={optionDraft.compatibility.notes} onChange={(event) => setOptionDraft({ ...optionDraft, compatibility: { ...optionDraft.compatibility, notes: event.target.value } })} />
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <CompatibilityPicker
                title="Incompativel com"
                description="Bloqueia a escolha quando uma destas opcoes ja estiver selecionada."
                options={compatibilityOptions}
                categories={categories}
                selectedIds={optionDraft.compatibility.incompatibleOptionIds}
                onToggle={(id) => toggleCompatibilityId('incompatibleOptionIds', id)}
              />
              <CompatibilityPicker
                title="Requer"
                description="Exige que uma destas opcoes tambem esteja selecionada."
                options={compatibilityOptions}
                categories={categories}
                selectedIds={optionDraft.compatibility.requiresOptionIds}
                onToggle={(id) => toggleCompatibilityId('requiresOptionIds', id)}
              />
            </div>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {editingOptionId ? <Button variant="secondary" onClick={() => { setEditingOptionId(''); setOptionDraft({ ...emptyOption, categoryId: selectedCategoryId }) }}>Cancelar edicao</Button> : null}
              <Button onClick={saveOption}><Save className="h-4 w-4" /> Salvar opcao</Button>
            </div>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
            <Card className="overflow-hidden p-0">
              <div className="border-b border-[var(--border-default)] p-4">
                <h3 className="font-display text-xl font-bold">Opcoes cadastradas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-sm">
                  <thead className="bg-[var(--bg-subtle)] text-left text-[var(--text-secondary)]">
                    <tr><th className="p-3">Opcao</th><th>Tipo</th><th>Preco</th><th>Tempo</th><th>Compat.</th><th>Status</th><th>Acoes</th></tr>
                  </thead>
                  <tbody>
                    {filteredOptions.map((option) => (
                      <tr key={option.id} className="border-t border-[var(--border-default)]">
                        <td className="p-3"><button className="text-left font-semibold text-[var(--text-primary)]" onClick={() => editOption(option)}>{option.name}</button><p className="text-xs text-[var(--text-secondary)]">{option.description || option.compatibility?.notes}</p></td>
                        <td>{optionTypeLabels[option.optionType] || (option.required ? 'Obrigatoria' : 'Adicional')}</td>
                        <td>{money(option.price)}</td>
                        <td>{option.estimatedMinutes} min</td>
                        <td><span className="font-semibold">{(option.compatibility?.incompatibleOptionIds?.length || 0) + (option.compatibility?.requiresOptionIds?.length || 0)} regras</span><p className="max-w-[240px] truncate text-xs text-[var(--text-secondary)]">{compatibilitySummary(option) || 'Sem restricoes'}</p></td>
                        <td>{option.active ? <CheckCircle2 className="h-4 w-4 text-[var(--status-completed)]" /> : <XCircle className="h-4 w-4 text-[var(--status-cancelled)]" />}</td>
                        <td className="space-x-2"><Button size="sm" variant="secondary" onClick={() => toggleOption(option.id)}>{option.active ? 'Desativar' : 'Ativar'}</Button><Button size="sm" variant="danger" onClick={() => removeOption(option.id)}>Excluir</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold"><BarChart3 className="h-5 w-5 text-[var(--accent-default)]" /> Mais escolhidas</h3>
              <div className="space-y-3">
                {optionRanking.map((option) => (
                  <div key={option.id} className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{option.name}</p>
                      <span className="text-sm text-[var(--accent-text)]">{option.count}x</span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">{money(option.price)} - {option.estimatedMinutes} min</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
    </div>
  )
}

function CompatibilityPicker({ title, description, options, categories, selectedIds, onToggle }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3">
      <div className="mb-3">
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-[var(--text-secondary)]">{description}</p>
      </div>
      <div className="max-h-56 space-y-2 overflow-y-auto thin-scrollbar pr-1">
        {options.map((option) => {
          const category = categories.find((item) => item.id === option.categoryId)
          return (
            <label key={option.id} className="flex items-start gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm hover:bg-[var(--bg-subtle)]">
              <input type="checkbox" className="mt-1" checked={selectedIds.includes(option.id)} onChange={() => onToggle(option.id)} />
              <span>
                <span className="block font-medium">{option.name}</span>
                <span className="text-xs text-[var(--text-secondary)]">{category?.name || option.categoryId}</span>
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
