import { useState, useMemo, useRef, useCallback } from 'react'
import { motion, useInView } from 'motion/react'
import {
  DollarSign,
  TrendingDown,
  Calendar,
  ShoppingCart,
  Tv,
  Fuel,
  ShoppingBag,
  FileText,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react'

// ─── FORMATTERS ───────────────────────────────────────────────────────────────

function fmt(v: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(v)
}

function fmtShort(v: number): string {
  return v.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// ─── TAX TABLES 2026 ─────────────────────────────────────────────────────────

const INSS_BRACKETS = [
  { max: 1621.0, rate: 0.075 },
  { max: 2902.84, rate: 0.09 },
  { max: 4354.27, rate: 0.12 },
  { max: 8475.55, rate: 0.14 },
] as const

const IRPF_BRACKETS = [
  { max: 2428.8, rate: 0, ded: 0 },
  { max: 2826.65, rate: 0.075, ded: 182.16 },
  { max: 3751.05, rate: 0.15, ded: 394.16 },
  { max: 4664.68, rate: 0.225, ded: 675.49 },
  { max: Infinity, rate: 0.275, ded: 908.73 },
] as const

const IRPF_DISCOUNT = 607.2
const IRPF_EXEMPT_LIMIT = 5000

const EMPLOYER_RATE = 0.358
const PROVISIONS_RATE = 0.249
const CONSUMPTION_TAX_RATE = 0.226

const FREEDOM_DAY = 149

// ─── CALCULATOR (pure, no mutation) ──────────────────────────────────────────

interface TaxBreakdown {
  readonly grossSalary: number
  readonly employerCost: number
  readonly employerTaxes: number
  readonly inss: number
  readonly irpf: number
  readonly netSalary: number
  readonly consumptionTax: number
  readonly realPurchasingPower: number
  readonly totalTaxes: number
  readonly totalTaxRate: number
  readonly taxPerTen: number
  readonly isIrpfExempt: boolean
}

function calcINSS(gross: number): number {
  let total = 0
  let prev = 0
  for (const bracket of INSS_BRACKETS) {
    if (gross <= prev) break
    const base = Math.min(gross, bracket.max) - prev
    total += base * bracket.rate
    prev = bracket.max
  }
  return total
}

function calcIRPF(gross: number, inss: number): { tax: number; exempt: boolean } {
  if (gross <= IRPF_EXEMPT_LIMIT) {
    return { tax: 0, exempt: true }
  }

  const base = gross - inss - IRPF_DISCOUNT
  if (base <= 0) return { tax: 0, exempt: true }

  for (const bracket of IRPF_BRACKETS) {
    if (base <= bracket.max) {
      const tax = Math.max(0, base * bracket.rate - bracket.ded)
      return { tax, exempt: false }
    }
  }

  const last = IRPF_BRACKETS[IRPF_BRACKETS.length - 1]
  return {
    tax: Math.max(0, base * last.rate - last.ded),
    exempt: false,
  }
}

function calculateTaxes(gross: number): TaxBreakdown {
  const employerTaxes = gross * EMPLOYER_RATE
  const provisions = gross * PROVISIONS_RATE
  const employerCost = gross + employerTaxes + provisions

  const inss = calcINSS(gross)
  const { tax: irpf, exempt: isIrpfExempt } = calcIRPF(gross, inss)
  const netSalary = gross - inss - irpf

  const consumptionTax = netSalary * CONSUMPTION_TAX_RATE
  const realPurchasingPower = netSalary - consumptionTax

  const totalTaxes = employerTaxes + inss + irpf + consumptionTax
  const totalTaxRate = (totalTaxes / employerCost) * 100
  const taxPerTen = Math.round((totalTaxes / employerCost) * 10)

  return {
    grossSalary: gross,
    employerCost,
    employerTaxes,
    inss,
    irpf,
    netSalary,
    consumptionTax,
    realPurchasingPower,
    totalTaxes,
    totalTaxRate,
    taxPerTen,
    isIrpfExempt,
  }
}

// ─── SALARY PRESETS ──────────────────────────────────────────────────────────

const PRESETS = [
  { value: 1518, label: 'Sal. Minimo' },
  { value: 3500, label: 'Tecnico' },
  { value: 5000, label: 'Classe Media' },
  { value: 8000, label: 'Especialista' },
  { value: 15000, label: 'Gerente' },
] as const

// ─── ANIMATED SECTION WRAPPER ────────────────────────────────────────────────

function Section({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

// ─── WAFFLE CHART ────────────────────────────────────────────────────────────

function WaffleChart({ taxPerTen }: { taxPerTen: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const squares = Array.from({ length: 10 }, (_, i) => i)

  return (
    <div ref={ref} className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3">
        {squares.map((i) => {
          const isTax = i < taxPerTen
          return (
            <motion.div
              key={i}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-mono text-sm font-bold ${
                isTax
                  ? 'bg-blood-500/20 text-blood-400 border border-blood-500/30'
                  : 'bg-success/20 text-success border border-success/30'
              }`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={
                isInView
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.5 }
              }
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <span>R$1</span>
            </motion.div>
          )
        })}
      </div>
      <p className="text-content-secondary text-sm sm:text-base text-center">
        <span className="text-blood-400 font-bold font-mono">{taxPerTen}</span> de
        cada 10 reais e imposto
      </p>
    </div>
  )
}

// ─── CALENDAR 365 ────────────────────────────────────────────────────────────

function CalendarGrid() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  const days = Array.from({ length: 365 }, (_, i) => i)

  return (
    <div ref={ref} className="flex flex-col items-center gap-6">
      <div className="grid gap-[2px] sm:gap-[3px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(10px, 1fr))' }}>
        {days.map((i) => {
          const isTax = i < FREEDOM_DAY
          return (
            <motion.div
              key={i}
              className={`w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] rounded-[2px] ${
                isTax ? 'bg-blood-500/70' : 'bg-success/40'
              }`}
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: Math.min(i * 0.002, 0.8), duration: 0.3 }}
              title={
                isTax
                  ? `Dia ${i + 1} - Trabalhando para o governo`
                  : `Dia ${i + 1} - Trabalhando para voce`
              }
            />
          )
        })}
      </div>
      <div className="text-center space-y-2">
        <p className="text-content-primary text-base sm:text-lg font-semibold">
          Voce trabalha{' '}
          <span className="text-blood-400 font-mono font-bold">{FREEDOM_DAY} dias</span>{' '}
          por ano so para pagar impostos
        </p>
        <p className="text-content-tertiary text-xs sm:text-sm">
          De janeiro ate 29 de maio, tudo que voce ganha vai para o governo
        </p>
        <p className="text-content-tertiary text-[10px] uppercase tracking-wider">
          Fonte: IBPT 2025 - Dia da Liberdade de Impostos
        </p>
      </div>
    </div>
  )
}

// ─── WATERFALL BLOCK ─────────────────────────────────────────────────────────

interface WaterfallItem {
  readonly label: string
  readonly value: number
  readonly type: 'neutral' | 'deduction' | 'subtotal' | 'result'
  readonly note?: string
}

function WaterfallBlock({
  item,
  index,
  maxValue,
}: {
  item: WaterfallItem
  index: number
  maxValue: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  const widthPct = Math.max(15, (Math.abs(item.value) / maxValue) * 100)

  const colorMap = {
    neutral: 'bg-base-700 text-content-secondary',
    deduction: 'bg-blood-500/20 text-blood-400 border-l-4 border-blood-500',
    subtotal: 'bg-alert-800/50 text-alert-300 border-l-4 border-alert-400',
    result: 'bg-success/10 text-success border-l-4 border-success',
  } as const

  return (
    <motion.div
      ref={ref}
      className="space-y-1"
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-content-secondary">{item.label}</span>
        {item.note && (
          <span className="text-content-tertiary text-[10px] sm:text-xs">{item.note}</span>
        )}
      </div>
      <div
        className={`rounded-lg px-4 py-3 font-mono text-sm sm:text-base font-bold ${colorMap[item.type]}`}
        style={{ width: `${widthPct}%`, minWidth: 'fit-content' }}
      >
        {item.type === 'deduction' ? '- ' : ''}
        {fmt(Math.abs(item.value))}
      </div>
    </motion.div>
  )
}

// ─── COMPARISON CARD ─────────────────────────────────────────────────────────

function ComparisonCard({
  icon: Icon,
  amount,
  label,
  index,
}: {
  icon: typeof Tv
  amount: string
  label: string
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  return (
    <motion.div
      ref={ref}
      className="rounded-2xl bg-base-900 border border-base-600/30 p-5 sm:p-6 flex flex-col items-center text-center gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.03, borderColor: 'rgba(229, 62, 62, 0.3)' }}
    >
      <div className="w-12 h-12 rounded-xl bg-blood-800/50 flex items-center justify-center">
        <Icon size={22} className="text-blood-400" />
      </div>
      <p className="text-2xl sm:text-3xl font-mono font-bold text-content-primary">{amount}</p>
      <p className="text-content-secondary text-xs sm:text-sm">{label}</p>
    </motion.div>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function Home() {
  const [rawInput, setRawInput] = useState('')
  const [salary, setSalary] = useState<number | null>(null)

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw || '0', 10) / 100
    setRawInput(num > 0 ? num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')
    setSalary(num > 0 ? num : null)
  }, [])

  const handlePreset = useCallback((value: number) => {
    setRawInput(value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
    setSalary(value)
  }, [])

  const data = useMemo(() => (salary ? calculateTaxes(salary) : null), [salary])

  const waterfall: ReadonlyArray<WaterfallItem> = useMemo(() => {
    if (!data) return []
    return [
      {
        label: 'A empresa gasta com voce',
        value: data.employerCost,
        type: 'neutral' as const,
      },
      {
        label: 'Encargos patronais (INSS 20%, FGTS 8%, RAT, Sistema S)',
        value: data.employerTaxes,
        type: 'deduction' as const,
        note: `${(EMPLOYER_RATE * 100).toFixed(1)}%`,
      },
      {
        label: 'Provisoes (13o, ferias, encargos)',
        value: data.grossSalary * PROVISIONS_RATE,
        type: 'deduction' as const,
        note: `${(PROVISIONS_RATE * 100).toFixed(1)}%`,
      },
      {
        label: 'Seu salario bruto',
        value: data.grossSalary,
        type: 'subtotal' as const,
      },
      {
        label: 'INSS (contribuicao do trabalhador)',
        value: data.inss,
        type: 'deduction' as const,
        note: 'Portaria MPS/MF 13/2026',
      },
      {
        label: data.isIrpfExempt
          ? 'IRPF — Isento ate R$ 5.000 (Lei 15.270/2025)'
          : 'IRPF (Imposto de Renda)',
        value: data.irpf,
        type: 'deduction' as const,
        note: data.isIrpfExempt ? 'Isento' : 'Receita Federal 2026',
      },
      {
        label: 'Salario liquido',
        value: data.netSalary,
        type: 'subtotal' as const,
      },
      {
        label: 'Impostos embutidos no consumo',
        value: data.consumptionTax,
        type: 'deduction' as const,
        note: `${(CONSUMPTION_TAX_RATE * 100).toFixed(1)}% media IBPT`,
      },
      {
        label: 'Poder de compra real',
        value: data.realPurchasingPower,
        type: 'result' as const,
      },
    ]
  }, [data])

  const comparisons = useMemo(() => {
    if (!data) return []
    const monthlyTax = data.totalTaxes
    return [
      {
        icon: Tv,
        amount: `${Math.floor(monthlyTax / 44.9)}`,
        label: 'meses de Netflix Premium',
      },
      {
        icon: ShoppingBag,
        amount: `${Math.floor(monthlyTax / 800)}`,
        label: 'cestas basicas',
      },
      {
        icon: Fuel,
        amount: `${Math.floor(monthlyTax / 300)}`,
        label: 'tanques de gasolina',
      },
      {
        icon: ShoppingCart,
        amount: `${Math.floor(monthlyTax / 450)}`,
        label: 'carrinhos de mercado',
      },
    ]
  }, [data])

  return (
    <div className="min-h-screen relative">
      {/* ── SECTION 1: HERO + INPUT ─────────────────────────────────────── */}
      <section className="min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 relative">
        <motion.div
          className="absolute inset-0 bg-gradient-hero opacity-60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.5 }}
        />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-content-primary leading-tight">
              Descubra quanto do seu{' '}
              <span className="text-blood-400">dinheiro</span> e imposto
            </h1>
            <p className="text-content-secondary text-base sm:text-lg">
              O calculo que ninguem te mostra
            </p>
          </motion.div>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative max-w-md mx-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-content-tertiary text-lg font-mono">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={rawInput}
                onChange={handleInput}
                placeholder="5.000,00"
                className="w-full rounded-2xl pl-14 pr-6 py-4 text-xl sm:text-2xl font-mono text-center focus:outline-none transition-all"
                style={{
                  backgroundColor: '#0C1525',
                  color: '#FFFFFF',
                  border: '1px solid #163356',
                  caretColor: '#FC5555',
                }}
              />
              <DollarSign
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-content-tertiary"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {PRESETS.map(({ value, label }) => (
                <motion.button
                  key={value}
                  onClick={() => handlePreset(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    salary === value
                      ? 'bg-blood-500/20 text-blood-400 border border-blood-500/40'
                      : 'bg-base-850 text-content-tertiary border border-base-600/30 hover:text-content-secondary hover:border-base-500'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label}
                  <span className="ml-1.5 font-mono text-[10px] opacity-60">
                    {fmt(value)}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {salary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pt-4"
            >
              <ChevronDown size={24} className="text-blood-400 mx-auto animate-bounce" />
            </motion.div>
          )}
        </div>
      </section>

      {/* ── REVEALED CONTENT (only when salary is set) ──────────────────── */}
      {data && (
        <motion.div
          className="space-y-20 sm:space-y-28 pb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* ── SECTION 2: CHOQUE INICIAL ───────────────────────────────── */}
          <Section className="px-4 sm:px-6 max-w-4xl mx-auto">
            <div className="rounded-3xl bg-base-900 border border-base-600/20 p-6 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                <div className="text-center space-y-2">
                  <p className="text-content-tertiary text-xs uppercase tracking-wider">
                    Voce ganha
                  </p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-success">
                    {fmt(data.grossSalary)}
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-content-tertiary text-xs uppercase tracking-wider">
                    Voce fica com
                  </p>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-blood-400">
                    {fmt(data.realPurchasingPower)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-3">
                <div className="h-4 sm:h-5 rounded-full bg-base-800 overflow-hidden flex">
                  <motion.div
                    className="h-full bg-success rounded-l-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((data.realPurchasingPower / data.grossSalary) * 100).toFixed(1)}%`,
                    }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.div
                    className="h-full bg-blood-500"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(((data.grossSalary - data.realPurchasingPower) / data.grossSalary) * 100).toFixed(1)}%`,
                    }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <div className="flex justify-between text-xs text-content-tertiary">
                  <span className="text-success">
                    Seu: {((data.realPurchasingPower / data.grossSalary) * 100).toFixed(0)}%
                  </span>
                  <span className="text-blood-400">
                    Impostos: {(((data.grossSalary - data.realPurchasingPower) / data.grossSalary) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <p className="text-center text-content-secondary text-sm sm:text-base">
                De cada{' '}
                <span className="font-mono font-bold text-content-primary">R$ 10</span>,{' '}
                <span className="font-mono font-bold text-blood-400">
                  R$ {fmtShort(10 - (data.realPurchasingPower / data.grossSalary) * 10)}
                </span>{' '}
                vao para impostos
              </p>
            </div>
          </Section>

          {/* ── SECTION 3: WAFFLE CHART ─────────────────────────────────── */}
          <Section className="px-4 sm:px-6 max-w-3xl mx-auto" delay={0.1}>
            <div className="rounded-3xl bg-base-900 border border-base-600/20 p-6 sm:p-10 space-y-6">
              <div className="text-center space-y-2">
                <Sparkles size={20} className="text-alert-400 mx-auto" />
                <h2 className="text-xl sm:text-2xl font-bold text-content-primary">
                  Cada R$ 10 que voce ganha
                </h2>
              </div>
              <WaffleChart taxPerTen={data.taxPerTen} />
            </div>
          </Section>

          {/* ── SECTION 4: CALENDARIO 365 DIAS ──────────────────────────── */}
          <Section className="px-4 sm:px-6 max-w-4xl mx-auto" delay={0.1}>
            <div className="rounded-3xl bg-base-900 border border-base-600/20 p-6 sm:p-10 space-y-6">
              <div className="text-center space-y-2">
                <Calendar size={20} className="text-blood-400 mx-auto" />
                <h2 className="text-xl sm:text-2xl font-bold text-content-primary">
                  Seu ano em dias
                </h2>
                <p className="text-content-tertiary text-sm">
                  <span className="inline-block w-3 h-3 rounded-sm bg-blood-500/70 mr-1 align-middle" />{' '}
                  Governo{' '}
                  <span className="inline-block w-3 h-3 rounded-sm bg-success/40 mr-1 ml-3 align-middle" />{' '}
                  Voce
                </p>
              </div>
              <CalendarGrid />
            </div>
          </Section>

          {/* ── SECTION 5: WATERFALL (CASCATA) ──────────────────────────── */}
          <Section className="px-4 sm:px-6 max-w-3xl mx-auto" delay={0.1}>
            <div className="rounded-3xl bg-base-900 border border-base-600/20 p-6 sm:p-10 space-y-6">
              <div className="text-center space-y-2">
                <TrendingDown size={20} className="text-blood-400 mx-auto" />
                <h2 className="text-xl sm:text-2xl font-bold text-content-primary">
                  Cascata do seu salario
                </h2>
                <p className="text-content-tertiary text-sm">
                  Do custo da empresa ate seu poder de compra real
                </p>
              </div>

              <div className="space-y-3">
                {waterfall.map((item, i) => (
                  <WaterfallBlock
                    key={item.label}
                    item={item}
                    index={i}
                    maxValue={data.employerCost}
                  />
                ))}
              </div>

              <div className="pt-4 border-t border-base-600/30 text-center">
                <p className="text-content-tertiary text-xs sm:text-sm">
                  Carga tributaria total sobre o custo da empresa:{' '}
                  <span className="font-mono font-bold text-blood-400">
                    {data.totalTaxRate.toFixed(1)}%
                  </span>
                </p>
              </div>
            </div>
          </Section>

          {/* ── SECTION 6: COMPARACAO TANGIVEL ───────────────────────────── */}
          <Section className="px-4 sm:px-6 max-w-4xl mx-auto" delay={0.1}>
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <ShoppingCart size={20} className="text-alert-400 mx-auto" />
                <h2 className="text-xl sm:text-2xl font-bold text-content-primary">
                  Com o que voce pagou de imposto este mes
                </h2>
                <p className="text-content-secondary text-sm">
                  <span className="font-mono font-bold text-blood-400">
                    {fmt(data.totalTaxes)}
                  </span>{' '}
                  em impostos daria para comprar:
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {comparisons.map((comp, i) => (
                  <ComparisonCard
                    key={comp.label}
                    icon={comp.icon}
                    amount={comp.amount}
                    label={comp.label}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </Section>

          {/* ── SECTION 7: FONTES E TRANSPARENCIA ───────────────────────── */}
          <Section className="px-4 sm:px-6 max-w-3xl mx-auto" delay={0.1}>
            <div className="rounded-3xl bg-base-900 border border-base-600/20 p-6 sm:p-10 space-y-6">
              <div className="text-center space-y-2">
                <FileText size={20} className="text-content-tertiary mx-auto" />
                <h2 className="text-lg sm:text-xl font-bold text-content-primary">
                  Fontes e transparencia
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                {[
                  {
                    label: 'INSS 2026',
                    desc: 'Portaria MPS/MF no 13/2026 - Aliquotas progressivas',
                    url: 'https://www.planalto.gov.br',
                  },
                  {
                    label: 'IRPF 2026',
                    desc: 'Tabela Receita Federal + isencao ate R$ 5.000 (Lei 15.270/2025)',
                    url: 'https://www.gov.br/receitafederal',
                  },
                  {
                    label: 'Encargos patronais CLT',
                    desc: 'INSS patronal 20%, FGTS 8%, RAT 2%, Sistema S 5,8%',
                    url: 'https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm',
                  },
                  {
                    label: 'Provisoes trabalhistas',
                    desc: '13o salario, ferias + 1/3, encargos sobre provisoes (24,9%)',
                    url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm',
                  },
                  {
                    label: 'Impostos sobre consumo',
                    desc: 'Media ponderada 22,6% — ICMS, PIS, COFINS, IPI (IBPT/POF)',
                    url: 'https://ibpt.com.br',
                  },
                  {
                    label: 'Dia da Liberdade de Impostos',
                    desc: '149 dias (29 de maio) — IBPT 2025',
                    url: 'https://ibpt.com.br',
                  },
                ].map((source) => (
                  <a
                    key={source.label}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-base-850 transition-colors group"
                  >
                    <ExternalLink
                      size={14}
                      className="text-content-tertiary mt-0.5 shrink-0 group-hover:text-blood-400 transition-colors"
                    />
                    <div>
                      <p className="text-content-primary font-medium group-hover:text-blood-400 transition-colors">
                        {source.label}
                      </p>
                      <p className="text-content-tertiary">{source.desc}</p>
                    </div>
                  </a>
                ))}
              </div>

              <p className="text-center text-content-tertiary text-[10px] sm:text-xs border-t border-base-600/20 pt-4">
                Todos os calculos sao baseados na legislacao brasileira vigente em 2026.
                Nenhum dado e armazenado — tudo e calculado no seu navegador.
              </p>
            </div>
          </Section>
        </motion.div>
      )}
    </div>
  )
}
