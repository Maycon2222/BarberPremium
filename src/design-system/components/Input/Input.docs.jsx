import { Mail } from 'lucide-react'
import { Input } from './Input'

export function InputDocs() {
  return <Input label="E-mail" placeholder="cliente@email.com" prefix={<Mail className="h-4 w-4" />} hint="Usado para login e recibos." />
}

/*
PROP TABLE:
| Prop | Type | Default | Description |
| label | string | - | Field label |
| error | string | - | Validation message |
| prefix/suffix | ReactNode | - | Inline adornments |
*/
