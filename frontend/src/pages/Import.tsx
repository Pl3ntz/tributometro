import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Upload, FileText, QrCode, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import { api } from '../services/api'
import type { Transaction } from '../types'

type Status = 'idle' | 'loading' | 'success' | 'error'
interface Result { status: Status; message: string; transactions: Transaction[] }
const EMPTY: Result = { status: 'idle', message: '', transactions: [] }
function fmt(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }

export default function Import() {
  const [nfceUrl, setNfceUrl] = useState('')
  const [nfceResult, setNfceResult] = useState<Result>(EMPTY)
  const [fileResult, setFileResult] = useState<Result>(EMPTY)
  const [dragOver, setDragOver] = useState(false)

  const handleNfceScan = async () => {
    if (!nfceUrl.trim()) return
    setNfceResult({ status: 'loading', message: 'Consultando SEFAZ...', transactions: [] })
    try {
      const txns = await api.scanNfce(nfceUrl.trim())
      setNfceResult({ status: 'success', message: `${txns.length} itens importados`, transactions: txns })
      setNfceUrl('')
    } catch (e) { setNfceResult({ status: 'error', message: e instanceof Error ? e.message : 'Erro', transactions: [] }) }
  }

  const handleFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['ofx', 'csv'].includes(ext || '')) { setFileResult({ status: 'error', message: 'Use .ofx ou .csv', transactions: [] }); return }
    setFileResult({ status: 'loading', message: `Processando ${file.name}...`, transactions: [] })
    try {
      const txns = await api.importFile(ext === 'ofx' ? 'ofx' : 'csv', file)
      setFileResult({ status: 'success', message: `${txns.length} transações importadas`, transactions: txns })
    } catch (e) { setFileResult({ status: 'error', message: e instanceof Error ? e.message : 'Erro', transactions: [] }) }
  }, [])

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-content-primary">Importar</h1>
        <p className="text-content-tertiary text-sm mt-0.5">Adicione transações via nota fiscal, extrato ou manualmente</p>
      </motion.div>

      {/* NFCe */}
      <motion.div className="rounded-2xl bg-gradient-card shadow-card p-6 hover:shadow-card-hover transition-shadow"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shadow-card">
            <QrCode size={18} className="text-success" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-content-primary">Nota Fiscal (NFCe)</h2>
            <p className="text-[11px] text-content-tertiary">Maior precisão — dados direto da SEFAZ</p>
          </div>
          <span className="ml-auto text-[10px] font-medium text-success bg-success/10 px-2 py-0.5 rounded-md">Alta precisão</span>
        </div>
        <div className="flex gap-2 mt-4">
          <input type="text" value={nfceUrl} onChange={e => setNfceUrl(e.target.value)} placeholder="Cole a URL do QR Code aqui..."
            className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-all"
            style={{ backgroundColor: '#0C1525', color: '#FFFFFF', border: '1px solid #163356' }}
            onKeyDown={e => e.key === 'Enter' && handleNfceScan()} />
          <motion.button onClick={handleNfceScan} disabled={nfceResult.status === 'loading' || !nfceUrl.trim()}
            className="bg-blood-600 hover:bg-blood-500 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-xl shadow-glow-red transition-all flex items-center gap-2"
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            {nfceResult.status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          </motion.button>
        </div>
        <ResultFeedback result={nfceResult} />
      </motion.div>

      {/* File */}
      <motion.div className="rounded-2xl bg-gradient-card shadow-card p-6 hover:shadow-card-hover transition-shadow"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center shadow-card">
            <FileText size={18} className="text-info" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-content-primary">Extrato Bancário</h2>
            <p className="text-[11px] text-content-tertiary">OFX ou CSV do seu banco</p>
          </div>
          <span className="ml-auto text-[10px] font-medium text-info bg-info/10 px-2 py-0.5 rounded-md">Média precisão</span>
        </div>
        <motion.div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
          onClick={() => document.getElementById('file-input')?.click()}
          className={`mt-4 rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragOver ? 'bg-blood-500/5 shadow-glow-red scale-[1.01]' : 'bg-base-800 shadow-card hover:shadow-card-hover'
          }`}>
          <motion.div animate={dragOver ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Upload size={28} className="mx-auto text-content-tertiary mb-3" />
            <p className="text-sm text-content-secondary">Arraste ou clique para selecionar</p>
            <p className="text-[11px] text-content-tertiary mt-1">.ofx ou .csv</p>
          </motion.div>
          <input id="file-input" type="file" accept=".ofx,.csv" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} className="hidden" />
        </motion.div>
        <ResultFeedback result={fileResult} />
      </motion.div>
    </div>
  )
}

function ResultFeedback({ result }: { result: Result }) {
  const config = {
    loading: { bg: 'bg-base-850', text: 'text-blood-300', icon: <Loader2 size={14} className="animate-spin" /> },
    success: { bg: 'bg-base-850', text: 'text-success', icon: <CheckCircle size={14} /> },
    error:   { bg: 'bg-base-850', text: 'text-error', icon: <AlertCircle size={14} /> },
    idle:    { bg: '', text: '', icon: null },
  }
  return (
    <AnimatePresence>
      {result.status !== 'idle' && (
        <motion.div className={`mt-3 p-3 rounded-xl shadow-card flex items-start gap-2 ${config[result.status].bg}`}
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
          <span className={`mt-0.5 ${config[result.status].text}`}>{config[result.status].icon}</span>
          <div className="flex-1 min-w-0">
            <p className={`text-sm ${config[result.status].text}`}>{result.message}</p>
            {result.transactions.length > 0 && (
              <div className="mt-2 space-y-1">
                {result.transactions.slice(0, 4).map((txn, i) => {
                  const tax = txn.tax_breakdowns.reduce((s, tb) => s + tb.amount, 0)
                  return (
                    <motion.div key={txn.id} className="flex justify-between text-[11px] text-content-tertiary"
                      initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.04 }}>
                      <span className="truncate max-w-[200px]">{txn.description}</span>
                      <span className="font-mono text-content-secondary">{fmt(tax)}</span>
                    </motion.div>
                  )
                })}
                {result.transactions.length > 4 && <p className="text-[11px] text-content-tertiary">+{result.transactions.length - 4} mais</p>}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
