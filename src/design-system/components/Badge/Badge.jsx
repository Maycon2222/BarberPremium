import { cn } from '../../utils'

const variants = {
  pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  confirmed: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  completed: 'bg-green-500/15 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
  neutral: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
}

export function Badge({ status = 'neutral', children, className = '' }) {
  return <span className={cn('inline-flex items-center rounded-[var(--radius-full)] border px-2.5 py-1 text-xs font-semibold', variants[status] || variants.neutral, className)}>{children}</span>
}
