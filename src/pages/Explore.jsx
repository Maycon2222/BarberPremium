import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MapPin, Search, Star } from 'lucide-react'
import { Button, Card, Input } from '../design-system'
import { useAuthStore } from '../store/authStore'
import { useShopStore } from '../store/shopStore'

export function Explore() {
  const [query, setQuery] = useState('')
  const { shops } = useShopStore()
  const { user, updateProfile } = useAuthStore()
  const favoriteIds = user?.favoriteShopIds || []
  const recentIds = user?.recentShopIds || []
  const filtered = useMemo(() => {
    const list = shops.filter((shop) => shop.active && shop.name.toLowerCase().includes(query.toLowerCase().trim()))
    return [...list].sort((a, b) => Number(favoriteIds.includes(b.id)) - Number(favoriteIds.includes(a.id)))
  }, [favoriteIds, query, shops])
  const recent = shops.filter((shop) => recentIds.includes(shop.id))

  const toggleFavorite = (shopId) => {
    if (!user) return
    const next = favoriteIds.includes(shopId) ? favoriteIds.filter((id) => id !== shopId) : [...favoriteIds, shopId]
    updateProfile({ favoriteShopIds: next })
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(177,124,62,.18),transparent_34%),linear-gradient(135deg,#141414,#221b17_45%,#111)] px-4 py-8 text-[var(--text-primary)]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl font-bold text-[var(--accent-text)]">Barber Prime</Link>
          <div className="flex gap-2">
            <Link to="/cadastro/barbearia"><Button variant="secondary">Cadastrar barbearia</Button></Link>
            <Link to="/login"><Button>Entrar</Button></Link>
          </div>
        </header>

        <section className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Explorar barbearias</p>
          <h1 className="mt-2 font-display text-4xl font-bold md:text-5xl">Escolha a barbearia antes de agendar.</h1>
          <p className="mt-3 text-[var(--text-secondary)]">Compare barbeiros, horarios, servicos e avaliacoes em uma plataforma unica.</p>
        </section>

        <div className="mb-8 max-w-xl">
          <Input label="Buscar" placeholder="Buscar barbearia..." prefix={<Search className="h-4 w-4" />} value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>

        {recent.length ? (
          <section className="mb-8">
            <h2 className="mb-3 font-display text-2xl font-bold">Visitadas recentemente</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {recent.map((shop) => <ShopCard key={shop.id} shop={shop} favorite={favoriteIds.includes(shop.id)} onFavorite={() => toggleFavorite(shop.id)} />)}
            </div>
          </section>
        ) : null}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((shop) => <ShopCard key={shop.id} shop={shop} favorite={favoriteIds.includes(shop.id)} onFavorite={() => toggleFavorite(shop.id)} />)}
        </section>
      </div>
    </main>
  )
}

function ShopCard({ shop, favorite, onFavorite }) {
  return (
    <Card className="group overflow-hidden p-0 shadow-[0_24px_60px_rgba(0,0,0,.28)] transition hover:-translate-y-1" hover>
      <div className="relative aspect-video overflow-hidden bg-[var(--bg-subtle)]">
        {shop.coverImage ? <img src={shop.coverImage} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : null}
        <button type="button" onClick={onFavorite} className="absolute right-3 top-3 rounded-full bg-black/45 p-2 text-white backdrop-blur">
          <Heart className={`h-4 w-4 ${favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-start gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-subtle)] font-bold text-[var(--accent-text)]">{shop.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <h2 className="font-display text-xl font-bold">{shop.name}</h2>
            <p className="flex items-center gap-1 text-sm text-amber-400"><Star className="h-4 w-4 fill-amber-400" /> 4.8 · 127 av.</p>
          </div>
        </div>
        <p className="mb-3 line-clamp-2 text-sm text-[var(--text-secondary)]">{shop.description}</p>
        <p className="mb-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]"><MapPin className="h-4 w-4" /> {shop.address}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-[var(--text-secondary)]">Seg-Sab · {shop.settings.workingHours.start}h as {shop.settings.workingHours.end}h</span>
          <Link to={`/shop/${shop.slug}`}><Button size="sm">Agendar</Button></Link>
        </div>
      </div>
    </Card>
  )
}
