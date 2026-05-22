import { motion } from 'framer-motion'
import { Card } from '../../design-system'

export function StatCard({ label, value, icon: Icon, tone = 'text-[var(--accent-text)]' }) {
  return (
    <motion.div variants={{ initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 } }}>
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-[var(--text-secondary)]">{label}</p>
            <p className="mt-2 text-3xl font-bold">{value}</p>
          </div>
          {Icon ? <Icon className={`h-6 w-6 ${tone}`} /> : null}
        </div>
      </Card>
    </motion.div>
  )
}
