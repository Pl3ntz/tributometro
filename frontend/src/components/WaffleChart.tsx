import { useMemo, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { CircleDollarSign, CircleOff } from 'lucide-react'

interface Props {
  taxPercentage: number
  totalValue: number
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export default function WaffleChart({ taxPercentage, totalValue }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-50px' })

  const taxSquares = useMemo(() => Math.round(taxPercentage / 10), [taxPercentage])
  const valuePerSquare = useMemo(() => totalValue / 10, [totalValue])

  const squares = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      index: i,
      isTax: i < taxSquares,
      value: valuePerSquare,
    })),
    [taxSquares, valuePerSquare],
  )

  const taxTotal = useMemo(() => taxSquares * valuePerSquare, [taxSquares, valuePerSquare])
  const keepTotal = useMemo(() => totalValue - taxTotal, [totalValue, taxTotal])

  return (
    <div ref={containerRef} className="w-full">
      {/* Waffle Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 max-w-3xl mx-auto">
        {squares.map((square) => (
          <motion.div
            key={square.index}
            className="relative cursor-pointer"
            style={{ perspective: '600px' }}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={isInView
              ? { rotateY: 0, opacity: 1 }
              : { rotateY: 180, opacity: 0 }
            }
            transition={{
              duration: 0.6,
              delay: square.isTax
                ? 0.8 + square.index * 0.12
                : square.index * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            whileHover={{
              scale: 1.08,
              y: -4,
              transition: { duration: 0.2 },
            }}
          >
            <div
              className="aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1 sm:gap-2 border"
              style={{
                backgroundColor: square.isTax ? '#3B1111' : 'rgba(72,187,120,0.08)',
                borderColor: square.isTax
                  ? 'rgba(229,62,62,0.3)'
                  : 'rgba(72,187,120,0.2)',
                boxShadow: square.isTax
                  ? '0 0 20px rgba(229,62,62,0.1)'
                  : '0 0 20px rgba(72,187,120,0.05)',
              }}
            >
              {square.isTax ? (
                <CircleOff
                  className="w-5 h-5 sm:w-7 sm:h-7"
                  style={{ color: '#E53E3E' }}
                  strokeWidth={1.5}
                />
              ) : (
                <CircleDollarSign
                  className="w-5 h-5 sm:w-7 sm:h-7"
                  style={{ color: '#48BB78' }}
                  strokeWidth={1.5}
                />
              )}

              <span
                className="text-[9px] sm:text-xs font-semibold"
                style={{ color: square.isTax ? '#FC5555' : '#48BB78' }}
              >
                {formatCurrency(square.value)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <motion.div
        className="mt-6 sm:mt-8 space-y-4"
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 1.6 }}
      >
        <p className="text-center text-sm sm:text-base font-semibold" style={{ color: '#EDEDF0' }}>
          De cada R$ 10,{' '}
          <span style={{ color: '#FC5555' }}>
            R$ {taxSquares} vao para impostos
          </span>
        </p>

        {/* Summary Bar */}
        <div className="max-w-md mx-auto">
          <div
            className="h-3 sm:h-4 rounded-full overflow-hidden flex"
            style={{ backgroundColor: '#232328' }}
          >
            <motion.div
              className="h-full rounded-l-full"
              style={{ backgroundColor: '#E53E3E' }}
              initial={{ width: 0 }}
              animate={isInView ? { width: `${taxPercentage}%` } : { width: 0 }}
              transition={{ duration: 1, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.div
              className="h-full rounded-r-full"
              style={{ backgroundColor: '#48BB78' }}
              initial={{ width: 0 }}
              animate={isInView
                ? { width: `${100 - taxPercentage}%` }
                : { width: 0 }
              }
              transition={{ duration: 1, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-[10px] sm:text-xs" style={{ color: '#FC5555' }}>
              Impostos: {formatCurrency(taxTotal)}
            </span>
            <span className="text-[10px] sm:text-xs" style={{ color: '#48BB78' }}>
              Seu: {formatCurrency(keepTotal)}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
