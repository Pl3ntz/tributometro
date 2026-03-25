import type { DashboardSummary, MonthlyData, TaxTypeBreakdown, Transaction, SalaryBreakdown } from '../types'

const BASE = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro desconhecido' }))
    throw new Error(error.detail || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  getDashboardSummary: () =>
    request<DashboardSummary>('/dashboard/summary'),

  getMonthlyData: () =>
    request<MonthlyData[]>('/dashboard/monthly'),

  getByTax: () =>
    request<TaxTypeBreakdown[]>('/dashboard/by-tax'),

  getTransactions: (params?: { month?: string; category?: string; source?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.month) searchParams.set('month', params.month)
    if (params?.category) searchParams.set('category', params.category)
    if (params?.source) searchParams.set('source', params.source)
    const qs = searchParams.toString()
    return request<Transaction[]>(`/transactions${qs ? `?${qs}` : ''}`)
  },

  createTransaction: (data: {
    date: string
    description: string
    amount: number
    category?: string
    uf?: string
    mcc?: string
    ncm?: string
  }) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  scanNfce: (qr_url: string) =>
    request<Transaction[]>('/nfce/scan', {
      method: 'POST',
      body: JSON.stringify({ qr_url }),
    }),

  getSalaryBreakdown: (gross: number) =>
    request<SalaryBreakdown>(`/salary/breakdown?gross=${gross}`),

  importFile: async (endpoint: 'ofx' | 'csv', file: File): Promise<Transaction[]> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${BASE}/import/${endpoint}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Erro no upload' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  },
}
