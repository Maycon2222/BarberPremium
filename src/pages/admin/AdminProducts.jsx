import { useMemo, useState } from 'react'
import { Boxes, PackagePlus, Save, Search } from 'lucide-react'
import { Badge, Button, Card, Input } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { productSchema } from '../../schemas/productSchema'
import { useProductStore } from '../../store/productStore'
import { PRODUCT_FULFILLMENT_METHODS, PRODUCT_RESERVATION_STATUSES, getProductFulfillmentMethod, money } from '../../utils/pricing'

const emptyProduct = {
  name: '',
  categoryId: '',
  price: 0,
  stock: 0,
  active: true,
  description: '',
  pickupEnabled: true,
  deliveryEnabled: false,
  order: 10,
}

export function AdminProducts() {
  const { categories, products, reservations, addCategory, updateCategory, addProduct, updateProduct, toggleProduct, updateReservation } = useProductStore()
  const [draft, setDraft] = useState(emptyProduct)
  const [categoryDraft, setCategoryDraft] = useState({ name: '', order: categories.length * 10 + 10, active: true })
  const [editingId, setEditingId] = useState('')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [fulfillment, setFulfillment] = useState('all')
  const [error, setError] = useState('')

  const filteredProducts = useMemo(() => products
    .filter((product) => categoryId === 'all' || product.categoryId === categoryId)
    .filter((product) => fulfillment === 'all' || (fulfillment === 'pickup' ? product.pickupEnabled : product.deliveryEnabled))
    .filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.order - b.order), [products, categoryId, fulfillment, search])

  const saveProduct = () => {
    const parsed = productSchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Produto invalido')
      return
    }
    if (editingId) {
      updateProduct(editingId, parsed.data)
    } else {
      addProduct(parsed.data)
    }
    setDraft(emptyProduct)
    setEditingId('')
    setError('')
  }

  const saveCategory = () => {
    const name = categoryDraft.name.trim()
    if (!name) {
      setError('Informe o nome da categoria')
      return
    }
    addCategory({ ...categoryDraft, name })
    setCategoryDraft({ name: '', order: categories.length * 10 + 20, active: true })
    setError('')
  }

  const editProduct = (product) => {
    setEditingId(product.id)
    setDraft({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
      active: product.active,
      description: product.description || '',
      pickupEnabled: product.pickupEnabled,
      deliveryEnabled: product.deliveryEnabled,
      order: product.order,
    })
  }

  const activeProducts = products.filter((product) => product.active)
  const inventoryValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.stock || 0), 0)
  const pickupProducts = products.filter((product) => product.pickupEnabled).length
  const deliveryProducts = products.filter((product) => product.deliveryEnabled).length
  const lowStockProducts = products.filter((product) => Number(product.stock || 0) <= 3).length

  return (
    <Page className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Catalogo futuro</p>
          <h2 className="font-display text-3xl font-bold">Produtos e estoque</h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">Preparacao para venda futura com retirada no dia do corte ou entrega. Esta etapa nao adiciona loja do cliente nem checkout.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center md:grid-cols-3 xl:grid-cols-6">
          <Metric label="Produtos ativos" value={activeProducts.length} />
          <Metric label="Reservas" value={reservations.length} />
          <Metric label="Retirada" value={pickupProducts} />
          <Metric label="Entrega" value={deliveryProducts} />
          <Metric label="Estoque baixo" value={lowStockProducts} />
          <Metric label="Estoque" value={money(inventoryValue)} />
        </div>
      </div>

      {error ? <div className="rounded-[var(--radius-md)] border border-[var(--status-cancelled)] bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold"><PackagePlus className="h-5 w-5 text-[var(--accent-default)]" /> {editingId ? 'Editar produto' : 'Novo produto'}</h3>
            <div className="grid gap-3">
              <Input label="Nome" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Categoria</span>
                <select className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3" value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
                  <option value="">Selecione</option>
                  {categories.filter((category) => category.active !== false).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Preco" type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} />
                <Input label="Estoque" type="number" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} />
              </div>
              <Input label="Descricao" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
              <Input label="Ordem" type="number" value={draft.order} onChange={(event) => setDraft({ ...draft, order: Number(event.target.value) })} />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.pickupEnabled} onChange={(event) => setDraft({ ...draft, pickupEnabled: event.target.checked })} /> Retirar no dia do corte</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.deliveryEnabled} onChange={(event) => setDraft({ ...draft, deliveryEnabled: event.target.checked })} /> Receber por entrega</label>
              <div className="flex gap-2">
                {editingId ? <Button className="flex-1" variant="secondary" onClick={() => { setEditingId(''); setDraft(emptyProduct) }}>Cancelar</Button> : null}
                <Button className="flex-1" onClick={saveProduct}><Save className="h-4 w-4" /> Salvar</Button>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-display text-xl font-bold">Categorias</h3>
            <div className="grid gap-3">
              <Input label="Nova categoria" value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} />
              <Input label="Ordem" type="number" value={categoryDraft.order} onChange={(event) => setCategoryDraft({ ...categoryDraft, order: Number(event.target.value) })} />
              <Button onClick={saveCategory}>Cadastrar categoria</Button>
              <div className="space-y-2">
                {[...categories].sort((a, b) => a.order - b.order).map((category) => (
                  <div key={category.id} className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3">
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">Ordem {category.order}</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => updateCategory(category.id, { active: !category.active })}>{category.active ? 'Desativar' : 'Ativar'}</Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
              <Input label="Buscar produto" value={search} onChange={(event) => setSearch(event.target.value)} prefix={<Search className="h-4 w-4" />} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Categoria</span>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3">
                  <option value="all">Todas</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Entrega futura</span>
                <select value={fulfillment} onChange={(event) => setFulfillment(event.target.value)} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3">
                  <option value="all">Todas</option>
                  {PRODUCT_FULFILLMENT_METHODS.map((method) => <option key={method.id} value={method.id}>{method.name}</option>)}
                </select>
              </label>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--border-default)] p-4">
              <h3 className="flex items-center gap-2 font-display text-xl font-bold"><Boxes className="h-5 w-5 text-[var(--accent-default)]" /> Catalogo interno</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-sm">
                <thead className="bg-[var(--bg-subtle)] text-left text-[var(--text-secondary)]">
                  <tr><th className="p-3">Produto</th><th>Categoria</th><th>Preco</th><th>Estoque</th><th>Entrega</th><th>Status</th><th>Acoes</th></tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="border-t border-[var(--border-default)]">
                      <td className="p-3"><button className="text-left font-semibold" onClick={() => editProduct(product)}>{product.name}</button><p className="text-xs text-[var(--text-secondary)]">{product.description}</p></td>
                      <td>{categories.find((category) => category.id === product.categoryId)?.name || product.categoryId}</td>
                      <td>{money(product.price)}</td>
                      <td><span className={Number(product.stock || 0) <= 3 ? 'font-semibold text-[var(--status-pending)]' : ''}>{product.stock}</span></td>
                      <td>{[product.pickupEnabled ? 'retirada' : '', product.deliveryEnabled ? 'entrega' : ''].filter(Boolean).join(' / ')}</td>
                      <td><Badge status={product.active ? 'completed' : 'cancelled'}>{product.active ? 'Ativo' : 'Inativo'}</Badge></td>
                      <td><Button size="sm" variant="secondary" onClick={() => toggleProduct(product.id)}>{product.active ? 'Desativar' : 'Ativar'}</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-[var(--border-default)] p-4">
              <h3 className="font-display text-xl font-bold">Reservas futuras</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Estrutura preparada para retirada no corte ou entrega, sem loja publica nesta etapa.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="bg-[var(--bg-subtle)] text-left text-[var(--text-secondary)]">
                  <tr><th className="p-3">Produto</th><th>Cliente</th><th>Quantidade</th><th>Total</th><th>Entrega</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {reservations.map((reservation) => {
                    const fulfillmentMethod = getProductFulfillmentMethod(reservation.fulfillmentMethod)
                    return (
                      <tr key={reservation.id} className="border-t border-[var(--border-default)]">
                        <td className="p-3 font-semibold">{reservation.productName || products.find((product) => product.id === reservation.productId)?.name || reservation.productId}</td>
                        <td>{reservation.clientName || reservation.clientId}</td>
                        <td>{reservation.quantity}</td>
                        <td>{money(reservation.totalPrice || Number(reservation.unitPrice || 0) * Number(reservation.quantity || 0))}</td>
                        <td>{fulfillmentMethod?.name || reservation.fulfillmentMethod}</td>
                        <td>
                          <label className="sr-only" htmlFor={`reservation-${reservation.id}`}>Status da reserva</label>
                          <select id={`reservation-${reservation.id}`} value={reservation.status || 'reserved'} onChange={(event) => updateReservation(reservation.id, { status: event.target.value })} className="h-9 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-2 text-xs">
                            {PRODUCT_RESERVATION_STATUSES.map((status) => <option key={status.id} value={status.id}>{status.name}</option>)}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {!reservations.length ? <p className="p-4 text-sm text-[var(--text-secondary)]">Nenhuma reserva de produto criada ainda.</p> : null}
            </div>
          </Card>
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
