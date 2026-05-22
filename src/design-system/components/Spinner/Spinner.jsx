import { Loader2 } from 'lucide-react'
import { cn } from '../../utils'

export function Spinner({ className = '' }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-[var(--accent-default)]', className)} />
}

export function Skeleton({ className = '' }) {
  return <div className={cn('animate-pulse rounded-[var(--radius-md)] bg-[var(--bg-subtle)]', className)} />
}
