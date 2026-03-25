export interface TaxBreakdown {
  tax_type: string
  rate: number
  amount: number
  source_table: string
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  source: 'nfce' | 'ofx' | 'manual'
  mcc: string | null
  ncm: string | null
  category: string | null
  uf: string | null
  confidence: number | null
  created_at: string
  tax_breakdowns: TaxBreakdown[]
}

export interface DashboardSummary {
  period: string
  total_spent: number
  total_taxes: number
  effective_tax_rate: number
  breakdown_by_type: Record<string, number>
  breakdown_by_category: Record<string, { total_spent: number; taxes: number }>
  precision_summary: { high: number; medium: number; estimated: number }
  top_insight: string
}

export interface MonthlyData {
  month: string
  total_spent: number
  total_taxes: number
}

export interface TaxTypeBreakdown {
  tax_type: string
  total_amount: number
  percentage: number
}

export interface SalaryBreakdown {
  gross_salary: number
  company: {
    revenue_needed: number
    taxes_on_revenue: number
    employer_cost: number
    charges: number
    provisions: number
  }
  employee: {
    inss: number
    inss_rate: number
    irpf: number
    irpf_rate: number
    net_salary: number
  }
  consumption: {
    total_tax: number
    breakdown: Array<{
      category: string
      icon: string
      spent: number
      tax: number
      tax_rate: number
    }>
  }
  summary: {
    real_purchasing_power: number
    total_tax_all_layers: number
    total_tax_percentage: number
    days_worked_for_tax: number
    hours_worked_for_tax: number
  }
}
