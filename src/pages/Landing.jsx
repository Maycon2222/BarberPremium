import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarCheck, Moon, Scissors, ShieldCheck, Sparkles, Sun } from 'lucide-react'
import { Button, Card, ToastViewport, useTheme } from '../design-system'
import { useToastStore } from '../store/toastStore'
import { SERVICES, money } from '../utils/pricing'

export function Landing() {
  const { theme, toggle } = useTheme()
  const { toasts } = useToastStore()
  return (
    <main className="page-shell">
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-[var(--border-default)] bg-[var(--bg-base)]/75 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-[var(--accent-text)]"><Scissors className="h-5 w-5" /> Barber Prime</Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggle}>{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
            <Link to="/login"><Button variant="secondary">Entrar</Button></Link>
            <Link to="/client/book"><Button>Agendar</Button></Link>
          </div>
        </div>
      </header>
      <section className="relative flex min-h-[92vh] items-center overflow-hidden px-4 pt-24">
        <div className="absolute inset-0 bg-[#12131a] bg-[linear-gradient(120deg,rgba(0,0,0,.45),transparent),url('https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center opacity-45" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-4 inline-flex rounded-full border border-[var(--border-default)] bg-[var(--accent-subtle)] px-3 py-1 text-sm font-semibold text-[var(--accent-text)]">Agenda premium para barbearias</p>
            <h1 className="max-w-3xl font-display text-5xl font-bold leading-tight md:text-6xl">Barber Prime</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">Agendamento online, pagamentos simbolicos, comprovante instantaneo e operacao completa para cliente, barbeiro e administrador.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/client/book"><Button size="lg"><CalendarCheck className="h-5 w-5" /> Novo agendamento</Button></Link>
              <Link to="/register"><Button variant="secondary" size="lg">Criar conta</Button></Link>
            </div>
          </motion.div>
          <Card className="bg-[var(--bg-surface)]/86 backdrop-blur">
            <div className="grid gap-4 sm:grid-cols-3">
              {[['Hoje', '18', CalendarCheck], ['Ticket medio', 'R$ 8', Sparkles], ['No-show', '3%', ShieldCheck]].map(([label, value, Icon]) => (
                <div key={label} className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-4">
                  <Icon className="mb-4 h-5 w-5 text-[var(--accent-default)]" />
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Servicos</p>
            <h2 className="font-display text-3xl font-bold">Menu claro, preco direto</h2>
          </div>
          <Link to="/client/book"><Button variant="secondary">Ver horarios</Button></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <Card key={service.id} hover>
              <p className="font-semibold">{service.name}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{service.duration} min</p>
              <p className="mt-6 text-2xl font-bold text-[var(--accent-text)]">{money(service.price)}</p>
            </Card>
          ))}
        </div>
      </section>
      <ToastViewport toasts={toasts} />
    </main>
  )
}
