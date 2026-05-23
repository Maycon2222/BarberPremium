import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Lock, Mail, Phone, User } from 'lucide-react'
import { Button, Card, Input } from '../design-system'
import { ImageUpload } from '../components/shared/ImageUpload'
import { useAuthStore } from '../store/authStore'
import { useShopStore } from '../store/shopStore'
import { useToastStore } from '../store/toastStore'
import { formatPhoneBR, isPhoneBR } from '../utils/br'
import { brDateToISO, formatBirthDate, formatCNPJ, formatCPF, hasFullName, isAdultBirthDate, sanitizeDocument, validateCNPJ, validateCPF } from '../utils/documentValidation'
import { verifyCNPJ } from '../services/documentVerification'

const days = [
  [1, 'Seg'],
  [2, 'Ter'],
  [3, 'Qua'],
  [4, 'Qui'],
  [5, 'Sex'],
  [6, 'Sab'],
  [0, 'Dom'],
]

export function ShopRegister() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({
    shopName: '',
    cnpj: '',
    razaoSocial: '',
    address: '',
    shopPhone: '',
    description: '',
    logo: null,
    coverImage: null,
    ownerName: '',
    cpf: '',
    birthDate: '',
    email: '',
    password: '',
    start: '08:00',
    end: '19:00',
    workingDays: [1, 2, 3, 4, 5, 6],
    slotInterval: 30,
  })
  const { register } = useAuthStore()
  const { registerShop } = useShopStore()
  const { notify } = useToastStore()
  const navigate = useNavigate()
  const update = (patch) => setData((current) => ({ ...current, ...patch }))

  const submit = async () => {
    const localError = validateAll(data)
    if (localError) {
      notify({ type: 'error', title: 'Cadastro incompleto', message: localError })
      return
    }
    try {
      setLoading(true)
      const cnpj = sanitizeDocument(data.cnpj)
      const cnpjVerification = await verifyCNPJ(cnpj)
      if (cnpjVerification.reason === 'not_found' || cnpjVerification.reason === 'inactive') {
        notify({ type: 'error', title: 'CNPJ bloqueado', message: cnpjVerification.message })
        return
      }
      const shopId = `shop-${Date.now()}`
      const shop = registerShop({
        id: shopId,
        name: data.shopName,
        slug: slugify(data.shopName),
        logo: data.logo,
        coverImage: data.coverImage,
        description: data.description,
        address: data.address,
        phone: data.shopPhone,
        cnpj,
        razaoSocial: data.razaoSocial,
        verified: cnpjVerification.verified,
        verifiedAt: cnpjVerification.verified ? new Date().toISOString() : null,
        settings: {
          workingHours: { start: data.start, end: data.end },
          workingDays: data.workingDays,
          slotInterval: Number(data.slotInterval),
          currency: 'BRL',
        },
        services: [],
      })
      register({
        name: data.ownerName,
        email: data.email,
        password: data.password,
        phone: data.shopPhone,
        role: 'owner',
        shopId: shop.id,
        cpf: sanitizeDocument(data.cpf),
        fullName: data.ownerName,
        birthDate: brDateToISO(data.birthDate),
        cnpj,
        razaoSocial: data.razaoSocial,
        verified: cnpjVerification.verified,
        verifiedAt: cnpjVerification.verified ? new Date().toISOString() : null,
      })
      notify({ type: 'success', title: 'Barbearia cadastrada', message: 'Bem-vindo ao painel do owner.' })
      navigate('/owner/dashboard')
    } catch (error) {
      notify({ type: 'error', title: 'Nao foi possivel cadastrar', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-base)] px-4 py-8">
      <Card className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Cadastro da barbearia</p>
        <h1 className="mb-6 font-display text-3xl font-bold">Crie sua unidade na Barber Prime</h1>
        <div className="mb-6 grid grid-cols-3 gap-2">
          {['Barbearia', 'Responsavel', 'Configuracao'].map((label, index) => <div key={label} className={`rounded-[var(--radius-md)] px-3 py-2 text-center text-sm font-semibold ${step === index ? 'bg-[var(--accent-default)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'}`}>{label}</div>)}
        </div>

        {step === 0 ? <ShopStep data={data} update={update} /> : null}
        {step === 1 ? <OwnerStep data={data} update={update} /> : null}
        {step === 2 ? <SettingsStep data={data} update={update} /> : null}

        <div className="mt-6 flex justify-between">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>Voltar</Button>
          {step < 2 ? <Button onClick={() => setStep((value) => value + 1)}>Continuar</Button> : <Button loading={loading} onClick={submit}>Cadastrar barbearia</Button>}
        </div>
      </Card>
    </main>
  )
}

function ShopStep({ data, update }) {
  return (
    <div className="grid gap-4">
      <Input label="Nome da barbearia" prefix={<Building2 className="h-4 w-4" />} value={data.shopName} onChange={(event) => update({ shopName: event.target.value })} />
      <Input label="CNPJ" value={data.cnpj} onChange={(event) => update({ cnpj: formatCNPJ(event.target.value) })} />
      <Input label="Razao social" value={data.razaoSocial} onChange={(event) => update({ razaoSocial: event.target.value })} />
      <Input label="Endereco completo" value={data.address} onChange={(event) => update({ address: event.target.value })} />
      <Input label="Telefone da barbearia" prefix={<Phone className="h-4 w-4" />} value={data.shopPhone} onChange={(event) => update({ shopPhone: formatPhoneBR(event.target.value) })} />
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Descricao</span>
        <textarea maxLength={300} value={data.description} onChange={(event) => update({ description: event.target.value })} className="min-h-28 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-3 outline-none" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <ImageUpload value={data.logo} onChange={(logo) => update({ logo })} shape="circle" maxSizeMB={2} placeholder="Logo" />
        <ImageUpload value={data.coverImage} onChange={(coverImage) => update({ coverImage })} aspectRatio="16:9" maxSizeMB={5} placeholder="Foto de capa" />
      </div>
    </div>
  )
}

function OwnerStep({ data, update }) {
  return (
    <div className="grid gap-4">
      <Input label="Nome completo" prefix={<User className="h-4 w-4" />} value={data.ownerName} onChange={(event) => update({ ownerName: event.target.value })} />
      <Input label="CPF" value={data.cpf} onChange={(event) => update({ cpf: formatCPF(event.target.value) })} />
      <Input label="Data de nascimento" value={data.birthDate} onChange={(event) => update({ birthDate: formatBirthDate(event.target.value) })} />
      <Input label="E-mail" type="email" prefix={<Mail className="h-4 w-4" />} value={data.email} onChange={(event) => update({ email: event.target.value })} />
      <Input label="Senha" type="password" prefix={<Lock className="h-4 w-4" />} value={data.password} onChange={(event) => update({ password: event.target.value })} />
    </div>
  )
}

function SettingsStep({ data, update }) {
  const toggleDay = (day) => {
    const workingDays = data.workingDays.includes(day) ? data.workingDays.filter((item) => item !== day) : [...data.workingDays, day]
    update({ workingDays })
  }
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Inicio" type="time" value={data.start} onChange={(event) => update({ start: event.target.value })} />
        <Input label="Fim" type="time" value={data.end} onChange={(event) => update({ end: event.target.value })} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-[var(--text-secondary)]">Dias de funcionamento</p>
        <div className="flex flex-wrap gap-2">
          {days.map(([day, label]) => <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-[var(--radius-md)] px-3 py-2 text-sm font-semibold ${data.workingDays.includes(day) ? 'bg-[var(--accent-default)] text-white' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'}`}>{label}</button>)}
        </div>
      </div>
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase text-[var(--text-secondary)]">Intervalo</span>
        <select value={data.slotInterval} onChange={(event) => update({ slotInterval: Number(event.target.value) })} className="h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3">
          {[15, 30, 45, 60].map((value) => <option key={value} value={value}>{value} minutos</option>)}
        </select>
      </label>
    </div>
  )
}

function validateAll(data) {
  if (data.shopName.trim().length < 3) return 'Informe o nome da barbearia.'
  if (!validateCNPJ(data.cnpj).valid) return 'CNPJ invalido.'
  if (data.razaoSocial.trim().length < 3) return 'Informe a razao social.'
  if (data.address.trim().length < 6) return 'Informe o endereco completo.'
  if (!isPhoneBR(data.shopPhone)) return 'Telefone da barbearia invalido.'
  if (!hasFullName(data.ownerName)) return 'Informe nome e sobrenome do responsavel.'
  if (!validateCPF(data.cpf).valid) return 'CPF do responsavel invalido.'
  if (!isAdultBirthDate(data.birthDate)) return 'Responsavel deve ter 18 anos ou mais.'
  if (!data.email.includes('@')) return 'E-mail invalido.'
  if (data.password.length < 6) return 'Senha deve ter ao menos 6 caracteres.'
  if (!data.workingDays.length) return 'Selecione ao menos um dia de funcionamento.'
  return ''
}

function slugify(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
