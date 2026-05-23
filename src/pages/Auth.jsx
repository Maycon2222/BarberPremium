import { useState } from 'react'
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
import { brDateToISO, formatBirthDate, formatCNPJ, formatCPF, sanitizeDocument } from '../utils/documentValidation'
import { verifyCNPJ, verifyCPF } from '../services/documentVerification'

const ALLOW_UNVERIFIED_IDENTITY = import.meta.env.VITE_ALLOW_UNVERIFIED_IDENTITY === 'true'

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
  const [verifyStatus, setVerifyStatus] = useState('')
  const navigate = useNavigate()
  const { register: createUser, users } = useAuthStore()
  const { upsertBarber } = useAppointmentStore()
  const { notify } = useToastStore()
  const { register, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { role: 'client' } })
  const selectType = (role) => {
    setAccountType(role)
    setValue('role', role, { shouldValidate: true })
  }
  const submit = async (data) => {
    try {
      const identityPayload = accountType === 'client'
        ? await prepareClientIdentity(data, users, setError, setVerifyStatus, notify)
        : await prepareBarberIdentity(data, users, setError, setVerifyStatus, notify)
      if (!identityPayload) return

      const user = createUser({ ...data, ...identityPayload, role: accountType })
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
    } finally {
      setVerifyStatus('')
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
        {accountType === 'client' ? (
          <>
            <Input label="CPF" {...register('cpf', { onChange: (event) => setValue('cpf', formatCPF(event.target.value), { shouldValidate: true }) })} error={errors.cpf?.message} />
            <Input label="Nome completo" {...register('fullName')} error={errors.fullName?.message} />
            <Input label="Data de nascimento" placeholder="DD/MM/AAAA" {...register('birthDate', { onChange: (event) => setValue('birthDate', formatBirthDate(event.target.value), { shouldValidate: true }) })} error={errors.birthDate?.message} />
          </>
        ) : (
          <>
            <Input label="CNPJ" {...register('cnpj', { onChange: (event) => setValue('cnpj', formatCNPJ(event.target.value), { shouldValidate: true }) })} error={errors.cnpj?.message} />
            <Input label="Razao social" {...register('razaoSocial')} error={errors.razaoSocial?.message} />
          </>
        )}
        <Input label="Telefone" prefix={<Phone className="h-4 w-4" />} {...register('phone', { onChange: (event) => setValue('phone', formatPhoneBR(event.target.value), { shouldValidate: true }) })} error={errors.phone?.message} />
        <Input label="E-mail" prefix={<Mail className="h-4 w-4" />} {...register('email')} error={errors.email?.message} />
        <Input label="Senha" type="password" prefix={<Lock className="h-4 w-4" />} {...register('password')} error={errors.password?.message} />
        <Input label="Confirmar senha" type="password" prefix={<Lock className="h-4 w-4" />} {...register('confirmPassword')} error={errors.confirmPassword?.message} />
        <Button loading={isSubmitting}>{verifyStatus || 'Cadastrar'}</Button>
      </form>
    </AuthFrame>
  )
}

async function prepareClientIdentity(data, users, setError, setVerifyStatus, notify) {
  const cpf = sanitizeDocument(data.cpf)
  if (users.some((user) => sanitizeDocument(user.cpf || '') === cpf)) {
    setError('cpf', { message: 'Este CPF ja possui uma conta. Faca login.' })
    return null
  }

  setVerifyStatus('Verificando CPF...')
  const verification = await verifyCPF({
    cpf,
    name: data.fullName,
    birthDate: brDateToISO(data.birthDate),
  })

  if (verification.reason === 'data_mismatch') {
    const fieldMap = {
      nome: ['fullName', 'O nome informado nao corresponde ao CPF cadastrado.'],
      data_nascimento: ['birthDate', 'A data de nascimento nao corresponde ao CPF cadastrado.'],
    }
    const [field, message] = fieldMap[verification.field] || fieldMap.nome
    setError(field, { message })
    return null
  }

  if (!verification.verified && !ALLOW_UNVERIFIED_IDENTITY) {
    setError('cpf', { message: 'Nao foi possivel confirmar CPF, nome e nascimento. Configure a verificacao Serpro para cadastrar este CPF.' })
    notify({ type: 'error', title: 'Cadastro bloqueado', message: 'CPF valido no formato nao confirma identidade sem consulta externa.' })
    return null
  }

  if (!verification.verified) {
    notify({ type: 'info', title: 'Verificacao pendente', message: 'Nao foi possivel verificar seus dados agora. Seu cadastro foi salvo e sera revisado.' })
  }

  return {
    cpf,
    fullName: data.fullName,
    birthDate: brDateToISO(data.birthDate),
    verified: verification.verified,
    verifiedAt: verification.verified ? new Date().toISOString() : null,
  }
}

async function prepareBarberIdentity(data, users, setError, setVerifyStatus, notify) {
  const cnpj = sanitizeDocument(data.cnpj)
  if (users.some((user) => sanitizeDocument(user.cnpj || '') === cnpj)) {
    setError('cnpj', { message: 'Este CNPJ ja possui uma conta cadastrada.' })
    return null
  }

  setVerifyStatus('Consultando Receita Federal...')
  const verification = await verifyCNPJ(cnpj)
  if (verification.reason === 'not_found') {
    setError('cnpj', { message: 'CNPJ nao encontrado na Receita Federal.' })
    return null
  }
  if (verification.reason === 'inactive') {
    setError('cnpj', { message: `Este CNPJ esta com situacao '${verification.situacao}' na Receita Federal.` })
    return null
  }
  if (verification.verified && verification.razaoSocial && similarity(verification.razaoSocial, data.razaoSocial) < 0.8) {
    notify({ type: 'info', title: 'Razao social divergente', message: `Retornado pela Receita: ${verification.razaoSocial}` })
  }
  if (!verification.verified) {
    notify({ type: 'info', title: 'Verificacao pendente', message: 'Nao foi possivel verificar seus dados agora. Seu cadastro foi salvo e sera revisado.' })
  }

  return {
    cnpj,
    razaoSocial: data.razaoSocial,
    verified: verification.verified,
    verifiedAt: verification.verified ? new Date().toISOString() : null,
  }
}

function similarity(left = '', right = '') {
  const leftTokens = normalizeText(left).split(' ').filter(Boolean)
  const rightTokens = normalizeText(right).split(' ').filter(Boolean)
  if (!leftTokens.length || !rightTokens.length) return 0
  const matches = leftTokens.filter((token) => rightTokens.includes(token)).length
  return matches / Math.max(leftTokens.length, rightTokens.length)
}

function normalizeText(value = '') {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase()
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
