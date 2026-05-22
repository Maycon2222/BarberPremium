import { useState } from 'react'
import { Button, Card, Input } from '../../design-system'
import { Page } from '../../components/shared/AppLayout'
import { useAppointmentStore } from '../../store/appointmentStore'

export function AdminSettings() {
  const { settings, saveSettings } = useAppointmentStore()
  const [draft, setDraft] = useState(settings)
  const invalidHours = draft.start >= draft.end
  const invalidInterval = Number(draft.interval) < 5
  return (
    <Page className="max-w-xl">
      <Card>
        <h2 className="mb-4 font-display text-3xl font-bold">Configuracoes</h2>
        <div className="grid gap-4">
          <Input label="Nome da barbearia" value={draft.shopName} onChange={(event) => setDraft({ ...draft, shopName: event.target.value })} />
          <Input label="Inicio" type="time" value={draft.start} onChange={(event) => setDraft({ ...draft, start: event.target.value })} />
          <Input label="Fim" type="time" value={draft.end} onChange={(event) => setDraft({ ...draft, end: event.target.value })} error={invalidHours ? 'Fim deve ser depois do inicio' : ''} />
          <Input label="Intervalo em minutos" type="number" min="5" step="5" value={draft.interval} onChange={(event) => setDraft({ ...draft, interval: Number(event.target.value) })} error={invalidInterval ? 'Intervalo minimo de 5 minutos' : ''} />
          <Button disabled={invalidHours || invalidInterval} onClick={() => saveSettings(draft)}>Salvar configuracoes</Button>
        </div>
      </Card>
    </Page>
  )
}
