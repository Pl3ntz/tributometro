/**
 * Tabelas tributárias 2026 — FONTE ÚNICA DE VERDADE
 * Todas as páginas DEVEM importar daqui. Nunca hardcode tabelas em componentes.
 *
 * Fontes:
 * - INSS: Portaria Interministerial MPS/MF nº 13/2026
 * - IRPF: Receita Federal + Lei 15.270/2025
 * - Encargos: CLT (Lei 8.212/91, Lei 8.036/90, etc.)
 */

// ── INSS 2026 (Progressivo) ──
// Fonte: Portaria MPS/MF 13/2026
// URL: gov.br/inss/pt-br/assuntos/com-reajuste-de-3-9-teto-do-inss-chega-a-r-8-475-55-em-2026
export const INSS_FAIXAS = [
  { max: 1621.00, rate: 0.075 },
  { max: 2902.84, rate: 0.09 },
  { max: 4354.27, rate: 0.12 },
  { max: 8475.55, rate: 0.14 },
] as const

export const INSS_TETO = 8475.55
export const SALARIO_MINIMO_2026 = 1621.00

// ── IRPF 2026 (Mensal progressivo) ──
// Fonte: Receita Federal — gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026
export const IRPF_FAIXAS = [
  { max: 2428.80, rate: 0, deduction: 0 },
  { max: 2826.65, rate: 0.075, deduction: 182.16 },
  { max: 3751.05, rate: 0.15, deduction: 394.16 },
  { max: 4664.68, rate: 0.225, deduction: 675.49 },
  { max: Infinity, rate: 0.275, deduction: 908.73 },
] as const

export const IRPF_DESCONTO_SIMPLIFICADO = 607.20
// Lei 15.270/2025 — Isenção total até R$ 5.000
export const IRPF_ISENCAO_TOTAL_ATE = 5000
// Redução parcial até R$ 7.350
export const IRPF_REDUCAO_PARCIAL_ATE = 7350

// ── Encargos patronais CLT (Lucro Real/Presumido) ──
export const ENCARGOS_PATRONAIS = {
  inssPatronal: { rate: 0.20, lei: 'Lei 8.212/91, art. 22, I' },
  fgts: { rate: 0.08, lei: 'Lei 8.036/90, art. 15' },
  rat: { rate: 0.02, lei: 'Lei 8.212/91, art. 22, II' },
  salarioEducacao: { rate: 0.025, lei: 'CF/88, art. 212, §5º; Decreto 6.003/06' },
  senaiOuSenac: { rate: 0.01, lei: 'DL 4.048/42 (SENAI) / DL 8.621/46 (SENAC)' },
  sesiOuSesc: { rate: 0.015, lei: 'DL 9.403/46 (SESI) / DL 9.853/46 (SESC)' },
  sebrae: { rate: 0.006, lei: 'Lei 8.029/90, art. 8º, §3º' },
  incra: { rate: 0.002, lei: 'DL 1.146/70' },
} as const

// Total mensal sobre folha: 35.8%
export const ENCARGOS_MENSAIS_TOTAL = 0.358

// Provisões mensalizadas
export const PROVISOES = {
  decimoTerceiro: { rate: 1 / 12, lei: 'Lei 4.090/62' },
  feriasComTerco: { rate: (1 / 12) * (4 / 3), lei: 'CF/88, art. 7º, XVII; CLT art. 129-145' },
  fgtsProvisoes: { rate: 0.0156, lei: 'Lei 8.036/90' },
  inssProvisoes: { rate: 0.0389, lei: 'Lei 8.212/91' },
} as const

// Total provisões: ~24.9%
export const PROVISOES_TOTAL = 0.249

// Multiplicador custo empresa = 1 + 0.358 + 0.249 = 1.607
export const MULTIPLICADOR_EMPRESA = 1.607

// ── Simples Nacional (Anexo III — Serviços) ──
// Fonte: LC 123/2006 + LC 155/2016
export const SIMPLES_ANEXO_III = [
  { maxRevenue: 180000, nominalRate: 0.06, deduction: 0 },
  { maxRevenue: 360000, nominalRate: 0.112, deduction: 9360 },
  { maxRevenue: 720000, nominalRate: 0.135, deduction: 17640 },
  { maxRevenue: 1800000, nominalRate: 0.16, deduction: 35640 },
  { maxRevenue: 3600000, nominalRate: 0.21, deduction: 125640 },
  { maxRevenue: 4800000, nominalRate: 0.33, deduction: 648000 },
] as const

// ── MEI ──
// Fonte: LC 123/2006, art. 18-A
// Fonte: LC 123/2006, art. 18-A; Agência Brasil jan/2026; FENACON jan/2026
// DAS = 5% do salário mínimo (R$ 1.621 × 5% = R$ 81,05) + ISS ou ICMS
export const MEI = {
  tetoAnual: 81000,
  tetoMensal: 6750,
  dasServicos: 86.05, // R$ 81,05 (INSS) + R$ 5 (ISS)
  dasComercio: 82.05, // R$ 81,05 (INSS) + R$ 1 (ICMS)
  dasAmbos: 87.05,    // R$ 81,05 (INSS) + R$ 5 (ISS) + R$ 1 (ICMS)
} as const

// ── Lucro Presumido (Serviços) ──
export const LUCRO_PRESUMIDO = {
  pis: { rate: 0.0065, lei: 'Lei 9.718/98 (cumulativo)' },
  cofins: { rate: 0.03, lei: 'Lei 9.718/98 (cumulativo)' },
  irpj: { rate: 0.048, lei: 'RIR/2018, art. 591 (15% s/ 32% presunção)' },
  csll: { rate: 0.0288, lei: 'Lei 7.689/88 (9% s/ 32% presunção)' },
  iss: { rate: 0.05, lei: 'LC 116/2003 (alíquota máxima)' },
  total: 0.1633,
} as const

// ── Funções de cálculo compartilhadas ──

export function calcINSS(gross: number): number {
  let total = 0
  let prev = 0
  for (const faixa of INSS_FAIXAS) {
    if (gross <= prev) break
    const taxable = Math.min(gross, faixa.max) - prev
    if (taxable > 0) total += taxable * faixa.rate
    prev = faixa.max
  }
  return Math.round(total * 100) / 100
}

export function calcIRPF(gross: number, inss: number): number {
  const base = gross - inss - IRPF_DESCONTO_SIMPLIFICADO
  if (base <= 0) return 0

  let tax = 0
  for (const faixa of IRPF_FAIXAS) {
    if (base <= faixa.max) {
      tax = base * faixa.rate - faixa.deduction
      break
    }
  }
  tax = Math.max(tax, 0)

  // Lei 15.270/2025 — isenção total até R$ 5.000
  if (gross <= IRPF_ISENCAO_TOTAL_ATE) return 0

  // Redução parcial entre R$ 5.000,01 e R$ 7.350
  if (gross <= IRPF_REDUCAO_PARCIAL_ATE) {
    const reduction = Math.max(0, 978.62 - 0.133145 * gross)
    tax = Math.max(0, tax - Math.min(reduction, tax))
  }

  return Math.round(tax * 100) / 100
}
