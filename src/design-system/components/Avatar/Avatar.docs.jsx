import { Avatar } from './Avatar'

export function AvatarDocs() {
  return <Avatar name="Joao Silva" size="lg" />
}

/*
PROP TABLE:
| Prop | Type | Default | Description |
| name | string | - | Name used for alt/fallback initials |
| src | string | - | Optional image source |
| size | sm, md, lg | md | Avatar dimensions |
*/
