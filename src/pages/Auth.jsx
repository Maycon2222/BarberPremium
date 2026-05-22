import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Lock, Mail, Phone, User } from 'lucide-react'
import { Button, Card, Input } from '../design-system'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { loginSchema, registerSchema } from '../schemas/authSchema'
import { formatPhoneBR } from '../utils/br'

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
  const navigate = useNavigate()
  const { register: createUser } = useAuthStore()
  const { notify } = useToastStore()
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema) })
  const submit = async (data) => {
    try {
      const user = createUser(data)
      notify({ type: 'success', title: 'Conta criada', message: 'Seu dashboard esta pronto.' })
      navigate(redirectFor(user.role))
    } catch (error) {
      notify({ type: 'error', title: 'Cadastro bloqueado', message: error.message })
    }
  }
  return (
    <AuthFrame title="Criar conta">
      <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
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
