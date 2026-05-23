import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarCheck, MapPin, Star } from 'lucide-react'
import { Avatar, Button, Card, Modal } from '../design-system'
import { useAppointmentStore } from '../store/appointmentStore'
import { useAuthStore } from '../store/authStore'
import { useShopStore } from '../store/shopStore'
import { money } from '../utils/pricing'

export function ShopPage() {
  const { slug } = useParams()
  const { shops } = useShopStore()
  const { barbers } = useAppointmentStore()
  const { user, updateProfile } = useAuthStore()
  const [selectedBarber, setSelectedBarber] = useState(null)
  const shop = shops.find((item) => item.slug === slug)
  if (!shop) return <main className="grid min-h-screen place-items-center">Barbearia nao encontrada.</main>
  const shopBarbers = barbers.filter((barber) => barber.shopId === shop.id && barber.active)

  const markRecent = () => {
    if (!user || user.role !== 'client') return
    const recent = [shop.id, ...(user.recentShopIds || []).filter((id) => id !== shop.id)].slice(0, 5)
    updateProfile({ recentShopIds: recent })
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)]">
      <section className="relative min-h-[320px] overflow-hidden">
        {shop.coverImage ? <img src={shop.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
        <div className="relative mx-auto flex min-h-[320px] max-w-7xl items-end px-4 pb-8">
          <div>
            <Link to="/explore" className="mb-4 inline-block text-sm font-semibold text-white/80">Voltar para explorar</Link>
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid h-20 w-20 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-default)] font-display text-2xl font-bold text-white">{shop.name.slice(0, 2).toUpperCase()}</div>
              <div>
                <h1 className="font-display text-5xl font-bold text-white">{shop.name}</h1>
                <p className="mt-2 flex flex-wrap items-center gap-3 text-white/80"><span className="flex items-center gap-1 text-amber-300"><Star className="h-4 w-4 fill-amber-300" /> 4.8</span><span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {shop.address}</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Barbeiros</p>
          <h2 className="font-display text-3xl font-bold">Escolha quem vai te atender</h2>
          <p className="mt-2 text-[var(--text-secondary)]">{shop.description}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shopBarbers.map((barber) => (
            <button key={barber.id} type="button" onClick={() => setSelectedBarber(barber)} className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left transition hover:-translate-y-1 hover:border-[var(--accent-default)]">
              <Avatar name={barber.name} size="lg" />
              <h3 className="mt-4 font-display text-xl font-bold">{barber.name}</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{barber.bio || 'Barbeiro da casa.'}</p>
              <p className="mt-3 text-sm text-amber-400"><Star className="mr-1 inline h-4 w-4 fill-amber-400" /> 4.8 · 23 cortes este mes</p>
            </button>
          ))}
        </div>
      </section>

      <Modal open={Boolean(selectedBarber)} title={selectedBarber?.name || 'Barbeiro'} onClose={() => setSelectedBarber(null)}>
        {selectedBarber ? (
          <div className="grid gap-4">
            <p className="text-sm text-[var(--text-secondary)]">{selectedBarber.bio || 'Servicos oferecidos por este barbeiro.'}</p>
            <div className="grid gap-2">
              {shop.services.filter((service) => selectedBarber.offeredServiceIds?.includes(service.id)).map((service) => (
                <div key={service.id} className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-3">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{service.estimatedMinutes} min</p>
                  </div>
                  <p className="font-bold text-[var(--accent-text)]">{money(selectedBarber.customPrices?.[service.id] || service.price)}</p>
                </div>
              ))}
            </div>
            <Link to={`/client/book?shopId=${shop.id}&barberId=${selectedBarber.id}`} onClick={markRecent}>
              <Button className="w-full"><CalendarCheck className="h-4 w-4" /> Agendar com {selectedBarber.name}</Button>
            </Link>
          </div>
        ) : null}
      </Modal>
    </main>
  )
}
