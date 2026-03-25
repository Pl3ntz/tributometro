import { motion } from 'motion/react'

interface Props {
  className?: string
  count?: number
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-border rounded ${className}`}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-secondary rounded-xl p-4 border border-border space-y-3">
      <SkeletonLine className="h-3 w-12" />
      <SkeletonLine className="h-6 w-24" />
      <SkeletonLine className="h-3 w-16" />
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <div className="bg-surface-secondary rounded-2xl p-8 border border-border space-y-4">
        <SkeletonLine className="h-4 w-40" />
        <SkeletonLine className="h-12 w-64" />
        <SkeletonLine className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface-secondary rounded-xl p-6 border border-border">
          <SkeletonLine className="h-5 w-32 mb-4" />
          <SkeletonLine className="h-[300px] w-full" />
        </div>
        <div className="bg-surface-secondary rounded-xl p-6 border border-border">
          <SkeletonLine className="h-5 w-32 mb-4" />
          <SkeletonLine className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ count = 5 }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 px-4">
          <SkeletonLine className="h-4 w-20" />
          <SkeletonLine className="h-4 w-48 flex-1" />
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-4 w-16" />
        </div>
      ))}
    </div>
  )
}
