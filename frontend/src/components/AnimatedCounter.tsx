import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'

interface Props {
  value: number
  duration?: number
  prefix?: string
  className?: string
  formatter?: (value: number) => string
}

export default function AnimatedCounter({
  value,
  duration = 1.2,
  prefix = '',
  className = '',
  formatter,
}: Props) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    const startTime = Date.now()
    const startValue = 0

    function update() {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(update)
      }
    }

    requestAnimationFrame(update)
  }, [value, duration, isInView])

  const formatted = formatter
    ? formatter(displayValue)
    : `${prefix}${displayValue.toFixed(2)}`

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.3 }}
    >
      {formatted}
    </motion.span>
  )
}
