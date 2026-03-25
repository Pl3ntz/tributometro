import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  delay?: number
}

export default function AnimatedCard({ children, className = '', delay = 0 }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  )
}
