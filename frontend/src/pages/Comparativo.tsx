import { useState, useMemo } from 'react'
import SEO from '../components/SEO'
import { motion, AnimatePresence } from 'motion/react'
import {
  Scale,
  Info,
  Trophy,
  AlertTriangle,
  ChevronDown,
  Building2,
  Briefcase,
  FileText,
  User,
} from 'lucide-react'

// ────────────────────────────────────────────────────────────
// Formatters
// ────────────────────────────────────────────────────────────

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function pct(v: number) {
  return `${v.toFixed(1)}%`
}

// ────────────────────────────────────────────────────────────
// Constants (2026) — importadas da fonte única de verdade
// ────────────────────────────────────────────────────────────
import {
  INSS_FAIXAS, INSS_TETO, SALARIO_MINIMO_2026,
  IRPF_FAIXAS, IRPF_DESCONTO_SIMPLIFICADO, IRPF_ISENCAO_TOTAL_ATE, IRPF_REDUCAO_PARCIAL_ATE,
  SIMPLES_ANEXO_III, MEI, LUCRO_PRESUMIDO,
  ENCARGOS_MENSAIS_TOTAL, PROVISOES_TOTAL,
  calcINSS, calcIRPF,
} from '../constants/tax-tables'

const MEI_TETO_MENSAL = MEI.tetoMensal
const MEI_DAS_SERVICOS = MEI.dasServicos
const MEI_INSS = 75.90

const SALARY_SHORTCUTS = [
  { value: 1518, label: 'Sal. Minimo', desc: 'Piso nacional 2026' },
  { value: 2200, label: 'Operacional', desc: 'Auxiliar, atendente' },
  { value: 3500, label: 'Tecnico', desc: 'Tecnico, assistente' },
  { value: 5000, label: 'Classe media', desc: 'Analista, professor' },
  { value: 8000, label: 'Especialista', desc: 'Engenheiro, advogado' },
  { value: 15000, label: 'Gerencia', desc: 'Gerente, coordenador' },
  { value: 25000, label: 'Diretoria', desc: 'Diretor, C-level' },
  { value: 50000, label: 'Executivo', desc: 'CEO, socio' },
] as const

type Regime = 'clt' | 'simples' | 'presumido' | 'mei'

const REGIME_META: Record<Regime, { label: string; color: string; icon: React.ReactNode }> = {
  clt: { label: 'CLT', color: '#ECC94B', icon: <Building2 size={16} /> },
  simples: { label: 'Simples Nacional', color: '#63B3ED', icon: <Briefcase size={16} /> },
  presumido: { label: 'Lucro Presumido', color: '#63B3ED', icon: <FileText size={16} /> },
  mei: { label: 'MEI', color: '#48BB78', icon: <User size={16} /> },
}

// ────────────────────────────────────────────────────────────
// Tax item type
// ────────────────────────────────────────────────────────────

interface TaxItem {
  label: string
  value: number
  law: string
}

interface RegimeResult {
  regime: Regime
  custoEmpresa: number
  impostos: TaxItem[]
  totalImpostos: number
  liquido: number
  pctImpostos: number
  viable: boolean
  warning?: string
}

// ────────────────────────────────────────────────────────────
// Calculation functions (pure, no mutation)
// ────────────────────────────────────────────────────────────

// calcINSS e calcIRPF importados de ../constants/tax-tables

function calcINSSPJ(proLabore: number): number {
  return Math.min(proLabore, INSS_TETO) * 0.11
}

function calcSimplesEfetiva(faturamentoAnual: number): number {
  for (const faixa of SIMPLES_ANEXO_III) {
    if (faturamentoAnual <= faixa.maxRevenue) {
      return (faturamentoAnual * faixa.nominalRate - faixa.deduction) / faturamentoAnual
    }
  }
  return 0.33
}

function calcCLT(salarioBrutoDesejado: number): RegimeResult {
  const salario = salarioBrutoDesejado

  const inssPatronal = salario * 0.20
  const fgts = salario * 0.08
  const rat = salario * 0.02
  const sistemaS = salario * 0.058
  const encargos = salario * ENCARGOS_MENSAIS_TOTAL
  const decimoTerceiro = salario / 12
  const ferias = (salario / 12) * (4 / 3)
  const provisoes = salario * PROVISOES_TOTAL

  const custoEmpresa = salario + encargos + provisoes

  const inssEmpregado = calcINSS(salario)
  const irpf = calcIRPF(salario, inssEmpregado)
  const liquido = salario - inssEmpregado - irpf

  const impostos: TaxItem[] = [
    { label: 'INSS Patronal (20%)', value: inssPatronal, law: 'Lei 8.212/91, art. 22' },
    { label: 'FGTS (8%)', value: fgts, law: 'Lei 8.036/90, art. 15' },
    { label: 'RAT (2%)', value: rat, law: 'Lei 8.212/91, art. 22, II' },
    { label: 'Sistema S (5,8%)', value: sistemaS, law: 'Lei 8.029/90' },
    { label: '13º salário (prov.)', value: decimoTerceiro, law: 'Lei 4.090/62' },
    { label: 'Férias + 1/3 (prov.)', value: ferias, law: 'CLT art. 129-130' },
    { label: 'INSS Empregado', value: inssEmpregado, law: 'Portaria MPS/MF 13/2026' },
    { label: 'IRPF', value: irpf, law: 'Lei 15.270/2025' },
  ]

  const totalImpostos = custoEmpresa - liquido

  return {
    regime: 'clt',
    custoEmpresa,
    impostos,
    totalImpostos,
    liquido,
    pctImpostos: (totalImpostos / custoEmpresa) * 100,
    viable: true,
  }
}

function calcSimples(salarioBrutoDesejado: number): RegimeResult {
  const faturamentoMensal = salarioBrutoDesejado * 1.4
  const faturamentoAnual = faturamentoMensal * 12

  if (faturamentoAnual > 4800000) {
    return {
      regime: 'simples',
      custoEmpresa: faturamentoMensal,
      impostos: [],
      totalImpostos: 0,
      liquido: 0,
      pctImpostos: 0,
      viable: false,
      warning: 'Faturamento anual excede o teto do Simples Nacional (R$ 4.800.000)',
    }
  }

  const aliquotaEfetiva = calcSimplesEfetiva(faturamentoAnual)
  const das = faturamentoMensal * aliquotaEfetiva

  const proLabore = Math.max(SALARIO_MINIMO_2026, salarioBrutoDesejado * 0.4)
  const inssPJ = calcINSSPJ(proLabore)

  const irpfProLabore = calcIRPF(proLabore, inssPJ)

  const distribuicaoLucros = faturamentoMensal - das - proLabore - inssPJ
  const liquido = proLabore - inssPJ - irpfProLabore + Math.max(0, distribuicaoLucros)

  const impostos: TaxItem[] = [
    { label: `DAS Simples (${pct(aliquotaEfetiva * 100)} efetivo)`, value: das, law: 'LC 123/2006 + LC 155/2016' },
    { label: `INSS Pro-labore (11%)`, value: inssPJ, law: 'Lei 8.212/91, art. 21' },
    { label: 'IRPF sobre pro-labore', value: irpfProLabore, law: 'Lei 15.270/2025' },
  ]

  const totalImpostos = das + inssPJ + irpfProLabore

  return {
    regime: 'simples',
    custoEmpresa: faturamentoMensal,
    impostos,
    totalImpostos,
    liquido,
    pctImpostos: (totalImpostos / faturamentoMensal) * 100,
    viable: true,
  }
}

function calcPresumido(salarioBrutoDesejado: number): RegimeResult {
  const faturamentoMensal = salarioBrutoDesejado * 1.4

  const pis = faturamentoMensal * 0.0065
  const cofins = faturamentoMensal * 0.03
  const irpj = faturamentoMensal * 0.32 * 0.15
  const csll = faturamentoMensal * 0.32 * 0.09
  const iss = faturamentoMensal * 0.05

  const proLabore = Math.max(SALARIO_MINIMO_2026, salarioBrutoDesejado * 0.4)
  const inssPJ = calcINSSPJ(proLabore)

  const irpfProLabore = calcIRPF(proLabore, inssPJ)

  const totalTributosPJ = pis + cofins + irpj + csll + iss
  const distribuicaoLucros = faturamentoMensal - totalTributosPJ - proLabore - inssPJ
  const liquido = proLabore - inssPJ - irpfProLabore + Math.max(0, distribuicaoLucros)

  const impostos: TaxItem[] = [
    { label: 'PIS (0,65%)', value: pis, law: 'Lei 9.718/98, art. 4º' },
    { label: 'COFINS (3%)', value: cofins, law: 'Lei 9.718/98, art. 4º' },
    { label: 'IRPJ (15% x 32%)', value: irpj, law: 'RIR/2018, art. 591' },
    { label: 'CSLL (9% x 32%)', value: csll, law: 'Lei 7.689/88' },
    { label: 'ISS (5%)', value: iss, law: 'LC 116/2003' },
    { label: 'INSS Pro-labore (11%)', value: inssPJ, law: 'Lei 8.212/91, art. 21' },
    { label: 'IRPF sobre pro-labore', value: irpfProLabore, law: 'Lei 15.270/2025' },
  ]

  const totalImpostos = totalTributosPJ + inssPJ + irpfProLabore

  return {
    regime: 'presumido',
    custoEmpresa: faturamentoMensal,
    impostos,
    totalImpostos,
    liquido,
    pctImpostos: (totalImpostos / faturamentoMensal) * 100,
    viable: true,
  }
}

function calcMEI(salarioBrutoDesejado: number): RegimeResult {
  if (salarioBrutoDesejado > MEI_TETO_MENSAL) {
    return {
      regime: 'mei',
      custoEmpresa: salarioBrutoDesejado,
      impostos: [],
      totalImpostos: 0,
      liquido: 0,
      pctImpostos: 0,
      viable: false,
      warning: `Valor excede o teto MEI de ${fmt(MEI_TETO_MENSAL)}/mes (R$ 81.000/ano)`,
    }
  }

  const faturamentoMensal = salarioBrutoDesejado
  const das = MEI_DAS_SERVICOS
  const liquido = faturamentoMensal - das

  const impostos: TaxItem[] = [
    { label: `DAS MEI fixo (INSS 5% min.)`, value: MEI_INSS, law: 'LC 123/2006, art. 18-A' },
    { label: 'ISS fixo', value: das - MEI_INSS, law: 'LC 123/2006, art. 18-A, par. 3' },
  ]

  return {
    regime: 'mei',
    custoEmpresa: faturamentoMensal,
    impostos,
    totalImpostos: das,
    liquido,
    pctImpostos: (das / faturamentoMensal) * 100,
    viable: true,
  }
}

function calcRegime(regime: Regime, valor: number): RegimeResult {
  switch (regime) {
    case 'clt': return calcCLT(valor)
    case 'simples': return calcSimples(valor)
    case 'presumido': return calcPresumido(valor)
    case 'mei': return calcMEI(valor)
  }
}

// ────────────────────────────────────────────────────────────
// Tooltip component
// ────────────────────────────────────────────────────────────

function LawBadge({ law }: { law: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded"
      style={{ backgroundColor: '#232328', color: '#6B6B7B', border: '1px solid #2C2C33' }}
    >
      <Info size={8} />
      {law}
    </span>
  )
}

// ────────────────────────────────────────────────────────────
// Page component
// ────────────────────────────────────────────────────────────

export default function Comparativo() {
  const [salary, setSalary] = useState('')
  const [selectedRegimes, setSelectedRegimes] = useState<ReadonlyArray<Regime>>(['clt', 'simples'])

  const parsedSalary = useMemo(() => {
    const raw = salary.replace(/\D/g, '')
    return parseInt(raw || '0', 10) / 100
  }, [salary])

  const results = useMemo(() => {
    if (parsedSalary <= 0) return []
    return selectedRegimes.map((r) => calcRegime(r, parsedSalary))
  }, [parsedSalary, selectedRegimes])

  const bestRegime = useMemo(() => {
    const viable = results.filter((r) => r.viable)
    if (viable.length === 0) return null
    return viable.reduce((best, curr) => (curr.liquido > best.liquido ? curr : best))
  }, [results])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const num = parseInt(raw || '0', 10) / 100
    setSalary(num > 0 ? num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')
  }

  const toggleRegime = (regime: Regime) => {
    setSelectedRegimes((prev) => {
      if (prev.includes(regime)) {
        return prev.length > 1 ? prev.filter((r) => r !== regime) : prev
      }
      return [...prev, regime]
    })
  }


  return (
    <div className="space-y-6 max-w-6xl">
      <SEO
        title="CLT vs PJ — Comparativo de Regimes Tributários"
        description="Compare CLT, Simples Nacional, Lucro Presumido e MEI lado a lado. Veja qual regime paga menos imposto para o seu salário. Base legal 2026."
        path="/comparativo"
      />
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-txt-primary flex items-center gap-2">
          <Scale size={22} className="text-info" />
          Comparativo de Regimes
        </h1>
        <p className="text-txt-tertiary text-sm mt-0.5">
          Compare CLT, Simples Nacional, Lucro Presumido e MEI lado a lado
        </p>
      </motion.div>

      {/* Input section */}
      <motion.div
        className="rounded-2xl bg-gradient-card shadow-elevated p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="text-xs text-txt-tertiary uppercase tracking-wider block mb-3" htmlFor="comp-salary-input">
          Quanto voce quer ganhar (bruto mensal)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-tertiary text-sm font-mono">R$</span>
            <input
              type="text"
              value={salary}
              onChange={handleInput}
              id="comp-salary-input" inputMode="numeric" autoComplete="off" placeholder="5.000,00"
              className="w-full rounded-xl pl-12 pr-4 py-3.5 text-lg font-mono focus:outline-none transition-all"
              style={{ backgroundColor: '#1A1A1E', color: '#EDEDF0', border: '1px solid #3D3D48', caretColor: '#F5B731' }}
            />
          </div>
        </div>

        {/* Shortcuts */}
        <div className="flex flex-wrap gap-2 mt-4">
          {SALARY_SHORTCUTS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setSalary(value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))}
              className="group flex flex-col items-start px-3 py-2 rounded-lg transition-all hover:scale-[1.03]"
              style={{ backgroundColor: '#232328', border: '1px solid #2C2C33' }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#E5A21640'
                e.currentTarget.style.backgroundColor = '#1C1C2E'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#2C2C33'
                e.currentTarget.style.backgroundColor = '#232328'
              }}
            >
              <span className="text-xs font-medium text-txt-primary">{label}</span>
              <span className="text-[10px] text-txt-tertiary font-mono">{fmt(value)}</span>
              <span className="text-[11px] text-txt-tertiary mt-0.5">{desc}</span>
            </button>
          ))}
        </div>

        {/* Regime toggles */}
        <div className="mt-5">
          <label className="text-xs text-txt-tertiary uppercase tracking-wider block mb-2">Regimes para comparar</label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(REGIME_META) as Regime[]).map((regime) => {
              const meta = REGIME_META[regime]
              const isSelected = selectedRegimes.includes(regime)
              return (
                <motion.button
                  key={regime}
                  onClick={() => toggleRegime(regime)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isSelected ? `${meta.color}15` : '#232328',
                    border: `1px solid ${isSelected ? `${meta.color}50` : '#2C2C33'}`,
                    color: isSelected ? meta.color : '#A0A0AE',
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {meta.icon}
                  {meta.label}
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            key="results"
            className="space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {results.map((result, idx) => (
                <RegimeCard key={result.regime} result={result} isBest={bestRegime?.regime === result.regime} delay={idx * 0.08} />
              ))}
            </div>

            {/* Comparative bar */}
            <motion.div
              className="rounded-2xl bg-gradient-card shadow-card p-6"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-sm font-medium text-txt-primary mb-4 flex items-center gap-2">
                Comparativo visual
                {bestRegime && bestRegime.viable && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ backgroundColor: '#48BB7820', color: '#48BB78' }}>
                    <Trophy size={10} className="inline mr-1" />
                    {REGIME_META[bestRegime.regime].label} mais vantajoso
                  </span>
                )}
              </h3>
              <div className="space-y-4">
                {results.filter((r) => r.viable).map((result) => {
                  const meta = REGIME_META[result.regime]
                  const isBest = bestRegime?.regime === result.regime
                  return (
                    <div key={result.regime} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-txt-secondary font-medium">{meta.label}</span>
                        <span className="font-mono text-txt-tertiary">
                          {fmt(result.liquido)} liquido ({pct(result.pctImpostos)} impostos)
                        </span>
                      </div>
                      <div className="flex h-6 rounded-lg overflow-hidden" style={{ backgroundColor: '#111113' }}>
                        <motion.div
                          className="h-full rounded-l-lg"
                          style={{
                            backgroundColor: isBest ? '#48BB78' : meta.color,
                            opacity: isBest ? 1 : 0.8,
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${((result.liquido / result.custoEmpresa) * 100)}%` }}
                          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <motion.div
                          className="h-full"
                          style={{ backgroundColor: '#E5A216', opacity: 0.6 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${((result.totalImpostos / result.custoEmpresa) * 100)}%` }}
                          transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: isBest ? '#48BB78' : meta.color }} />
                          <span className="text-txt-tertiary">Liquido</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: '#E5A216', opacity: 0.6 }} />
                          <span className="text-txt-tertiary">Impostos</span>
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Premissas */}
            <motion.div
              className="rounded-2xl bg-gradient-card shadow-card p-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xs font-medium text-txt-tertiary uppercase tracking-wider mb-3">Premissas do cálculo</h3>
              <div className="space-y-1.5 text-[11px] text-txt-tertiary">
                <p>• Faturamento PJ estimado em 1,4× o salário desejado (premissa de margem para custos operacionais)</p>
                <p>• RAT/SAT: 2% (risco médio) — varia de 1% a 3% conforme CNAE (Lei 8.212/91, art. 22, II)</p>
                <p>• ISS: 5% (alíquota máxima) — varia de 2% a 5% conforme município (LC 116/2003)</p>
                <p>• Pró-labore PJ: 40% do faturamento ou salário mínimo (o maior)</p>
                <p>• Distribuição de lucros PJ: isenta de IR (Lei 9.249/95, art. 10)</p>
                <p>• CLT: sem provisão de multa rescisória (incide apenas em demissão sem justa causa)</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ────────────────────────────────────────────────────────────
// Regime card
// ────────────────────────────────────────────────────────────

function RegimeCard({ result, isBest, delay }: { result: RegimeResult; isBest: boolean; delay: number }) {
  const meta = REGIME_META[result.regime]
  const [expanded, setExpanded] = useState(false)

  if (!result.viable) {
    return (
      <motion.div
        className="rounded-2xl p-5"
        style={{ backgroundColor: '#2E2008', border: '1px solid #E5A21630' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span style={{ color: meta.color }}>{meta.icon}</span>
          <span className="text-sm font-medium text-txt-primary">{meta.label}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-accent-400">
          <AlertTriangle size={14} />
          {result.warning}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`rounded-2xl bg-gradient-card shadow-card p-5 relative overflow-hidden ${isBest ? 'ring-1' : ''}`}
      style={isBest ? { boxShadow: '0 0 20px rgba(72, 187, 120, 0.15), inset 0 0 0 1px rgba(72, 187, 120, 0.3)' } : undefined}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      {isBest && (
        <div
          className="absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[11px] font-semibold"
          style={{ backgroundColor: '#48BB7825', color: '#48BB78' }}
        >
          <Trophy size={9} className="inline mr-0.5 mb-px" />
          MELHOR
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <span style={{ color: meta.color }}>{meta.icon}</span>
        <span className="text-sm font-medium text-txt-primary">{meta.label}</span>
      </div>

      {/* Custo empresa */}
      <div className="mb-3">
        <p className="text-[10px] text-txt-tertiary uppercase tracking-wider">Custo contratante</p>
        <p className="text-lg font-bold font-mono text-txt-secondary">{fmt(result.custoEmpresa)}</p>
      </div>

      {/* Liquido */}
      <div className="mb-3">
        <p className="text-[10px] text-txt-tertiary uppercase tracking-wider">Valor liquido</p>
        <p className={`text-xl font-bold font-mono ${isBest ? 'text-success' : 'text-txt-primary'}`}>
          {fmt(result.liquido)}
        </p>
      </div>

      {/* % impostos */}
      <div className="mb-4">
        <p className="text-[10px] text-txt-tertiary uppercase tracking-wider">Total impostos</p>
        <div className="flex items-center gap-2">
          <p className="text-base font-bold font-mono text-accent-400">{pct(result.pctImpostos)}</p>
          <span className="text-[10px] text-txt-tertiary font-mono">({fmt(result.totalImpostos)})</span>
        </div>
      </div>

      {/* Mini bar */}
      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: '#111113' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: isBest ? '#48BB78' : meta.color }}
          initial={{ width: 0 }}
          animate={{ width: `${((result.liquido / result.custoEmpresa) * 100)}%` }}
          transition={{ delay: delay + 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Expandable detail */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 text-[10px] text-txt-tertiary hover:text-txt-secondary transition-colors"
      >
        <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        Detalhamento
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 mt-2 pt-2" style={{ borderTop: '1px solid #2C2C33' }}>
              {result.impostos.map((item) => (
                <div key={item.label} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-txt-tertiary">{item.label}</span>
                    <span className="text-accent-400 font-mono font-medium">{fmt(item.value)}</span>
                  </div>
                  <LawBadge law={item.law} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
