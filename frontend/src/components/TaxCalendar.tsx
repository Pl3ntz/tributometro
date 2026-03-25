import { useState, useMemo } from 'react'
import { motion, useInView } from 'motion/react'
import { useRef } from 'react'

interface Props {
  daysForTax?: number
}

const MONTH_LABELS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

const DAYS_PER_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function buildMonths(): Array<{ label: string; days: number; startDay: number }> {
  let accumulated = 0
  return DAYS_PER_MONTH.map((days, i) => {
    const month = { label: MONTH_LABELS[i], days, startDay: accumulated }
    accumulated += days
    return month
  })
}

function getLiberationDate(daysForTax: number): string {
  const months = buildMonths()
  let remaining = daysForTax

  for (const month of months) {
    if (remaining <= month.days) {
      return `${remaining} de ${month.label.toLowerCase() === 'mai' ? 'maio' : month.label.toLowerCase()}`
    }
    remaining -= month.days
  }

  return `${daysForTax}`
}

function formatLiberationDateFull(daysForTax: number): string {
  const date = new Date(2025, 0, 1)
  date.setDate(date.getDate() + daysForTax - 1)

  const day = date.getDate()
  const monthNames = [
    'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ]

  return `${day} de ${monthNames[date.getMonth()]}`
}

export default function TaxCalendar({ daysForTax = 149 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-50px' })
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  const months = useMemo(() => buildMonths(), [])
  const liberationDate = useMemo(() => formatLiberationDateFull(daysForTax), [daysForTax])

  return (
    <div ref={containerRef} className="w-full">
      {/* Tooltip */}
      {hoveredDay !== null && (
        <div className="fixed pointer-events-none z-50 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg"
          style={{
            backgroundColor: hoveredDay <= daysForTax ? '#3B1111' : '#112B11',
            color: hoveredDay <= daysForTax ? '#FC5555' : '#48BB78',
            top: 'var(--tooltip-y, 0px)',
            left: 'var(--tooltip-x, 0px)',
            transform: 'translate(-50%, -120%)',
          }}
        >
          Dia {hoveredDay} — {hoveredDay <= daysForTax ? 'Trabalhando para impostos' : 'Trabalhando para voce'}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="flex flex-wrap gap-x-1 sm:gap-x-2 gap-y-1 justify-center">
        {months.map((month, monthIndex) => (
          <div key={month.label} className="flex flex-col items-center">
            {/* Month label - hidden on mobile */}
            <span className="hidden sm:block text-[10px] sm:text-xs font-medium mb-1"
              style={{ color: '#9D9DB0' }}
            >
              {month.label}
            </span>

            {/* Days grid for this month */}
            <div className="grid gap-px sm:gap-0.5"
              style={{
                gridTemplateColumns: `repeat(7, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: month.days }, (_, dayInMonth) => {
                const dayOfYear = month.startDay + dayInMonth + 1
                const isTaxDay = dayOfYear <= daysForTax
                const isLiberationDay = dayOfYear === daysForTax

                const opacityBase = isTaxDay
                  ? 0.4 + (dayOfYear / daysForTax) * 0.6
                  : 0.3 + ((dayOfYear - daysForTax) / (365 - daysForTax)) * 0.7

                return (
                  <motion.div
                    key={dayOfYear}
                    className="w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-[1px] sm:rounded-sm cursor-pointer relative"
                    style={{
                      backgroundColor: isTaxDay ? '#E53E3E' : '#48BB78',
                      opacity: isInView ? opacityBase : 0,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isInView
                      ? { opacity: opacityBase, scale: 1 }
                      : { opacity: 0, scale: 0 }
                    }
                    transition={{
                      duration: 0.15,
                      delay: dayOfYear * 0.002,
                      ease: 'easeOut',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                      const rect = (e.target as HTMLElement).getBoundingClientRect()
                      document.documentElement.style.setProperty('--tooltip-x', `${rect.left + rect.width / 2}px`)
                      document.documentElement.style.setProperty('--tooltip-y', `${rect.top}px`)
                      setHoveredDay(dayOfYear)
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    whileHover={{ scale: 1.8, transition: { duration: 0.1 } }}
                  >
                    {isLiberationDay && (
                      <div
                        className="absolute -right-px top-0 w-0.5 sm:w-[3px] rounded-full"
                        style={{
                          height: 'calc(100% + 4px)',
                          backgroundColor: '#FC5555',
                          boxShadow: '0 0 8px rgba(252,85,85,0.6)',
                        }}
                      />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        className="mt-6 text-center space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <p className="text-sm sm:text-base font-semibold" style={{ color: '#FC5555' }}>
          Voce trabalha ate {liberationDate} so para pagar impostos
        </p>
        <p className="text-[10px] sm:text-xs" style={{ color: '#5C5C72' }}>
          Fonte: IBPT — Estudo Dias Trabalhados 2025
        </p>
      </motion.div>
    </div>
  )
}
