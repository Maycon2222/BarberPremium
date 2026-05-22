import { motion } from 'framer-motion'
import { cn } from '../../utils'

export function Card({ children, className = '', appointment = false, hover = false }) {
  const classes = cn(
    'rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-md)]',
    appointment && 'border-l-4 border-l-[var(--accent-default)]',
    className,
  )
  if (hover) {
    return (
      <motion.div whileHover={{ y: -4 }} className={classes}>
        {children}
      </motion.div>
    )
  }
  return <div className={classes}>{children}</div>
}
