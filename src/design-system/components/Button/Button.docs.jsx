import { Button } from './Button'

export function ButtonDocs() {
  return (
    <section>
      <h3>Button</h3>
      <Button>Confirmar</Button>
      <Button variant="secondary">Secundario</Button>
      <Button variant="ghost">Fantasma</Button>
      <Button variant="danger">Excluir</Button>
    </section>
  )
}

/*
PROP TABLE:
| Prop | Type | Default | Description |
| variant | primary, secondary, ghost, danger | primary | Visual intent |
| size | sm, md, lg | md | Button density |
| loading | boolean | false | Shows spinner and disables |
*/
