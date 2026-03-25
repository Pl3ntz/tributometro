import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Search, Filter } from 'lucide-react'
import { api } from '../services/api'
import type { Transaction } from '../types'

const SOURCE_CONFIG: Record<string, { label: string; dot: string }> = {
  nfce:   { label: 'NFCe',   dot: 'bg-success' },
  ofx:    { label: 'OFX',    dot: 'bg-alert-400' },
  manual: { label: 'Manual', dot: 'bg-content-tertiary' },
}

function confidenceBadge(c: number | null) {
  if (c === null) return { label: 'N/A', cls: 'text-content-tertiary' }
  if (c >= 0.9) return { label: 'Verificado', cls: 'text-success' }
  if (c >= 0.6) return { label: 'Estimado', cls: 'text-alert-400' }
  return { label: 'Aproximado', cls: 'text-blood-400' }
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState('')
  const [source, setSource] = useState('')

  useEffect(() => {
    setLoading(true)
    api.getTransactions({ month: month || undefined, source: source || undefined })
      .then(setTransactions).catch(() => {}).finally(() => setLoading(false))
  }, [month, source])

  return (
    <div className="space-y-5">
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-xl font-semibold text-content-primary">Rastreamento</h1>
          <p className="text-content-tertiary text-sm mt-0.5">{transactions.length} compras analisadas</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary" />
            <input type="month" value={month} onChange={e => setMonth(e.target.value)}
              className="rounded-xl pl-8 pr-3 py-2 text-sm focus:outline-none transition-all w-40"
              style={{ backgroundColor: '#0C1525', color: '#B8C4D6', border: '1px solid #163356' }} />
          </div>
          <select value={source} onChange={e => setSource(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm focus:outline-none transition-all"
            style={{ backgroundColor: '#0C1525', color: '#B8C4D6', border: '1px solid #163356' }}>
            <option value="">Todas</option>
            <option value="nfce">NFCe</option>
            <option value="ofx">OFX</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="h-16 bg-base-850 rounded-xl shadow-card"
              animate={{ opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' as const }} />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <motion.div className="flex flex-col items-center justify-center py-20 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Search size={40} className="text-content-tertiary mb-4" />
          <p className="text-content-secondary">Nenhuma transação encontrada.</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {transactions.map((txn, i) => {
            const totalTax = txn.tax_breakdowns.reduce((s, tb) => s + tb.amount, 0)
            const src = SOURCE_CONFIG[txn.source] || SOURCE_CONFIG.manual
            const conf = confidenceBadge(txn.confidence)
            return (
              <motion.div key={txn.id}
                className="group flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-card shadow-card hover:shadow-card-hover transition-shadow"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}>
                <div className="w-14 text-center flex-shrink-0">
                  <p className="text-xs font-semibold text-content-primary">{fmtDate(txn.date).split(' ')[0]}</p>
                  <p className="text-[10px] text-content-tertiary uppercase">{fmtDate(txn.date).split(' ')[1]}</p>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${src.dot}`} title={src.label} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-content-primary truncate">{txn.description}</p>
                  <div className="flex gap-2 mt-0.5">
                    <span className="text-[10px] text-content-tertiary">{(txn.category || 'outros').replace(/_/g, ' ')}</span>
                    {txn.tax_breakdowns.slice(0, 3).map((tb, j) => (
                      <span key={j} className="text-[10px] text-content-tertiary">{tb.tax_type} {fmt(tb.amount)}</span>
                    ))}
                  </div>
                </div>
                <span className={`text-[10px] font-medium flex-shrink-0 ${conf.cls}`}>{conf.label}</span>
                <div className="text-right flex-shrink-0 w-28">
                  <p className="text-sm font-semibold text-content-primary">{fmt(txn.amount)}</p>
                  <p className="text-xs text-blood-400 font-mono font-medium">{fmt(totalTax)} imp.</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
