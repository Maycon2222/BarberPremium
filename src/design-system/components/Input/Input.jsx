import { forwardRef } from 'react'
import { cn } from '../../utils'

export const Input = forwardRef(({ label, error, hint, prefix, suffix, className = '', ...props }, ref) => (
  <label className="block">
    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{label}</span>
    <span
      className={cn(
        'flex h-12 items-center gap-2 rounded-[var(--radius-md)] border bg-[var(--bg-elevated)] px-3 text-[var(--text-primary)] transition focus-within:border-[var(--accent-default)] focus-within:ring-2 focus-within:ring-[var(--accent-subtle)]',
        error ? 'border-[var(--status-cancelled)]' : 'border-[var(--border-default)]',
        className,
      )}
    >
      {prefix ? <span className="text-[var(--text-secondary)]">{prefix}</span> : null}
      <input ref={ref} className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--text-disabled)]" {...props} />
      {suffix ? <span className="text-[var(--text-secondary)]">{suffix}</span> : null}
    </span>
    {error ? <span className="mt-1 block text-sm text-[var(--status-cancelled)]">{error}</span> : null}
    {!error && hint ? <span className="mt-1 block text-sm text-[var(--text-secondary)]">{hint}</span> : null}
  </label>
))
Input.displayName = 'Input'
