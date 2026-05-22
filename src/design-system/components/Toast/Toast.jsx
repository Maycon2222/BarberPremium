import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Info, XCircle } from 'lucide-react'

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

export function ToastViewport({ toasts }) {
  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info
          return (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 36 }} className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] p-4 shadow-[var(--shadow-lg)]">
              <Icon className="mt-0.5 h-5 w-5 text-[var(--accent-default)]" />
              <div>
                <p className="font-semibold">{toast.title}</p>
                {toast.message ? <p className="text-sm text-[var(--text-secondary)]">{toast.message}</p> : null}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
