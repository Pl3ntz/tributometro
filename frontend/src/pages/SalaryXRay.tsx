import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, ArrowDown, Building2, User, ShoppingBag, Target, Clock, Calendar, AlertTriangle, ChevronDown } from 'lucide-react'
import { api } from '../services/api'
import type { SalaryBreakdown } from '../types'
import SEO from '../components/SEO'

function fmt(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }
function pct(v: number) { return `${v.toFixed(1)}%` }

export default function SalaryXRay() {
  const [salary, setSalary] = useState('')
  const [data, setData] = useState<SalaryBreakdown | null>(null)
  const [loading, setLoading] = useState(false)
  const [showConsumption, setShowConsumption] = useState(false)

  const handleCalculate = async () => {
    const val = parseFloat(salary.replace(/\D/g, '')) / 100
    if (!val || val <= 0) return
    setLoading(true)
    try {
      const result = await api.getSalaryBreakdown(val)
      setData(result)
    } catch { /* */ }
    finally { setLoading(false) }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw || '0', 10) / 100
    setSalary(num > 0 ? num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')
  }

  return (
    <div className="space-y-6">
      <SEO
        title="Raio-X do Salário — Quanto do seu dinheiro é imposto"
        description="Calculadora que mostra a cascata completa: custo da empresa, encargos, INSS, IRPF, impostos no consumo e seu poder de compra real. Tabelas 2026."
        path="/raio-x"
      />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-txt-primary">Raio-X do Salário</h1>
        <p className="text-txt-tertiary text-sm mt-0.5">
          Descubra quanto do seu dinheiro é imposto — do custo da empresa ao seu poder de compra real
        </p>
      </motion.div>

      {/* Input */}
      <motion.div
        className="rounded-2xl bg-gradient-card shadow-elevated p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="text-xs text-txt-tertiary uppercase tracking-wider block mb-3">Salário bruto mensal (CLT)</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-tertiary text-sm font-mono">R$</span>
            <input
              type="text"
              value={salary}
              onChange={handleInput}
              placeholder="5.000,00"
              className="w-full rounded-xl pl-12 pr-4 py-3.5 text-lg font-mono focus:outline-none transition-all"
              style={{ caretColor: '#F5B731' }}
              onKeyDown={e => e.key === 'Enter' && handleCalculate()}
            />
          </div>
          <motion.button
            onClick={handleCalculate}
            disabled={loading || !salary}
            className="bg-accent-400 hover:bg-accent-500 disabled:opacity-40 text-surface-0 font-semibold px-8 py-3.5 rounded-xl shadow-glow transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search size={18} />
            Analisar
          </motion.button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { value: 1518, label: 'Sal. Mínimo', desc: 'Piso nacional 2026' },
            { value: 2200, label: 'Operacional', desc: 'Auxiliar, atendente' },
            { value: 3500, label: 'Técnico', desc: 'Técnico, assistente' },
            { value: 5000, label: 'Classe média', desc: 'Analista, professor' },
            { value: 8000, label: 'Especialista', desc: 'Engenheiro, advogado' },
            { value: 15000, label: 'Gerência', desc: 'Gerente, coordenador' },
            { value: 25000, label: 'Diretoria', desc: 'Diretor, C-level' },
            { value: 50000, label: 'Executivo', desc: 'CEO, sócio' },
          ].map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => { setSalary(value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })); }}
              className="group flex flex-col items-start px-3 py-2 rounded-lg transition-all hover:scale-[1.03]"
              style={{ backgroundColor: '#232328', border: '1px solid #2C2C33' }}
              onMouseOver={e => { (e.currentTarget.style.borderColor = '#E5A21640'); (e.currentTarget.style.backgroundColor = '#1C1C2E'); }}
              onMouseOut={e => { (e.currentTarget.style.borderColor = '#2C2C33'); (e.currentTarget.style.backgroundColor = '#232328'); }}
            >
              <span className="text-xs font-medium text-txt-primary">{label}</span>
              <span className="text-[10px] text-txt-tertiary font-mono">{fmt(value)}</span>
              <span className="text-[9px] text-txt-tertiary mt-0.5">{desc}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" className="flex justify-center py-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-400" />
          </motion.div>
        )}

        {data && !loading && (
          <motion.div key="results" className="space-y-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* ── Summary hero ── */}
            <div className="rounded-2xl bg-gradient-hero shadow-glow-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-glow opacity-50" />
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent-800 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
              <div className="relative p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p className="text-xs text-accent-300/70 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <AlertTriangle size={12} />
                    O número que ninguém te mostra
                  </p>
                  <p className="text-4xl font-bold font-mono text-accent-300 drop-shadow-[0_0_20px_rgba(229,162,22,0.3)]">
                    {pct(data.summary.total_tax_percentage)}
                  </p>
                  <p className="text-txt-secondary text-sm mt-1">do dinheiro é consumido por impostos em todas as camadas</p>
                </div>
                <div className="flex gap-4">
                  <StatBadge icon={<Calendar size={14} />} value={`${data.summary.days_worked_for_tax} dias`} label="trabalhados p/ impostos" />
                  <StatBadge icon={<Clock size={14} />} value={`${data.summary.hours_worked_for_tax}h`} label="por mês" />
                </div>
              </div>
            </div>

            {/* ── Waterfall ── */}
            <div className="space-y-0">

              {/* Layer 1: Company */}
              <WaterfallLayer
                icon={<Building2 size={16} />}
                color="content-tertiary"
                title="A empresa precisa faturar"
                value={data.company.revenue_needed}
                delay={0.1}
              >
                <WaterfallItem label="Impostos sobre receita (PIS, COFINS, IRPJ, CSLL, ISS)" value={data.company.taxes_on_revenue} type="tax" />
                <WaterfallItem label="Encargos patronais (INSS 20%, FGTS 8%, RAT, Sistema S)" value={data.company.charges} type="tax" />
                <WaterfallItem label="Provisões (13º, férias, multa FGTS)" value={data.company.provisions} type="tax" />
              </WaterfallLayer>

              <FlowArrow />

              {/* Layer 2: Gross */}
              <WaterfallLayer
                icon={<User size={16} />}
                color="alert-400"
                title="Você recebe bruto"
                value={data.gross_salary}
                delay={0.25}
              >
                <WaterfallItem label={`INSS empregado (${pct(data.employee.inss_rate)} efetivo)`} value={data.employee.inss} type="tax" />
                <WaterfallItem label={`IRPF (${pct(data.employee.irpf_rate)} efetivo)${data.employee.irpf === 0 ? ' — Isento em 2026 até R$5k' : ''}`} value={data.employee.irpf} type={data.employee.irpf === 0 ? 'exempt' : 'tax'} />
              </WaterfallLayer>

              <FlowArrow />

              {/* Layer 3: Net */}
              <WaterfallLayer
                icon={<ShoppingBag size={16} />}
                color="alert-400"
                title="Cai na sua conta"
                value={data.employee.net_salary}
                delay={0.4}
              >
                <div className="mb-2">
                  <button
                    onClick={() => setShowConsumption(!showConsumption)}
                    className="flex items-center gap-2 text-xs text-txt-tertiary hover:text-txt-secondary transition-colors"
                  >
                    <ChevronDown size={14} className={`transition-transform ${showConsumption ? 'rotate-180' : ''}`} />
                    Impostos embutidos ao consumir ({fmt(data.consumption.total_tax)})
                  </button>
                </div>
                <AnimatePresence>
                  {showConsumption && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-1.5 pt-1">
                        {data.consumption.breakdown.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <span className="text-txt-tertiary">{item.category}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-txt-tertiary">{fmt(item.spent)}</span>
                              <span className="text-accent-400 font-mono font-medium w-20 text-right">{fmt(item.tax)}</span>
                              <span className="text-txt-tertiary w-10 text-right">{pct(item.tax_rate * 100)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </WaterfallLayer>

              <FlowArrow />

              {/* Layer 4: Real purchasing power */}
              <WaterfallLayer
                icon={<Target size={16} />}
                color="accent-400"
                title="Seu poder de compra REAL"
                value={data.summary.real_purchasing_power}
                highlight
                delay={0.55}
              />
            </div>

            {/* ── Visual bar comparison ── */}
            <motion.div
              className="rounded-2xl bg-gradient-card shadow-card p-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-sm font-medium text-txt-primary mb-4">De cada R$ 100 que a empresa gasta com você</h3>
              <div className="space-y-3">
                <BarRow label="Impostos s/ receita" value={data.company.taxes_on_revenue} total={data.company.revenue_needed} color="bg-surface-4" />
                <BarRow label="Encargos + provisões" value={data.company.charges + data.company.provisions} total={data.company.revenue_needed} color="bg-accent-600" />
                <BarRow label="INSS + IRPF" value={data.employee.inss + data.employee.irpf} total={data.company.revenue_needed} color="bg-accent-400" />
                <BarRow label="Impostos no consumo" value={data.consumption.total_tax} total={data.company.revenue_needed} color="bg-alert-600" />
                <BarRow label="Poder de compra real" value={data.summary.real_purchasing_power} total={data.company.revenue_needed} color="bg-success" highlight />
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatBadge({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-surface-2 shadow-card rounded-xl px-4 py-3 text-center min-w-[100px]">
      <div className="flex items-center justify-center gap-1.5 text-alert-400 mb-1">{icon}<span className="font-mono font-bold text-lg">{value}</span></div>
      <p className="text-[10px] text-txt-tertiary">{label}</p>
    </div>
  )
}

function WaterfallLayer({ icon, color, title, value, children, highlight, delay = 0 }: {
  icon: React.ReactNode; color: string; title: string; value: number; children?: React.ReactNode; highlight?: boolean; delay?: number
}) {
  return (
    <motion.div
      className={`rounded-2xl p-5 ${highlight ? 'bg-blood-950/40 shadow-glow' : 'bg-gradient-card shadow-card'}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-${color}`}>{icon}</span>
          <span className="text-sm font-medium text-txt-primary">{title}</span>
        </div>
        <span className={`text-xl font-bold font-mono ${highlight ? 'text-accent-300 drop-shadow-[0_0_12px_rgba(229,162,22,0.3)]' : 'text-txt-primary'}`}>
          {fmt(value)}
        </span>
      </div>
      {children && <div className="space-y-1.5 ml-7">{children}</div>}
    </motion.div>
  )
}

function WaterfallItem({ label, value, type }: { label: string; value: number; type: 'tax' | 'exempt' }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-txt-tertiary">{label}</span>
      <span className={`font-mono font-medium ${type === 'exempt' ? 'text-success' : 'text-accent-400'}`}>
        {type === 'exempt' && value === 0 ? 'R$ 0,00 ✓' : `- ${fmt(value)}`}
      </span>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="flex justify-center py-1">
      <ArrowDown size={16} className="text-base-600" />
    </div>
  )
}

function BarRow({ label, value, total, color, highlight }: { label: string; value: number; total: number; color: string; highlight?: boolean }) {
  const width = total > 0 ? (value / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs w-40 flex-shrink-0 ${highlight ? 'text-txt-primary font-semibold' : 'text-txt-tertiary'}`}>{label}</span>
      <div className="flex-1 h-3 rounded-full bg-surface-1 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
        <motion.div
          className={`h-full rounded-full ${color} ${highlight ? 'shadow-[0_0_8px_rgba(34,197,94,0.3)]' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ delay: 0.8, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className={`text-xs font-mono w-20 text-right flex-shrink-0 ${highlight ? 'text-success font-bold' : 'text-txt-tertiary'}`}>
        {fmt(value)}
      </span>
    </div>
  )
}
