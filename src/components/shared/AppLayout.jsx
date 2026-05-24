import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Boxes, CalendarDays, Home, LogOut, Menu, Moon, Scissors, Settings, Sun, UserCircle, UserCog, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Button, ToastViewport, useTheme } from '../../design-system'
import { useAppointmentStore } from '../../store/appointmentStore'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'

const roleNav = {
  client: [
    ['Dashboard', '/client/dashboard', Home, 'today'],
    ['Agendar', '/explore', CalendarDays],
    ['Historico', '/client/history', Scissors],
    ['Perfil', '/client/profile', UserCircle],
  ],
  barber: [
    ['Hoje', '/barber/dashboard', CalendarDays, 'today'],
    ['Semana', '/barber/week', Home],
    ['Servicos', '/barber/services', Scissors],
    ['Historico', '/barber/history', Scissors],
    ['Perfil', '/barber/profile', UserCircle],
  ],
  admin: [
    ['Dashboard', '/admin/dashboard', Home],
    ['Barbeiros', '/admin/barbers', Users],
    ['Servicos', '/admin/services', Scissors],
    ['Produtos', '/admin/products', Boxes],
    ['Agendamentos', '/admin/appointments', CalendarDays, 'today'],
    ['Relatorios', '/admin/reports', UserCog],
    ['Config', '/admin/settings', Settings],
  ],
  owner: [
    ['Dashboard', '/owner/dashboard', Home],
    ['Barbeiros', '/owner/barbers', Users],
    ['Servicos', '/owner/services', Scissors],
    ['Agendamentos', '/owner/appointments', CalendarDays, 'today'],
    ['Config', '/owner/settings', Settings],
    ['Perfil', '/owner/profile', UserCircle],
  ],
}

export function Shell({ role }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const { appointments } = useAppointmentStore()
  const { theme, toggle } = useTheme()
  const { toasts } = useToastStore()
  const navigate = useNavigate()
  const nav = roleNav[role] || []
  const todayCount = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return appointments.filter((appointment) => {
      if (appointment.date !== today || appointment.status === 'cancelled') return false
      if (role === 'client') return appointment.clientId === user?.id || appointment.clientEmail === user?.email
      if (role === 'barber') return appointment.barberId === user?.id
      if (role === 'owner') return appointment.shopId === user?.shopId
      return true
    }).length
  }, [appointments, role, user?.email, user?.id, user?.shopId])

  useEffect(() => {
    const syncAppointments = (event) => {
      if (event.key !== 'barber-appointments') return
      useAppointmentStore.setState({ appointments: JSON.parse(event.newValue || '[]') })
    }
    window.addEventListener('storage', syncAppointments)
    return () => window.removeEventListener('storage', syncAppointments)
  }, [])

  return (
    <div className="page-shell grid min-h-screen lg:grid-cols-[auto_1fr]">
      <motion.aside animate={{ width: collapsed ? 82 : 260 }} className="hidden border-r border-[var(--border-default)] bg-[var(--bg-surface)] p-4 lg:block">
        <div className="mb-8 flex items-center justify-between">
          {!collapsed ? <p className="font-display text-xl font-bold text-[var(--accent-text)]">Barber Prime</p> : <Scissors className="h-6 w-6 text-[var(--accent-default)]" />}
          <Button variant="ghost" size="sm" onClick={() => setCollapsed((value) => !value)} aria-label="Alternar sidebar">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-2">
          {nav.map(([label, to, Icon, badge]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'}`}>
              <Icon className="h-4 w-4" />
              {!collapsed ? label : null}
              {!collapsed && badge === 'today' && todayCount > 0 ? <span className="ml-auto rounded-full bg-[var(--accent-default)] px-2 py-0.5 text-xs text-white">{todayCount}</span> : null}
            </NavLink>
          ))}
        </nav>
      </motion.aside>
      <main className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-base)]/88 px-4 py-3 backdrop-blur lg:px-8">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">Sessao {role}</p>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold">{user?.name || 'Visitante'}</h1>
              {todayCount > 0 ? <span className="rounded-full bg-[var(--accent-subtle)] px-2 py-1 text-xs font-semibold text-[var(--accent-text)]">Hoje: {todayCount}</span> : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggle} aria-label="Alternar tema">{theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
            <Button variant="secondary" size="sm" onClick={() => { logout(); navigate('/') }}><LogOut className="h-4 w-4" /> Sair</Button>
          </div>
        </header>
        <div className="p-4 pb-24 lg:p-8">
          <Outlet />
        </div>
        <nav className="fixed bottom-0 left-0 right-0 z-30 flex justify-around gap-1 border-t border-[var(--border-default)] bg-[var(--bg-surface)]/96 px-2 py-2 shadow-[0_-12px_30px_rgba(0,0,0,.16)] backdrop-blur lg:hidden">
          {nav.map(([label, to, Icon, badge]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `relative inline-flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-2 text-[11px] font-semibold ${isActive ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)]' : 'text-[var(--text-secondary)]'}`}>
              <Icon className="h-4 w-4" />
              <span className="max-w-full truncate">{label}</span>
              {badge === 'today' && todayCount > 0 ? <span className="absolute right-2 top-1 rounded-full bg-[var(--accent-default)] px-1.5 text-[10px] leading-4 text-white">{todayCount}</span> : null}
            </NavLink>
          ))}
        </nav>
      </main>
      <ToastViewport toasts={toasts} />
    </div>
  )
}

export function Page({ children, className = '' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} className={className}>
      {children}
    </motion.div>
  )
}
