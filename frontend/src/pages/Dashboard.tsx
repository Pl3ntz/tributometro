import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart,
} from 'recharts'
import { AlertTriangle, Zap, ShieldCheck, HelpCircle, Fuel, ShoppingCart, Utensils, Pill, Phone, Laptop, CreditCard, Eye, Clock, TrendingDown } from 'lucide-react'
import { api } from '../services/api'
import type { DashboardSummary, MonthlyData } from '../types'
import AnimatedCounter from '../components/AnimatedCounter'
import FlipCounter from '../components/FlipCounter'

const CHART_COLORS = ['#DC2626', '#F59E0B', '#EF4444', '#FBBF24', '#B91C1C', '#D97706', '#F87171', '#FCD34D']

const TAX_LABELS: Record<string, string> = {
  ICMS: 'ICMS', ISS: 'ISS', PIS: 'PIS', COFINS: 'COFINS',
  IOF: 'IOF', IPI: 'IPI', CIDE: 'CIDE', II: 'Import.', OUTROS: 'Outros',
}

const CATEGORY_ICONS: Record<string, typeof Fuel> = {
  combustivel: Fuel, supermercado: ShoppingCart, restaurante: Utensils,
  farmacia: Pill, telefonia: Phone, eletronicos: Laptop,
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function pct(v: number) { return `${(v * 100).toFixed(1)}%` }

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [monthly, setMonthly] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, m] = await Promise.all([api.getDashboardSummary(), api.getMonthlyData()])
        setSummary(s)
        setMonthly(m)
      } catch { /* */ }
      finally { setLoading(false) }
    }
    load()
  }, [])

  if (loading) return <DashboardSkeleton />

  if (!summary) {
    return (
      <motion.div className="flex flex-col items-center justify-center h-[60vh] text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="w-20 h-20 rounded-2xl bg-base-850 shadow-card flex items-center justify-center mb-6">
          <Eye size={32} className="text-blood-500" />
        </div>
        <h2 className="text-xl font-semibold text-content-primary mb-2">Nenhum imposto rastreado</h2>
        <p className="text-content-tertiary text-sm max-w-sm">Importe uma nota fiscal ou extrato para ver o que estão escondendo no seu preço.</p>
      </motion.div>
    )
  }

  const taxData = Object.entries(summary.breakdown_by_type)
    .map(([type, amount]) => ({ name: TAX_LABELS[type] || type, value: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.value - a.value)

  const catData = Object.entries(summary.breakdown_by_category)
    .map(([cat, data]) => ({
      key: cat,
      label: cat.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      taxes: data.taxes, spent: data.total_spent,
      rate: data.total_spent > 0 ? data.taxes / data.total_spent : 0,
    }))
    .sort((a, b) => b.taxes - a.taxes)

  const monthlyChart = monthly.map(m => ({ month: m.month.slice(5), gastos: m.total_spent, impostos: m.total_taxes }))

  const periodLabel = new Date(summary.period + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const totalTxns = summary.precision_summary.high + summary.precision_summary.medium + summary.precision_summary.estimated
  const hoursForTax = Math.round(22 * 8 * summary.effective_tax_rate)

  return (
    <div className="space-y-5">
      {/* Page title */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-content-primary">Painel de Transparência</h1>
        <p className="text-content-tertiary text-sm mt-0.5 capitalize">{periodLabel}</p>
      </motion.div>

      {/* ═══ HERO — Flip Counter ═══ */}
      <motion.div
        className="relative rounded-2xl overflow-hidden shadow-glow-red-lg"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-glow opacity-60" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blood-500/[0.12] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />

        <div className="relative p-7 sm:p-9">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-md bg-blood-500/20 flex items-center justify-center">
              <AlertTriangle size={12} className="text-blood-400" />
            </div>
            <p className="text-xs font-mono text-blood-300/80 uppercase tracking-widest">
              Impostos embutidos nas suas compras
            </p>
          </div>

          <div className="text-3xl sm:text-[2.8rem] drop-shadow-[0_0_24px_rgba(220,38,38,0.35)]">
            <FlipCounter value={summary.total_taxes} />
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <span className="text-sm text-content-secondary">
              de <span className="text-content-primary font-semibold">{fmt(summary.total_spent)}</span>
            </span>
            <span className="text-[11px] font-mono font-semibold text-blood-300 bg-blood-500/15 px-2.5 py-1 rounded-md">
              {pct(summary.effective_tax_rate)} é imposto
            </span>
          </div>

          <div className="mt-5 pt-5 border-t border-blood-900/30">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-content-tertiary">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-alert-400" />
                <span className="text-alert-300">{hoursForTax}h</span> do seu trabalho foram para impostos
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={12} className="text-content-tertiary" />
                {summary.top_insight}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ KPI Cards ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KPICard delay={0} icon={<TrendingDown size={16} />} label="Taxa efetiva" danger
          value={<AnimatedCounter value={summary.effective_tax_rate * 100} formatter={v => `${v.toFixed(1)}%`} duration={1} />}
          sub="de cada real é imposto"
          ring={summary.effective_tax_rate}
        />
        <KPICard delay={0.06} icon={<ShieldCheck size={16} />} label="Transações rastreadas"
          value={<span>{totalTxns}</span>}
          sub={`${summary.precision_summary.high} verificadas · ${summary.precision_summary.medium} médias · ${summary.precision_summary.estimated} estimadas`}
        />
        <KPICard delay={0.12} icon={<Clock size={16} />} label="Horas tributadas" danger
          value={<span>{hoursForTax}h</span>}
          sub={`de ${22 * 8}h trabalhadas no mês`}
        />
      </div>

      {/* ═══ Tax type pills ═══ */}
      <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        {taxData.map((item, i) => (
          <motion.div
            key={item.name}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-850 shadow-card hover:shadow-card-hover transition-shadow cursor-default"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.04 }}
            whileHover={{ y: -1 }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
            <span className="text-xs text-content-tertiary">{item.name}</span>
            <span className="text-xs font-mono font-semibold text-blood-300">{fmt(item.value)}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ Charts ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <motion.div
          className="lg:col-span-2 rounded-2xl bg-gradient-card shadow-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-medium text-content-primary">Evolução Mensal</h2>
            <div className="flex items-center gap-4 text-[11px] text-content-tertiary">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-base-600" />Gastos</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blood-500" />Impostos</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={monthlyChart}>
              <defs>
                <linearGradient id="gGastos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4B5563" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4B5563" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gImpostos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#3D4450" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#3D4450" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `R$${v}`} width={60} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1C2024', border: 'none', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', padding: '10px 14px' }}
                labelStyle={{ color: '#9CA3AF', fontSize: 11, marginBottom: 4 }}
                itemStyle={{ fontSize: 12, padding: 0 }}
                formatter={(value: number) => fmt(value)}
                cursor={{ stroke: 'rgba(220, 38, 38, 0.2)' }}
              />
              <Area type="monotone" dataKey="gastos" stroke="#4B5563" fill="url(#gGastos)" strokeWidth={2} name="Gastos" animationDuration={1000} />
              <Area type="monotone" dataKey="impostos" stroke="#DC2626" fill="url(#gImpostos)" strokeWidth={2} name="Impostos" animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Donut */}
        <motion.div
          className="rounded-2xl bg-gradient-card shadow-card p-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-medium text-content-primary mb-1">Destino dos Impostos</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={taxData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3} animationDuration={800} animationBegin={300} strokeWidth={0}>
                {taxData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1C2024', border: 'none', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.6)', padding: '10px 14px' }}
                formatter={(value: number) => fmt(value)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {taxData.slice(0, 6).map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                <span className="text-content-tertiary truncate">{item.name}</span>
                <span className="text-content-danger font-mono font-medium ml-auto">{fmt(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ═══ Categories ═══ */}
      <motion.div
        className="rounded-2xl bg-gradient-card shadow-card p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-sm font-medium text-content-primary mb-5">Onde você mais paga imposto</h2>
        <div className="space-y-4">
          {catData.map((cat, i) => {
            const Icon = CATEGORY_ICONS[cat.key] || CreditCard
            const maxTax = catData[0]?.taxes || 1
            const barWidth = (cat.taxes / maxTax) * 100

            return (
              <motion.div
                key={cat.key}
                className="group flex items-center gap-3"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
              >
                <div className="w-9 h-9 rounded-xl bg-base-800 shadow-card flex items-center justify-center flex-shrink-0 group-hover:shadow-glow-red transition-shadow">
                  <Icon size={15} className="text-content-tertiary group-hover:text-blood-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-content-primary font-medium truncate">{cat.label}</span>
                    <div className="flex items-center gap-3 text-xs flex-shrink-0 ml-2">
                      <span className="text-content-tertiary">{fmt(cat.spent)}</span>
                      <span className="text-blood-400 font-mono font-semibold">{fmt(cat.taxes)}</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-base-900 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blood-700 to-blood-500"
                      style={{ boxShadow: '0 0 8px rgba(220, 38, 38, 0.3)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: 0.5 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
                <span className="text-xs text-alert-400 font-mono font-semibold w-12 text-right flex-shrink-0">
                  {pct(cat.rate)}
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ═══ Precision ═══ */}
      <motion.div
        className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-base-850 shadow-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <span className="text-[10px] text-content-tertiary font-mono uppercase tracking-wide">Precisão</span>
        <div className="flex-1 h-1.5 rounded-full bg-base-900 overflow-hidden flex shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
          {totalTxns > 0 && (
            <>
              <motion.div className="h-full bg-success" initial={{ width: 0 }} animate={{ width: `${(summary.precision_summary.high / totalTxns) * 100}%` }} transition={{ delay: 0.6, duration: 0.5 }} />
              <motion.div className="h-full bg-alert-400" initial={{ width: 0 }} animate={{ width: `${(summary.precision_summary.medium / totalTxns) * 100}%` }} transition={{ delay: 0.7, duration: 0.5 }} />
              <motion.div className="h-full bg-blood-500" initial={{ width: 0 }} animate={{ width: `${(summary.precision_summary.estimated / totalTxns) * 100}%` }} transition={{ delay: 0.8, duration: 0.5 }} />
            </>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono">
          <span className="flex items-center gap-1 text-success"><ShieldCheck size={11} />{summary.precision_summary.high}</span>
          <span className="flex items-center gap-1 text-alert-400"><HelpCircle size={11} />{summary.precision_summary.medium}</span>
          <span className="flex items-center gap-1 text-blood-400"><AlertTriangle size={11} />{summary.precision_summary.estimated}</span>
        </div>
      </motion.div>
    </div>
  )
}

/* ── KPI Card ── */
function KPICard({ label, value, sub, danger, delay = 0, ring, icon }: {
  label: string; value: React.ReactNode; sub?: string; danger?: boolean; delay?: number; ring?: number; icon?: React.ReactNode
}) {
  return (
    <motion.div
      className={`relative rounded-2xl p-5 overflow-hidden transition-shadow ${
        danger
          ? 'bg-gradient-to-br from-base-850 to-blood-950/40 shadow-glow-red'
          : 'bg-gradient-card shadow-card'
      }`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      {danger && <div className="absolute -top-16 -right-16 w-40 h-40 bg-blood-500/[0.06] rounded-full blur-3xl" />}
      <div className="flex items-center gap-2 mb-2.5 relative">
        <span className={`${danger ? 'text-blood-400' : 'text-content-tertiary'}`}>{icon}</span>
        <span className="text-[11px] font-medium text-content-tertiary uppercase tracking-wide">{label}</span>
      </div>
      <div className={`relative text-2xl font-bold font-mono ${danger ? 'text-blood-300' : 'text-content-primary'}`}>
        {value}
      </div>
      {sub && <p className="text-[11px] text-content-tertiary mt-2 relative leading-relaxed">{sub}</p>}
      {ring !== undefined && (
        <svg className="absolute top-4 right-4 w-11 h-11 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2.5" />
          <motion.circle
            cx="18" cy="18" r="14" fill="none" stroke="#DC2626" strokeWidth="2.5"
            strokeDasharray="88" strokeLinecap="round"
            initial={{ strokeDashoffset: 88 }}
            animate={{ strokeDashoffset: 88 - ring * 88 }}
            transition={{ delay: delay + 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(220, 38, 38, 0.4))' }}
          />
        </svg>
      )}
    </motion.div>
  )
}

/* ── Skeleton ── */
function DashboardSkeleton() {
  const shimmer = {
    animate: { opacity: [0.15, 0.3, 0.15] as number[] },
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' as const },
  }
  return (
    <div className="space-y-5">
      <div>
        <motion.div className="h-6 w-48 bg-base-850 rounded-lg" {...shimmer} />
        <motion.div className="h-4 w-28 bg-base-850 rounded-lg mt-2" {...shimmer} />
      </div>
      <motion.div className="h-52 bg-base-850 rounded-2xl shadow-card" {...shimmer} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => <motion.div key={i} className="h-28 bg-base-850 rounded-2xl shadow-card" {...shimmer} />)}
      </div>
      <motion.div className="h-72 bg-base-850 rounded-2xl shadow-card" {...shimmer} />
    </div>
  )
}
