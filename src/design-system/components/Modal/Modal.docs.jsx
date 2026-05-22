import { Modal } from './Modal'

export function ModalDocs() {
  return <Modal open title="Confirmar acao" onClose={() => {}}>Conteudo do modal animado.</Modal>
}

/*
PROP TABLE:
| Prop | Type | Default | Description |
| open | boolean | false | Controls visibility |
| title | string | - | Modal heading |
| onClose | function | - | Close handler |
*/
