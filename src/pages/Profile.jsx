import { useState } from 'react'
import { Button, Card, Input } from '../design-system'
import { Page } from '../components/shared/AppLayout'
import { useAuthStore } from '../store/authStore'
import { useToastStore } from '../store/toastStore'
import { formatPhoneBR, isPhoneBR } from '../utils/br'

export function Profile() {
  const { user, updateProfile } = useAuthStore()
  const { notify } = useToastStore()
  const [draft, setDraft] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const phoneError = draft.phone && !isPhoneBR(draft.phone) ? 'Telefone invalido' : ''
  const invalid = draft.name.trim().length < 3 || !draft.email.includes('@') || Boolean(phoneError)

  const save = () => {
    updateProfile(draft)
    notify({ type: 'success', title: 'Perfil atualizado', message: 'Seus dados foram salvos.' })
  }

  return (
    <Page className="mx-auto max-w-2xl">
      <Card>
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase text-[var(--accent-text)]">Perfil</p>
          <h2 className="font-display text-3xl font-bold">Dados da conta</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Atualize os dados usados nos agendamentos e avisos do sistema.</p>
        </div>
        <div className="grid gap-4">
          <Input label="Nome" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <Input label="E-mail" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} />
          <Input label="Telefone" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: formatPhoneBR(event.target.value) })} error={phoneError} />
          <div className="rounded-[var(--radius-md)] bg-[var(--bg-subtle)] p-4 text-sm text-[var(--text-secondary)]">
            Alteracao de senha e verificacao de contato ficam preparadas para uma etapa futura com backend real.
          </div>
          <Button disabled={invalid} onClick={save}>Salvar perfil</Button>
        </div>
      </Card>
    </Page>
  )
}
