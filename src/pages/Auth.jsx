import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Lock, Mail, Phone, User } from 'lucide-react'
import { Button, Card, Input } from '../design-system'
import { useAppointmentStore } from '../store/appointmentStore'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { loginSchema, registerSchema } from '../schemas/authSchema'
import { formatPhoneBR } from '../utils/br'
import { DEFAULT_DURATION_TIERS } from '../utils/pricing'
import { useState } from 'react'

function redirectFor(role) {
  return role === 'admin' ? '/admin/dashboard' : role === 'barber' ? '/barber/dashboard' : '/client/dashboard'
}

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const { notify } = useToastStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })
  const submit = async (data) => {
    try {
      const user = login(data)
      notify({ type: 'success', title: 'Login realizado', message: `Bem-vindo, ${user.name}` })
      navigate(redirectFor(user.role))
    } catch (error) {
      notify({ type: 'error', title: 'Erro no login', message: error.message })
    }
  }
  return (
    <AuthFrame title="Entrar">
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        <Input label="E-mail" prefix={<Mail className="h-4 w-4" />} {...register('email')} error={errors.email?.message} />
        <Input label="Senha" type="password" prefix={<Lock className="h-4 w-4" />} {...register('password')} error={errors.password?.message} />
        <Button loading={isSubmitting}>Acessar painel</Button>
      </form>
    </AuthFrame>
  )
}

export function Register() {
  const [accountType, setAccountType] = useState('client')
  const navigate = useNavigate()
  const { register: createUser } = useAuthStore()
  const { upsertBarber } = useAppointmentStore()
  const { notify } = useToastStore()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { role: 'client' } })
  const selectType = (role) => {
    setAccountType(role)
    setValue('role', role, { shouldValidate: true })
  }
  const submit = async (data) => {
    try {
      const user = createUser({ ...data, role: accountType })
      if (user.role === 'barber') {
        upsertBarber({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          active: true,
          specialties: [],
          specialtyOptionIds: [],
          pricingModel: 'fixed',
          minuteRate: 1.5,
          durationTiers: DEFAULT_DURATION_TIERS,
        })
      }
      notify({ type: 'success', title: 'Conta criada', message: 'Seu dashboard esta pronto.' })
      navigate(redirectFor(user.role))
    } catch (error) {
      notify({ type: 'error', title: 'Cadastro bloqueado', message: error.message })
    }
  }
  return (
    <AuthFrame title="Criar conta">
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
        <div className="grid grid-cols-2 gap-2 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-1">
          {[
            ['client', 'Cliente'],
            ['barber', 'Barbeiro'],
          ].map(([role, label]) => (
            <button key={role} type="button" onClick={() => selectType(role)} className={`rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition ${accountType === role ? 'bg-[var(--accent-default)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'}`}>
              {label}
            </button>
          ))}
        </div>
        <input type="hidden" {...register('role')} />
        <Input label="Nome" prefix={<User className="h-4 w-4" />} {...register('name')} error={errors.name?.message} />
        <Input label="Telefone" prefix={<Phone className="h-4 w-4" />} {...register('phone', { onChange: (event) => setValue('phone', formatPhoneBR(event.target.value), { shouldValidate: true }) })} error={errors.phone?.message} />
        <Input label="E-mail" prefix={<Mail className="h-4 w-4" />} {...register('email')} error={errors.email?.message} />
        <Input label="Senha" type="password" prefix={<Lock className="h-4 w-4" />} {...register('password')} error={errors.password?.message} />
        <Input label="Confirmar senha" type="password" prefix={<Lock className="h-4 w-4" />} {...register('confirmPassword')} error={errors.confirmPassword?.message} />
        <Button loading={isSubmitting}>Cadastrar</Button>
      </form>
    </AuthFrame>
  )
}

function AuthFrame({ title, children }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-block text-sm font-semibold text-[var(--accent-text)]">Barber Prime</Link>
        <h1 className="mb-6 font-display text-3xl font-bold">{title}</h1>
        {children}
        <div className="mt-6 flex justify-between text-sm text-[var(--text-secondary)]">
          <Link to="/login">Login</Link>
          <Link to="/register">Cadastro</Link>
        </div>
      </Card>
    </main>
  )
}
