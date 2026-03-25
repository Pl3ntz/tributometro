import { motion } from 'motion/react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export default function StaggerContainer({ children, className = '', staggerDelay = 0.06 }: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
}
