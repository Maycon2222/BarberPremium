import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils'

const variants = {
  primary: 'bg-[var(--accent-default)] text-[var(--text-inverse)] hover:bg-[var(--accent-hover)] shadow-[var(--shadow-glow)]',
  secondary: 'bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-default)]',
  ghost: 'bg-transparent text-[var(--text-primary)] hover:bg-[var(--accent-subtle)]',
  danger: 'bg-[var(--status-cancelled)] text-white hover:brightness-110',
}

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
}

export const Button = forwardRef(({ variant = 'primary', size = 'md', loading = false, disabled = false, className = '', children, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled || loading}
    className={cn(
      'inline-flex min-w-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-default)] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-default)] disabled:cursor-not-allowed disabled:opacity-55',
      variants[variant],
      sizes[size],
      className,
    )}
    {...props}
  >
    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
    {children}
  </button>
))
Button.displayName = 'Button'
