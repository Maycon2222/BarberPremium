import { cn } from '../../utils'

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-14 w-14 text-base' }
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border-default)] bg-[var(--accent-subtle)] font-bold text-[var(--accent-text)]', sizes[size], className)}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : initials(name)}
    </span>
  )
}
