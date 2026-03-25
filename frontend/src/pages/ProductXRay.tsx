import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Fuel,
  Beer,
  Smartphone,
  WheatOff,
  Car,
  Zap,
  Cigarette,
  Pill,
  Footprints,
  Phone,
  GlassWater,
  Croissant,
  ArrowDown,
  Factory,
  Truck,
  Store,
  ShoppingCart,
  FileText,
  Info,
  type LucideIcon,
} from 'lucide-react'
import SEO from '../components/SEO'
import type { ProductChain, ChainStage, StageTax } from '../constants/product-tax-chains'
import { PRODUCTS } from '../constants/product-tax-chains'

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function pct(v: number) {
  return `${v.toFixed(1)}%`
}

const ICON_MAP: Record<string, LucideIcon> = {
  Fuel,
  Beer,
  Smartphone,
  WheatOff,
  Car,
  Zap,
  Cigarette,
  Pill,
  Footprints,
  Phone,
  GlassWater,
  Croissant,
}

const STAGE_ICON_MAP: Record<string, LucideIcon> = {
  Factory,
  Truck,
  Store,
  ShoppingCart,
}

function getProductIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Fuel
}

function getStageIcon(iconName: string): LucideIcon {
  return STAGE_ICON_MAP[iconName] ?? Factory
}

function scaleChain(product: ProductChain, newPrice: number): ProductChain {
  const ratio = newPrice / product.defaultPrice
  return {
    ...product,
    defaultPrice: newPrice,
    stages: product.stages.map((stage) => ({
      ...stage,
      entryPrice: stage.entryPrice * ratio,
      valueAdded: stage.valueAdded * ratio,
      taxes: stage.taxes.map((tax) => ({
        ...tax,
        amount: tax.amount * ratio,
      })),
      totalTaxes: stage.totalTaxes * ratio,
      exitPrice: stage.exitPrice * ratio,
      cumulativeTaxes: stage.cumulativeTaxes * ratio,
    })),
    totalTaxes: product.totalTaxes * ratio,
    priceWithoutTax: product.priceWithoutTax * ratio,
  }
}

function collectLaws(product: ProductChain): string[] {
  const laws = new Set<string>()
  for (const stage of product.stages) {
    for (const tax of stage.taxes) {
      if (tax.law) {
        laws.add(tax.law)
      }
    }
  }
  return [...laws]
}

const REGIME_LABELS: Record<string, string> = {
  monofasico: 'Monofásico',
  st: 'Substituição Tributária',
  normal: 'Normal',
  desonerado: 'Desonerado',
}

export default function ProductXRay() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [customPrice, setCustomPrice] = useState('')
  const [tooltipTax, setTooltipTax] = useState<string | null>(null)

  const selectedProduct = useMemo(() => {
    if (!selectedId) return null
    return PRODUCTS.find((p) => p.id === selectedId) ?? null
  }, [selectedId])

  const activeChain = useMemo(() => {
    if (!selectedProduct) return null
    if (!customPrice) return selectedProduct
    const parsed = parseFloat(customPrice.replace(/\./g, '').replace(',', '.'))
    if (!parsed || parsed <= 0) return selectedProduct
    return scaleChain(selectedProduct, parsed)
  }, [selectedProduct, customPrice])

  const laws = useMemo(() => {
    if (!activeChain) return []
    return collectLaws(activeChain)
  }, [activeChain])

  const handleSelectProduct = (id: string) => {
    setSelectedId(id)
    setCustomPrice('')
    setTooltipTax(null)
  }

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw || '0', 10) / 100
    setCustomPrice(num > 0 ? num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')
  }

  return (
    <div className="space-y-6">
      <SEO
        title="Raio-X do Produto — Cadeia tributária completa"
        description="Veja cada imposto que incide sobre um produto, desde a produção ou importação até o consumidor final. Cadeia tributária detalhada com leis e alíquotas."
        path="/raio-x-produto"
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Raio-X do Produto</h1>
        <p className="text-txt-tertiary text-sm mt-0.5">
          Veja cada imposto que incide do início ao fim da cadeia
        </p>
      </motion.div>

      {/* Product selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {PRODUCTS.map((product, i) => {
          const Icon = getProductIcon(product.icon)
          const isSelected = selectedId === product.id
          return (
            <motion.button
              key={product.id}
              onClick={() => handleSelectProduct(product.id)}
              className={`relative rounded-2xl p-4 text-left transition-all ${
                isSelected
                  ? 'bg-navy-800 border-2 border-gold-400 shadow-glow'
                  : 'bg-gradient-card border border-navy-700 shadow-card hover:border-navy-600'
              }`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  size={20}
                  className={isSelected ? 'text-gold-400' : 'text-txt-secondary'}
                />
                <span className="text-sm font-medium text-white truncate">{product.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-txt-tertiary">
                  {fmt(product.defaultPrice)}
                </span>
                <span
                  className={`text-xs font-mono font-medium ${isSelected ? 'text-gold-300' : 'text-gold-400'}`}
                >
                  {pct(product.taxPercentage)}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {activeChain && (
          <motion.div
            key={activeChain.id}
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {/* Price input */}
            <motion.div
              className="rounded-2xl bg-gradient-card shadow-card p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label
                className="text-xs text-txt-tertiary uppercase tracking-wider block mb-2"
                htmlFor="price-input"
              >
                Ajustar preço:
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-tertiary text-sm font-mono">
                    R$
                  </span>
                  <input
                    type="text"
                    id="price-input"
                    inputMode="numeric"
                    autoComplete="off"
                    value={customPrice}
                    onChange={handlePriceInput}
                    placeholder={activeChain.defaultPrice.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                    className="w-full rounded-xl pl-12 pr-4 py-3 text-lg font-mono focus:outline-none transition-all"
                    style={{ caretColor: '#E5A216' }}
                  />
                </div>
                <span className="text-xs text-txt-tertiary">/{activeChain.unit}</span>
                <span className="text-xs text-txt-tertiary font-mono">
                  NCM {activeChain.ncm}
                </span>
              </div>
            </motion.div>

            {/* Chain visualization */}
            <div className="space-y-0">
              {activeChain.stages.map((stage, idx) => (
                <div key={stage.label}>
                  <StageCard
                    stage={stage}
                    index={idx}
                    tooltipTax={tooltipTax}
                    onToggleTooltip={setTooltipTax}
                  />
                  {idx < activeChain.stages.length - 1 && (
                    <ChainArrow value={stage.exitPrice} delay={0.15 + idx * 0.12} />
                  )}
                </div>
              ))}
            </div>

            {/* Final summary */}
            <motion.div
              className="rounded-2xl bg-gradient-hero shadow-glow-lg overflow-hidden relative"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + activeChain.stages.length * 0.12 }}
            >
              <div className="absolute inset-0 bg-gradient-glow opacity-50" />
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-navy-800 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(229,162,22,0.1)',
                    '0 0 40px rgba(229,162,22,0.2)',
                    '0 0 20px rgba(229,162,22,0.1)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative p-7 space-y-4">
                <p className="text-xs text-gold-300/70 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingCart size={12} />
                  Preço final ao consumidor
                </p>

                <p className="text-4xl font-bold font-mono text-gold-300 drop-shadow-[0_0_20px_rgba(229,162,22,0.3)]">
                  {fmt(
                    activeChain.stages[activeChain.stages.length - 1]?.exitPrice ??
                      activeChain.defaultPrice,
                  )}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SummaryItem
                    label="Total impostos"
                    value={`${fmt(activeChain.totalTaxes)} (${pct(activeChain.taxPercentage)})`}
                    highlight
                  />
                  <SummaryItem
                    label="Sem imposto custaria"
                    value={fmt(activeChain.priceWithoutTax)}
                  />
                  <SummaryItem
                    label="De cada R$ 10"
                    value={`R$ ${((activeChain.taxPercentage / 100) * 10).toFixed(2).replace('.', ',')} são impostos`}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-txt-tertiary">Regime:</span>
                    <span className="text-xs font-medium text-gold-400 bg-navy-800 px-2.5 py-1 rounded-full">
                      {REGIME_LABELS[activeChain.taxRegime] ?? activeChain.taxRegime}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-txt-tertiary mt-2">
                  Fonte: {activeChain.source}
                </p>
              </div>
            </motion.div>

            {/* Laws footer */}
            {laws.length > 0 && (
              <motion.div
                className="rounded-2xl bg-gradient-card shadow-card p-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + activeChain.stages.length * 0.12 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-txt-tertiary" />
                  <h3 className="text-sm font-medium text-white">Legislação referenciada</h3>
                </div>
                <ul className="space-y-1">
                  {laws.map((law) => (
                    <li key={law} className="text-xs text-txt-tertiary">
                      {law}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StageCard({
  stage,
  index,
  tooltipTax,
  onToggleTooltip,
}: {
  stage: ChainStage
  index: number
  tooltipTax: string | null
  onToggleTooltip: (id: string | null) => void
}) {
  const Icon = getStageIcon(stage.icon)
  const taxTotal = stage.totalTaxes
  const valueAdded = stage.valueAdded
  const barTotal = taxTotal + valueAdded
  const taxWidth = barTotal > 0 ? (taxTotal / barTotal) * 100 : 0

  return (
    <motion.div
      className="rounded-2xl bg-gradient-card shadow-card p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.12, duration: 0.4 }}
    >
      {/* Stage header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-gold-400">
            <Icon size={18} />
          </span>
          <span className="text-sm font-medium text-white">{stage.label}</span>
        </div>
        <span className="text-xs font-mono text-txt-tertiary">
          Entrada: {fmt(stage.entryPrice)}
        </span>
      </div>

      {/* Taxes list */}
      <div className="space-y-1.5 mb-3">
        {stage.taxes.map((tax) => {
          const taxId = `${stage.label}-${tax.name}`
          return (
            <TaxRow
              key={taxId}
              tax={tax}
              taxId={taxId}
              isTooltipOpen={tooltipTax === taxId}
              onToggleTooltip={onToggleTooltip}
            />
          )
        })}
      </div>

      {/* Visual bar */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] text-txt-tertiary">Imposto vs Valor agregado</span>
        </div>
        <div className="h-2.5 rounded-full bg-navy-900 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)] flex">
          <motion.div
            className="h-full bg-gold-400 rounded-l-full"
            initial={{ width: 0 }}
            animate={{ width: `${taxWidth}%` }}
            transition={{ delay: 0.3 + index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="h-full bg-navy-600 rounded-r-full"
            initial={{ width: 0 }}
            animate={{ width: `${100 - taxWidth}%` }}
            transition={{ delay: 0.3 + index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gold-400 font-mono">
            Impostos: {fmt(taxTotal)}
          </span>
          <span className="text-[10px] text-txt-tertiary font-mono">
            Valor: {fmt(valueAdded)}
          </span>
        </div>
      </div>

      {/* Exit + cumulative */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-white font-medium">
          Saída: {fmt(stage.exitPrice)}
        </span>
        <span className="text-[10px] font-mono text-gold-400 bg-navy-900 px-2.5 py-1 rounded-full">
          Acumulado impostos: {fmt(stage.cumulativeTaxes)}
        </span>
      </div>

      {/* Stage note */}
      {stage.note && (
        <p className="text-[10px] text-txt-tertiary mt-2 italic">{stage.note}</p>
      )}
    </motion.div>
  )
}

function TaxRow({
  tax,
  taxId,
  isTooltipOpen,
  onToggleTooltip,
}: {
  tax: StageTax
  taxId: string
  isTooltipOpen: boolean
  onToggleTooltip: (id: string | null) => void
}) {
  return (
    <div className="flex items-center justify-between text-xs relative">
      <div className="flex items-center gap-1.5">
        <span className="text-txt-tertiary">{tax.name}</span>
        {tax.rate !== null && (
          <span className="text-[10px] text-txt-tertiary font-mono">({pct(tax.rate)})</span>
        )}
        <button
          onClick={() => onToggleTooltip(isTooltipOpen ? null : taxId)}
          className="text-txt-tertiary hover:text-gold-400 transition-colors"
          aria-label={`Ver lei: ${tax.law}`}
        >
          <Info size={12} />
        </button>
        <AnimatePresence>
          {isTooltipOpen && (
            <motion.span
              className="absolute left-0 top-full mt-1 z-10 bg-navy-800 border border-navy-700 text-[10px] text-txt-secondary px-3 py-2 rounded-lg shadow-card max-w-xs"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <span className="font-medium text-gold-400">{tax.law}</span>
              {tax.note && <span className="block mt-0.5 text-txt-tertiary">{tax.note}</span>}
              <span className="block mt-0.5 text-txt-tertiary">Tipo: {tax.type}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="font-mono font-medium text-gold-400">{fmt(tax.amount)}</span>
    </div>
  )
}

function ChainArrow({ value, delay }: { value: number; delay: number }) {
  return (
    <motion.div
      className="flex flex-col items-center py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.div
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ArrowDown size={18} className="text-gold-400/60" />
      </motion.div>
      <span className="text-[10px] font-mono text-txt-tertiary">{fmt(value)}</span>
    </motion.div>
  )
}

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <span className="text-xs text-txt-tertiary block">{label}</span>
      <span
        className={`text-sm font-mono font-medium ${highlight ? 'text-gold-300' : 'text-white'}`}
      >
        {value}
      </span>
    </div>
  )
}
