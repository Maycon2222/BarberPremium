import { Badge } from './Badge'

export function BadgeDocs() {
  return (
    <div>
      <Badge status="pending">Pendente</Badge>
      <Badge status="confirmed">Confirmado</Badge>
      <Badge status="completed">Concluido</Badge>
      <Badge status="cancelled">Cancelado</Badge>
    </div>
  )
}

/*
PROP TABLE:
| Prop | Type | Default | Description |
| status | pending, confirmed, completed, cancelled, neutral | neutral | Status color |
*/
