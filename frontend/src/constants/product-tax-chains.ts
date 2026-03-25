/**
 * Cadeia tributaria completa de 12 produtos brasileiros — producao ate consumidor final.
 * Dados baseados em legislacao vigente 2026 (SC).
 *
 * Fontes:
 * - IBPT (Instituto Brasileiro de Planejamento e Tributacao)
 * - ANP (Agencia Nacional do Petroleo)
 * - Fecombustiveis
 * - Receita Federal
 * - ANEEL / CNI
 * - Lei 10.865/2004, LC 192/2022, Lei 10.147/2000
 */

// ── Types ──

export interface StageTax {
  readonly name: string
  readonly rate: number | null
  readonly amount: number
  readonly type: 'federal' | 'estadual' | 'municipal'
  readonly law: string
  readonly note?: string
}

export interface ChainStage {
  readonly label: string
  readonly icon: string
  readonly entryPrice: number
  readonly valueAdded: number
  readonly taxes: readonly StageTax[]
  readonly totalTaxes: number
  readonly exitPrice: number
  readonly cumulativeTaxes: number
  readonly note?: string
}

export interface ProductChain {
  readonly id: string
  readonly name: string
  readonly unit: string
  readonly icon: string
  readonly ncm: string
  readonly defaultPrice: number
  readonly taxRegime: string
  readonly stages: readonly ChainStage[]
  readonly totalTaxes: number
  readonly taxPercentage: number
  readonly priceWithoutTax: number
  readonly source: string
}

// ── Helpers ──

function buildStage(params: {
  readonly label: string
  readonly icon: string
  readonly entryPrice: number
  readonly valueAdded: number
  readonly taxes: readonly StageTax[]
  readonly previousCumulativeTaxes: number
  readonly note?: string
}): ChainStage {
  const totalTaxes = params.taxes.reduce((sum, t) => sum + t.amount, 0)
  const exitPrice = params.entryPrice + params.valueAdded + totalTaxes
  const cumulativeTaxes = params.previousCumulativeTaxes + totalTaxes

  return {
    label: params.label,
    icon: params.icon,
    entryPrice: round(params.entryPrice),
    valueAdded: round(params.valueAdded),
    taxes: params.taxes,
    totalTaxes: round(totalTaxes),
    exitPrice: round(exitPrice),
    cumulativeTaxes: round(cumulativeTaxes),
    ...(params.note ? { note: params.note } : {}),
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

function buildProduct(params: {
  readonly id: string
  readonly name: string
  readonly unit: string
  readonly icon: string
  readonly ncm: string
  readonly defaultPrice: number
  readonly taxRegime: string
  readonly stages: readonly ChainStage[]
  readonly source: string
}): ProductChain {
  const totalTaxes = params.stages.length > 0
    ? params.stages[params.stages.length - 1].cumulativeTaxes
    : 0
  const taxPercentage = round((totalTaxes / params.defaultPrice) * 100)
  const priceWithoutTax = round(params.defaultPrice - totalTaxes)

  return {
    ...params,
    totalTaxes: round(totalTaxes),
    taxPercentage,
    priceWithoutTax,
  }
}

// ── 1. Gasolina ──

const gasolinaStages: readonly ChainStage[] = (() => {
  const s1 = buildStage({
    label: 'Refinaria',
    icon: 'factory',
    entryPrice: 0,
    valueAdded: 2.10,
    taxes: [
      { name: 'PIS', rate: null, amount: 0.14, type: 'federal', law: 'Lei 10.865/2004' },
      { name: 'COFINS', rate: null, amount: 0.65, type: 'federal', law: 'Lei 10.865/2004' },
      { name: 'CIDE', rate: null, amount: 0.05, type: 'federal', law: 'Lei 10.336/2001' },
      { name: 'ICMS', rate: null, amount: 1.57, type: 'estadual', law: 'LC 192/2022', note: 'Monofasico — aliquota unica na refinaria' },
    ],
    previousCumulativeTaxes: 0,
    note: 'Preco de producao + tributos monofasicos',
  })

  const s2 = buildStage({
    label: 'Distribuidora',
    icon: 'truck',
    entryPrice: s1.exitPrice,
    valueAdded: 0.25,
    taxes: [],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'Impostos ja recolhidos na refinaria (monofasico)',
  })

  const s3 = buildStage({
    label: 'Mistura etanol anidro',
    icon: 'droplets',
    entryPrice: s2.exitPrice,
    valueAdded: 0.85,
    taxes: [],
    previousCumulativeTaxes: s2.cumulativeTaxes,
    note: 'Adicao de 27% de etanol anidro (obrigatorio)',
  })

  const s4 = buildStage({
    label: 'Posto de combustivel',
    icon: 'fuel',
    entryPrice: s3.exitPrice,
    valueAdded: 0.72,
    taxes: [],
    previousCumulativeTaxes: s3.cumulativeTaxes,
    note: 'Margem do revendedor — impostos ja recolhidos',
  })

  return [s1, s2, s3, s4] as const
})()

const GASOLINA = buildProduct({
  id: 'gasolina',
  name: 'Gasolina Comum',
  unit: '1 litro',
  icon: 'fuel',
  ncm: '2710.12.59',
  defaultPrice: 6.33,
  taxRegime: 'monofasico',
  stages: gasolinaStages,
  source: 'ANP, Fecombustiveis, IBPT',
})

// ── 2. Cerveja ──

const cervejaStages: readonly ChainStage[] = (() => {
  const s1 = buildStage({
    label: 'Cervejaria',
    icon: 'factory',
    entryPrice: 0,
    valueAdded: 1.50,
    taxes: [
      { name: 'IPI', rate: 0.06, amount: 0.09, type: 'federal', law: 'TIPI — Decreto 11.158/2022' },
      { name: 'PIS', rate: 0.0165, amount: 0.02, type: 'federal', law: 'Lei 10.637/2002' },
      { name: 'COFINS', rate: 0.076, amount: 0.11, type: 'federal', law: 'Lei 10.833/2003' },
      { name: 'ICMS-ST', rate: 0.25, amount: 1.40, type: 'estadual', law: 'RICMS/SC Anexo 3, Art. 227', note: 'Substituicao tributaria com MVA 140%' },
    ],
    previousCumulativeTaxes: 0,
    note: 'Impostos recolhidos antecipadamente via ST',
  })

  const s2 = buildStage({
    label: 'Distribuidor',
    icon: 'truck',
    entryPrice: s1.exitPrice,
    valueAdded: 0.30,
    taxes: [],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'ICMS ja retido via substituicao tributaria',
  })

  const s3 = buildStage({
    label: 'Varejo (bar/mercado)',
    icon: 'store',
    entryPrice: s2.exitPrice,
    valueAdded: 0.50,
    taxes: [
      { name: 'IRPJ/CSLL', rate: null, amount: 0.08, type: 'federal', law: 'Lei 9.430/96', note: 'Embutido na margem — Lucro Presumido' },
    ],
    previousCumulativeTaxes: s2.cumulativeTaxes,
    note: 'ICMS ja retido na cervejaria',
  })

  return [s1, s2, s3] as const
})()

const CERVEJA = buildProduct({
  id: 'cerveja',
  name: 'Cerveja',
  unit: 'lata 350ml',
  icon: 'beer',
  ncm: '2203.00.00',
  defaultPrice: 4.00,
  taxRegime: 'ST',
  stages: cervejaStages,
  source: 'IBPT, RICMS/SC, Receita Federal',
})

// ── 3. Smartphone importado ──

const smartphoneStages: readonly ChainStage[] = (() => {
  const cifBrl = 2900
  const ii = round(cifBrl * 0.20)          // 580
  const ipi = round((cifBrl + ii) * 0.15)  // 522
  const pisImport = round(cifBrl * 0.021)  // 60.90
  const cofinsImport = round(cifBrl * 0.1065) // 308.85
  const baseIcms = cifBrl + ii + ipi + pisImport + cofinsImport
  const icms = round(baseIcms / (1 - 0.17) * 0.17) // ICMS por dentro

  const s1 = buildStage({
    label: 'Importacao (desembaraco)',
    icon: 'ship',
    entryPrice: 0,
    valueAdded: cifBrl,
    taxes: [
      { name: 'II', rate: 0.20, amount: ii, type: 'federal', law: 'TEC — Decreto 11.158/2022' },
      { name: 'IPI', rate: 0.15, amount: ipi, type: 'federal', law: 'TIPI — Decreto 11.158/2022' },
      { name: 'PIS-Importacao', rate: 0.021, amount: pisImport, type: 'federal', law: 'Lei 10.865/2004, art. 8' },
      { name: 'COFINS-Importacao', rate: 0.1065, amount: cofinsImport, type: 'federal', law: 'Lei 10.865/2004, art. 8' },
      { name: 'ICMS', rate: 0.17, amount: icms, type: 'estadual', law: 'RICMS/SC, art. 26' },
    ],
    previousCumulativeTaxes: 0,
    note: 'Base CIF em reais — tributos em cascata na importacao',
  })

  const s2 = buildStage({
    label: 'Distribuicao e varejo',
    icon: 'store',
    entryPrice: s1.exitPrice,
    valueAdded: 1500,
    taxes: [
      { name: 'PIS', rate: 0.0165, amount: round(1500 * 0.0165), type: 'federal', law: 'Lei 10.637/2002' },
      { name: 'COFINS', rate: 0.076, amount: round(1500 * 0.076), type: 'federal', law: 'Lei 10.833/2003' },
    ],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'Margem de distribuicao e varejo com PIS/COFINS cumulativo',
  })

  return [s1, s2] as const
})()

const SMARTPHONE = buildProduct({
  id: 'smartphone',
  name: 'Smartphone Importado',
  unit: '1 unidade',
  icon: 'smartphone',
  ncm: '8517.13.00',
  defaultPrice: 7827,
  taxRegime: 'normal',
  stages: smartphoneStages,
  source: 'Receita Federal, IBPT, TEC',
})

// ── 4. Arroz 5kg ──

const arrozStages: readonly ChainStage[] = (() => {
  const s1 = buildStage({
    label: 'Producao rural',
    icon: 'wheat',
    entryPrice: 0,
    valueAdded: 12.00,
    taxes: [
      { name: 'FUNRURAL', rate: 0.015, amount: 0.18, type: 'federal', law: 'Lei 8.212/91, art. 25' },
    ],
    previousCumulativeTaxes: 0,
  })

  const s2 = buildStage({
    label: 'Beneficiamento',
    icon: 'factory',
    entryPrice: s1.exitPrice,
    valueAdded: 6.00,
    taxes: [
      { name: 'ICMS', rate: 0, amount: 0, type: 'estadual', law: 'Lei SC 19.397/2025', note: 'Isento em SC — cesta basica' },
      { name: 'PIS/COFINS', rate: 0, amount: 0, type: 'federal', law: 'Lei 10.925/2004', note: 'Aliquota zero — cesta basica' },
    ],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'Arroz isento de ICMS e PIS/COFINS em SC',
  })

  const s3 = buildStage({
    label: 'Distribuicao',
    icon: 'truck',
    entryPrice: s2.exitPrice,
    valueAdded: 3.50,
    taxes: [
      { name: 'IRPJ/CSLL', rate: null, amount: 0.35, type: 'federal', law: 'Lei 9.430/96', note: 'Embutido na margem' },
    ],
    previousCumulativeTaxes: s2.cumulativeTaxes,
  })

  const s4 = buildStage({
    label: 'Varejo (supermercado)',
    icon: 'store',
    entryPrice: s3.exitPrice,
    valueAdded: 4.47,
    taxes: [
      { name: 'Encargos embutidos', rate: null, amount: 0.18, type: 'federal', law: 'Diversos', note: 'IRPJ/CSLL sobre margem do varejo' },
    ],
    previousCumulativeTaxes: s3.cumulativeTaxes,
  })

  return [s1, s2, s3, s4] as const
})()

const ARROZ = buildProduct({
  id: 'arroz',
  name: 'Arroz 5kg',
  unit: 'pacote 5kg',
  icon: 'wheat',
  ncm: '1006.30.21',
  defaultPrice: 26.50,
  taxRegime: 'desonerado',
  stages: arrozStages,
  source: 'IBPT, SEFAZ/SC, Lei SC 19.397/2025',
})

// ── 5. Carro popular ──

const carroStages: readonly ChainStage[] = (() => {
  const custoMontadora = 35000
  const ipi = round(custoMontadora * 0.07)        // 2450
  const icms = round(custoMontadora * 0.12)        // 4200
  const pis = round(custoMontadora * 0.0165)       // 577.50
  const cofins = round(custoMontadora * 0.076)     // 2660

  const s1 = buildStage({
    label: 'Montadora',
    icon: 'factory',
    entryPrice: 0,
    valueAdded: custoMontadora,
    taxes: [
      { name: 'IPI', rate: 0.07, amount: ipi, type: 'federal', law: 'TIPI — Decreto 11.158/2022' },
      { name: 'ICMS', rate: 0.12, amount: icms, type: 'estadual', law: 'Convenio ICMS 51/00' },
      { name: 'PIS', rate: 0.0165, amount: pis, type: 'federal', law: 'Lei 10.637/2002' },
      { name: 'COFINS', rate: 0.076, amount: cofins, type: 'federal', law: 'Lei 10.833/2003' },
    ],
    previousCumulativeTaxes: 0,
  })

  const precoSaidaMontadora = s1.exitPrice
  const margemConc = round(precoSaidaMontadora * 0.10)
  const irpjCsll = round(margemConc * 0.11)

  const s2 = buildStage({
    label: 'Concessionaria',
    icon: 'car',
    entryPrice: precoSaidaMontadora,
    valueAdded: margemConc,
    taxes: [
      { name: 'IRPJ/CSLL', rate: null, amount: irpjCsll, type: 'federal', law: 'Lei 9.430/96', note: 'Sobre margem — Lucro Presumido' },
    ],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'ICMS e IPI ja recolhidos pela montadora',
  })

  return [s1, s2] as const
})()

const CARRO = buildProduct({
  id: 'carro-popular',
  name: 'Carro Popular 1.0 Flex',
  unit: '1 veiculo',
  icon: 'car',
  ncm: '8703.23.10',
  defaultPrice: 85000,
  taxRegime: 'normal',
  stages: carroStages,
  source: 'IBPT, ANFAVEA, Receita Federal',
})

// ── 6. Conta de luz ──

const luzStages: readonly ChainStage[] = (() => {
  const s1 = buildStage({
    label: 'Geracao de energia',
    icon: 'zap',
    entryPrice: 0,
    valueAdded: 25.00,
    taxes: [],
    previousCumulativeTaxes: 0,
  })

  const s2 = buildStage({
    label: 'Transmissao e distribuicao',
    icon: 'cable',
    entryPrice: s1.exitPrice,
    valueAdded: 20.00,
    taxes: [
      { name: 'CDE', rate: null, amount: 5.00, type: 'federal', law: 'Lei 10.438/2002', note: 'Conta de Desenvolvimento Energetico' },
      { name: 'PROINFA', rate: null, amount: 1.50, type: 'federal', law: 'Lei 10.438/2002', note: 'Programa de Incentivo a Fontes Alternativas' },
      { name: 'Outros encargos', rate: null, amount: 1.50, type: 'federal', law: 'Resolucoes ANEEL', note: 'ESS, EUST, P&D, taxa de fiscalizacao' },
    ],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'Encargos setoriais definidos pela ANEEL',
  })

  const baseImposto = s2.exitPrice
  const icms = round(baseImposto * 0.17)
  const pisCofins = round(baseImposto * 0.0925)

  const s3 = buildStage({
    label: 'Tributacao sobre a fatura',
    icon: 'receipt',
    entryPrice: s2.exitPrice,
    valueAdded: 0,
    taxes: [
      { name: 'ICMS', rate: 0.17, amount: icms, type: 'estadual', law: 'RICMS/SC, Anexo 1, art. 29', note: 'Aplicavel acima de 150 kWh em SC' },
      { name: 'PIS/COFINS', rate: 0.0925, amount: pisCofins, type: 'federal', law: 'Leis 10.637/2002 e 10.833/2003' },
    ],
    previousCumulativeTaxes: s2.cumulativeTaxes,
  })

  return [s1, s2, s3] as const
})()

const LUZ = buildProduct({
  id: 'conta-luz',
  name: 'Conta de Luz',
  unit: '100 kWh',
  icon: 'zap',
  ncm: '2716.00.00',
  defaultPrice: 85.00,
  taxRegime: 'normal',
  stages: luzStages,
  source: 'ANEEL, CNI, IBPT',
})

// ── 7. Cigarro ──

const cigarroStages: readonly ChainStage[] = (() => {
  const s1 = buildStage({
    label: 'Fabrica',
    icon: 'factory',
    entryPrice: 0,
    valueAdded: 1.70,
    taxes: [
      { name: 'IPI (fixo)', rate: null, amount: 1.50, type: 'federal', law: 'Decreto 11.158/2022, TIPI', note: 'Valor fixo por maco' },
      { name: 'IPI (ad valorem)', rate: 0.065, amount: 0.65, type: 'federal', law: 'Decreto 11.158/2022, TIPI' },
      { name: 'PIS', rate: 0.0365, amount: 0.37, type: 'federal', law: 'Lei 12.402/2011' },
      { name: 'COFINS', rate: 0.0765, amount: 0.77, type: 'federal', law: 'Lei 12.402/2011' },
      { name: 'ICMS', rate: 0.25, amount: 2.50, type: 'estadual', law: 'RICMS/SC', note: 'Aliquota majorada para cigarro' },
      { name: 'IOF-Tabaco', rate: null, amount: 0.02, type: 'federal', law: 'Decreto 6.306/2007' },
    ],
    previousCumulativeTaxes: 0,
    note: 'Produto com maior carga tributaria do Brasil',
  })

  const s2 = buildStage({
    label: 'Distribuicao',
    icon: 'truck',
    entryPrice: s1.exitPrice,
    valueAdded: 0.80,
    taxes: [],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'Impostos ja retidos na fabrica',
  })

  const s3 = buildStage({
    label: 'Varejo',
    icon: 'store',
    entryPrice: s2.exitPrice,
    valueAdded: 1.69,
    taxes: [],
    previousCumulativeTaxes: s2.cumulativeTaxes,
    note: 'Preco tabelado — impostos embutidos',
  })

  return [s1, s2, s3] as const
})()

const CIGARRO = buildProduct({
  id: 'cigarro',
  name: 'Cigarro',
  unit: 'maco (20 un.)',
  icon: 'cigarette',
  ncm: '2402.20.00',
  defaultPrice: 10.00,
  taxRegime: 'monofasico',
  stages: cigarroStages,
  source: 'IBPT, Receita Federal, RICMS/SC',
})

// ── 8. Medicamento generico ──

const medicamentoStages: readonly ChainStage[] = (() => {
  const s1 = buildStage({
    label: 'Laboratorio farmaceutico',
    icon: 'factory',
    entryPrice: 0,
    valueAdded: 10.00,
    taxes: [
      { name: 'IPI', rate: 0.04, amount: 0.40, type: 'federal', law: 'TIPI — Decreto 11.158/2022', note: 'Aliquota reduzida para medicamentos' },
      { name: 'PIS/COFINS (monofasico)', rate: 0.12, amount: 1.20, type: 'federal', law: 'Lei 10.147/2000', note: 'Regime monofasico — concentrado no fabricante' },
      { name: 'ICMS', rate: 0.17, amount: 1.70, type: 'estadual', law: 'RICMS/SC, Convenio ICMS 234/2017' },
    ],
    previousCumulativeTaxes: 0,
    note: 'Tributacao monofasica de PIS/COFINS para medicamentos',
  })

  const s2 = buildStage({
    label: 'Distribuidora farmaceutica',
    icon: 'truck',
    entryPrice: s1.exitPrice,
    valueAdded: 5.00,
    taxes: [
      { name: 'IRPJ/CSLL', rate: null, amount: 0.40, type: 'federal', law: 'Lei 9.430/96', note: 'Embutido na margem' },
    ],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'PIS/COFINS ja recolhido na fabrica (monofasico)',
  })

  const s3 = buildStage({
    label: 'Farmacia',
    icon: 'store',
    entryPrice: s2.exitPrice,
    valueAdded: 11.30,
    taxes: [
      { name: 'Encargos embutidos', rate: null, amount: 0.47, type: 'federal', law: 'Diversos', note: 'IRPJ/CSLL sobre margem do varejo' },
    ],
    previousCumulativeTaxes: s2.cumulativeTaxes,
    note: 'Preco maximo tabelado pela CMED/ANVISA',
  })

  return [s1, s2, s3] as const
})()

const MEDICAMENTO = buildProduct({
  id: 'medicamento',
  name: 'Medicamento Generico',
  unit: 'caixa',
  icon: 'pill',
  ncm: '3004.90.99',
  defaultPrice: 30.00,
  taxRegime: 'monofasico',
  stages: medicamentoStages,
  source: 'IBPT, ANVISA/CMED, Lei 10.147/2000',
})

// ── 9. Tenis importado ──

const tenisStages: readonly ChainStage[] = (() => {
  const cif = 150
  const ii = round(cif * 0.35)              // 52.50
  const ipi = round((cif + ii) * 0.10)      // 20.25
  const pisImport = round(cif * 0.021)      // 3.15
  const cofinsImport = round(cif * 0.1065)  // 15.98
  const baseIcms = cif + ii + ipi + pisImport + cofinsImport
  const icms = round(baseIcms / (1 - 0.17) * 0.17)

  const s1 = buildStage({
    label: 'Importacao (desembaraco)',
    icon: 'ship',
    entryPrice: 0,
    valueAdded: cif,
    taxes: [
      { name: 'II', rate: 0.35, amount: ii, type: 'federal', law: 'TEC — Resolucao GECEX' },
      { name: 'IPI', rate: 0.10, amount: ipi, type: 'federal', law: 'TIPI — Decreto 11.158/2022' },
      { name: 'PIS-Importacao', rate: 0.021, amount: pisImport, type: 'federal', law: 'Lei 10.865/2004' },
      { name: 'COFINS-Importacao', rate: 0.1065, amount: cofinsImport, type: 'federal', law: 'Lei 10.865/2004' },
      { name: 'ICMS', rate: 0.17, amount: icms, type: 'estadual', law: 'RICMS/SC, art. 26' },
    ],
    previousCumulativeTaxes: 0,
    note: 'Tenis esportivo importado — aliquota de II elevada',
  })

  const margemDistrib = 130
  const margemVarejo = 70
  const margemTotal = margemDistrib + margemVarejo
  const pisVarejo = round(margemTotal * 0.0165)
  const cofinsVarejo = round(margemTotal * 0.076)

  const s2 = buildStage({
    label: 'Distribuicao e varejo',
    icon: 'store',
    entryPrice: s1.exitPrice,
    valueAdded: margemTotal,
    taxes: [
      { name: 'PIS', rate: 0.0165, amount: pisVarejo, type: 'federal', law: 'Lei 10.637/2002' },
      { name: 'COFINS', rate: 0.076, amount: cofinsVarejo, type: 'federal', law: 'Lei 10.833/2003' },
    ],
    previousCumulativeTaxes: s1.cumulativeTaxes,
  })

  return [s1, s2] as const
})()

const TENIS = buildProduct({
  id: 'tenis-importado',
  name: 'Tenis Importado',
  unit: '1 par',
  icon: 'footprints',
  ncm: '6404.19.00',
  defaultPrice: 500,
  taxRegime: 'normal',
  stages: tenisStages,
  source: 'Receita Federal, IBPT, TEC',
})

// ── 10. Conta de celular ──

const celularStages: readonly ChainStage[] = (() => {
  const custoOperadora = 20.00

  const s1 = buildStage({
    label: 'Operadora de telecom',
    icon: 'signal',
    entryPrice: 0,
    valueAdded: custoOperadora,
    taxes: [
      { name: 'FUST', rate: 0.01, amount: round(custoOperadora * 0.01), type: 'federal', law: 'Lei 9.998/2000', note: 'Fundo de Universalizacao dos Servicos de Telecom' },
      { name: 'FUNTTEL', rate: 0.005, amount: round(custoOperadora * 0.005), type: 'federal', law: 'Lei 10.052/2000', note: 'Fundo para Desenvolvimento Tecnologico das Telecom' },
    ],
    previousCumulativeTaxes: 0,
  })

  const baseTribs = 50.00
  const icms = round(baseTribs * 0.17)
  const pisCofins = round(baseTribs * 0.0925)

  const s2 = buildStage({
    label: 'Tributacao sobre o servico',
    icon: 'receipt',
    entryPrice: s1.exitPrice,
    valueAdded: 50.00 - s1.exitPrice,
    taxes: [
      { name: 'ICMS', rate: 0.17, amount: icms, type: 'estadual', law: 'RICMS/SC + STF (ADI 1.945)', note: 'Pos reducao pelo STF — era 25% antes' },
      { name: 'PIS/COFINS', rate: 0.0925, amount: pisCofins, type: 'federal', law: 'Leis 10.637/2002 e 10.833/2003' },
    ],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'ISS nao incide — servico de telecom = ICMS',
  })

  return [s1, s2] as const
})()

const CELULAR = buildProduct({
  id: 'conta-celular',
  name: 'Conta de Celular',
  unit: 'plano mensal',
  icon: 'signal',
  ncm: '8517.62.99',
  defaultPrice: 50.00,
  taxRegime: 'normal',
  stages: celularStages,
  source: 'ANATEL, IBPT, STF',
})

// ── 11. Refrigerante ──

const refrigeranteStages: readonly ChainStage[] = (() => {
  const custoFabrica = 0.80
  const ipi = round(custoFabrica * 0.04)
  const pisCofins = round(custoFabrica * 0.0925)

  const s1 = buildStage({
    label: 'Fabrica de bebidas',
    icon: 'factory',
    entryPrice: 0,
    valueAdded: custoFabrica,
    taxes: [
      { name: 'IPI', rate: 0.04, amount: ipi, type: 'federal', law: 'TIPI — Decreto 11.158/2022' },
      { name: 'PIS', rate: 0.0165, amount: round(custoFabrica * 0.0165), type: 'federal', law: 'Lei 10.637/2002' },
      { name: 'COFINS', rate: 0.076, amount: round(custoFabrica * 0.076), type: 'federal', law: 'Lei 10.833/2003' },
      { name: 'ICMS-ST', rate: 0.17, amount: 0.80, type: 'estadual', law: 'RICMS/SC, Protocolo ICMS 11/91', note: 'Substituicao tributaria com MVA' },
    ],
    previousCumulativeTaxes: 0,
  })

  const s2 = buildStage({
    label: 'Distribuidor',
    icon: 'truck',
    entryPrice: s1.exitPrice,
    valueAdded: 0.60,
    taxes: [],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'ICMS retido via ST na fabrica',
  })

  const s3 = buildStage({
    label: 'Varejo',
    icon: 'store',
    entryPrice: s2.exitPrice,
    valueAdded: 1.17,
    taxes: [
      { name: 'Encargos embutidos', rate: null, amount: 0.06, type: 'federal', law: 'Diversos', note: 'IRPJ/CSLL sobre margem' },
    ],
    previousCumulativeTaxes: s2.cumulativeTaxes,
  })

  return [s1, s2, s3] as const
})()

const REFRIGERANTE = buildProduct({
  id: 'refrigerante',
  name: 'Refrigerante',
  unit: 'lata 350ml',
  icon: 'cup-soda',
  ncm: '2202.10.00',
  defaultPrice: 3.50,
  taxRegime: 'ST',
  stages: refrigeranteStages,
  source: 'IBPT, RICMS/SC',
})

// ── 12. Pao frances ──

const paoStages: readonly ChainStage[] = (() => {
  const s1 = buildStage({
    label: 'Moinho de trigo',
    icon: 'wheat',
    entryPrice: 0,
    valueAdded: 5.00,
    taxes: [
      { name: 'II (trigo importado)', rate: 0.10, amount: 0.30, type: 'federal', law: 'TEC — Resolucao GECEX', note: 'Parcela importada do trigo' },
      { name: 'PIS/COFINS', rate: 0, amount: 0, type: 'federal', law: 'Lei 10.925/2004', note: 'Aliquota zero para farinha de trigo' },
    ],
    previousCumulativeTaxes: 0,
    note: 'Trigo parcialmente importado',
  })

  const s2 = buildStage({
    label: 'Padaria (producao)',
    icon: 'chef-hat',
    entryPrice: s1.exitPrice,
    valueAdded: 6.50,
    taxes: [
      { name: 'ICMS', rate: 0.07, amount: round(11.80 * 0.07), type: 'estadual', law: 'RICMS/SC, Anexo 1, art. 11', note: 'Aliquota reduzida — cesta basica SC' },
      { name: 'PIS/COFINS', rate: 0.0365, amount: round(11.80 * 0.0365), type: 'federal', law: 'Lei 10.925/2004', note: 'Aliquota reduzida para panificacao' },
    ],
    previousCumulativeTaxes: s1.cumulativeTaxes,
    note: 'Producao artesanal — aliquotas reduzidas',
  })

  const s3 = buildStage({
    label: 'Venda ao consumidor',
    icon: 'store',
    entryPrice: s2.exitPrice,
    valueAdded: 2.78,
    taxes: [
      { name: 'Encargos embutidos', rate: null, amount: 0.20, type: 'federal', law: 'Diversos', note: 'IRPJ/CSLL embutido' },
    ],
    previousCumulativeTaxes: s2.cumulativeTaxes,
  })

  return [s1, s2, s3] as const
})()

const PAO = buildProduct({
  id: 'pao-frances',
  name: 'Pao Frances',
  unit: '1 kg',
  icon: 'croissant',
  ncm: '1905.90.90',
  defaultPrice: 16.00,
  taxRegime: 'desonerado',
  stages: paoStages,
  source: 'IBPT, SEFAZ/SC, ABITRIGO',
})

// ── Product catalog ──

export const PRODUCTS: readonly ProductChain[] = [
  GASOLINA,
  CERVEJA,
  SMARTPHONE,
  ARROZ,
  CARRO,
  LUZ,
  CIGARRO,
  MEDICAMENTO,
  TENIS,
  CELULAR,
  REFRIGERANTE,
  PAO,
] as const

// ── Recalculate function ──

function recalculateTax(tax: StageTax, ratio: number): StageTax {
  return {
    ...tax,
    amount: round(tax.amount * ratio),
  }
}

function recalculateStage(
  stage: ChainStage,
  ratio: number,
  previousCumulativeTaxes: number,
): ChainStage {
  const taxes = stage.taxes.map((t) => recalculateTax(t, ratio))
  const totalTaxes = taxes.reduce((sum, t) => sum + t.amount, 0)
  const entryPrice = round(stage.entryPrice * ratio)
  const valueAdded = round(stage.valueAdded * ratio)
  const exitPrice = round(entryPrice + valueAdded + totalTaxes)
  const cumulativeTaxes = round(previousCumulativeTaxes + totalTaxes)

  return {
    ...stage,
    entryPrice,
    valueAdded,
    taxes,
    totalTaxes: round(totalTaxes),
    exitPrice,
    cumulativeTaxes,
  }
}

export function recalculateChain(product: ProductChain, newPrice: number): ProductChain {
  const ratio = newPrice / product.defaultPrice

  const stages = product.stages.reduce<readonly ChainStage[]>((acc, stage) => {
    const prevCumulative = acc.length > 0 ? acc[acc.length - 1].cumulativeTaxes : 0
    const recalculated = recalculateStage(stage, ratio, prevCumulative)
    return [...acc, recalculated]
  }, [])

  const totalTaxes = stages.length > 0
    ? stages[stages.length - 1].cumulativeTaxes
    : 0

  return {
    ...product,
    defaultPrice: round(newPrice),
    stages,
    totalTaxes: round(totalTaxes),
    taxPercentage: round((totalTaxes / newPrice) * 100),
    priceWithoutTax: round(newPrice - totalTaxes),
  }
}
