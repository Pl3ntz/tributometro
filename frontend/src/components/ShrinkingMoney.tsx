import { useMemo, useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Scissors, DollarSign, Receipt, Building2, Landmark, ShieldCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface Layer {
  label: string
  value: number
  color: string
}

interface Props {
  grossValue: number
  layers: Layer[]
}

const LAYER_ICONS: LucideIcon[] = [
  Receipt,
  Building2,
  Landmark,
  ShieldCheck,
  Scissors,
]

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getBarColor(percentage: number): string {
  if (percentage > 70) return '#48BB78'
  if (percentage > 40) return '#ECC94B'
  return '#E53E3E'
}

export default function ShrinkingMoney({ grossValue, layers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-50px' })

  const computedLayers = useMemo(() => {
    let remaining = grossValue
    return layers.map((layer, i) => {
      const percentage = (layer.value / grossValue) * 100
      const widthBefore = (remaining / grossValue) * 100
      remaining -= layer.value
      const widthAfter = (remaining / grossValue) * 100

      return {
        ...layer,
        percentage,
        widthBefore,
        widthAfter,
        remaining,
        icon: LAYER_ICONS[i % LAYER_ICONS.length],
      }
    })
  }, [grossValue, layers])

  const totalDeducted = useMemo(
    () => layers.reduce((sum, l) => sum + l.value, 0),
    [layers],
  )

  const finalValue = grossValue - totalDeducted
  const finalPercentage = (finalValue / grossValue) * 100

  return (
    <div ref={containerRef} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* Main shrinking bar - left side */}
        <div className="flex-1 space-y-3">
          {/* Gross value bar */}
          <motion.div
            className="relative rounded-xl overflow-hidden"
            style={{ backgroundColor: '#232328' }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView
              ? { opacity: 1, scaleX: 1 }
              : { opacity: 0, scaleX: 0 }
            }
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="h-12 sm:h-16 rounded-xl flex items-center justify-between px-3 sm:px-4"
              style={{ backgroundColor: 'rgba(72,187,120,0.15)' }}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" style={{ color: '#48BB78' }} />
                <span className="text-xs sm:text-sm font-medium" style={{ color: '#A0A0AE' }}>
                  Valor bruto
                </span>
              </div>
              <span className="text-sm sm:text-lg font-bold" style={{ color: '#48BB78' }}>
                {formatCurrency(grossValue)}
              </span>
            </div>
          </motion.div>

          {/* Progressive shrinking bars */}
          {computedLayers.map((layer, i) => (
            <motion.div
              key={layer.label}
              className="relative"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -20 }
              }
              transition={{
                duration: 0.5,
                delay: 0.6 + i * 0.3,
                ease: 'easeOut',
              }}
            >
              <div
                className="h-10 sm:h-12 rounded-lg overflow-hidden relative"
                style={{ backgroundColor: '#232328' }}
              >
                {/* Remaining bar */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-lg"
                  style={{
                    backgroundColor: getBarColor(layer.widthAfter),
                    opacity: 0.2,
                  }}
                  initial={{ width: `${layer.widthBefore}%` }}
                  animate={isInView
                    ? { width: `${layer.widthAfter}%` }
                    : { width: `${layer.widthBefore}%` }
                  }
                  transition={{
                    duration: 0.8,
                    delay: 0.8 + i * 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />

                {/* Content overlay */}
                <div className="relative h-full flex items-center justify-between px-3 sm:px-4 z-10">
                  <span
                    className="text-[10px] sm:text-xs font-medium truncate max-w-[60%]"
                    style={{ color: '#A0A0AE' }}
                  >
                    Restante apos {layer.label.split('—')[0].trim().toLowerCase()}
                  </span>
                  <span
                    className="text-xs sm:text-sm font-semibold"
                    style={{ color: getBarColor(layer.widthAfter) }}
                  >
                    {formatCurrency(layer.remaining)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Final value - pulsing */}
          <motion.div
            className="relative rounded-xl overflow-hidden border"
            style={{
              borderColor: 'rgba(72,187,120,0.3)',
              backgroundColor: 'rgba(72,187,120,0.08)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView
              ? {
                opacity: 1,
                scale: 1,
                boxShadow: [
                  '0 0 0px rgba(72,187,120,0)',
                  '0 0 24px rgba(72,187,120,0.2)',
                  '0 0 0px rgba(72,187,120,0)',
                ],
              }
              : { opacity: 0, scale: 0.95 }
            }
            transition={{
              opacity: { duration: 0.5, delay: 0.6 + computedLayers.length * 0.3 },
              scale: { duration: 0.5, delay: 0.6 + computedLayers.length * 0.3 },
              boxShadow: {
                duration: 2,
                delay: 1.2 + computedLayers.length * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            <div className="h-14 sm:h-16 flex items-center justify-between px-3 sm:px-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" style={{ color: '#48BB78' }} />
                <span className="text-xs sm:text-sm font-bold" style={{ color: '#48BB78' }}>
                  Seu poder de compra
                </span>
              </div>
              <span className="text-base sm:text-xl font-bold" style={{ color: '#48BB78' }}>
                {formatCurrency(finalValue)}
              </span>
            </div>

            {/* Percentage indicator */}
            <div className="px-3 sm:px-4 pb-2">
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#232328' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#48BB78' }}
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${finalPercentage}%` } : { width: 0 }}
                  transition={{
                    duration: 1,
                    delay: 1 + computedLayers.length * 0.3,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              </div>
              <p className="text-[10px] mt-1 text-right" style={{ color: '#6B6B7B' }}>
                {finalPercentage.toFixed(1)}% do valor original
              </p>
            </div>
          </motion.div>
        </div>

        {/* Extracted slices - right side */}
        <div className="lg:w-72 space-y-2">
          <p className="text-xs font-medium mb-3" style={{ color: '#6B6B7B' }}>
            Tributos extraidos
          </p>

          {computedLayers.map((layer, i) => {
            const IconComponent = layer.icon
            return (
              <motion.div
                key={layer.label}
                className="rounded-lg border p-3 flex items-start gap-3"
                style={{
                  borderColor: `${layer.color}33`,
                  backgroundColor: `${layer.color}0A`,
                }}
                initial={{ opacity: 0, x: 40 }}
                animate={isInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: 40 }
                }
                transition={{
                  duration: 0.5,
                  delay: 0.8 + i * 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  scale: 1.02,
                  x: -4,
                  transition: { duration: 0.2 },
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${layer.color}1A` }}
                >
                  <IconComponent
                    className="w-4 h-4"
                    style={{ color: layer.color }}
                    strokeWidth={1.5}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className="text-xs sm:text-sm font-semibold truncate"
                      style={{ color: layer.color }}
                    >
                      {formatCurrency(layer.value)}
                    </span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: '#6B6B7B' }}>
                      {layer.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs mt-0.5 leading-tight" style={{ color: '#A0A0AE' }}>
                    {layer.label}
                  </p>
                </div>
              </motion.div>
            )
          })}

          {/* Total deducted */}
          <motion.div
            className="mt-3 pt-3 border-t flex items-center justify-between"
            style={{ borderColor: '#232328' }}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 1 + computedLayers.length * 0.3 }}
          >
            <span className="text-xs" style={{ color: '#6B6B7B' }}>
              Total em tributos
            </span>
            <span className="text-sm font-bold" style={{ color: '#FC5555' }}>
              {formatCurrency(totalDeducted)}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
