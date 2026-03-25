import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Wheat, Beef, Egg, Droplets, Croissant, CupSoda, Beer,
  Plus, Minus, ShoppingCart, AlertTriangle, ChevronDown,
  Sparkles, SprayCan, Apple, Milk, Cookie,
} from 'lucide-react'
import SEO from '../components/SEO'

const ICONS: Record<string, typeof Wheat> = {
  arroz: Wheat, feijao: Wheat, macarrao: Wheat, farinha: Wheat,
  carne: Beef, frango: Egg, ovos: Egg, linguica: Beef,
  leite: Milk, queijo: Milk, manteiga: Milk, iogurte: Milk,
  pao: Croissant, biscoito: Cookie, bolo: Cookie,
  oleo: Droplets, acucar: CupSoda, cafe: CupSoda, sal: CupSoda,
  tomate: Apple, cebola: Apple, batata: Apple, banana: Apple,
  agua: Droplets, refrigerante: CupSoda, cerveja: Beer, suco: CupSoda,
  shampoo: Sparkles, sabonete: Sparkles, pasta: Sparkles,
  papel: SprayCan, detergente: SprayCan, sabaopó: SprayCan, desinfetante: SprayCan,
}

// Apenas produtos de SUPERMERCADO — o que se compra num mercado real
const PRODUTOS = [
  // Cereais e grãos
  { id: 'arroz', name: 'Arroz 5kg', price: 26.50, tax: 0.12, category: 'cereais e grãos', law: 'Lei SC 19.397/2025 (ICMS isento)' },
  { id: 'feijao', name: 'Feijão 1kg', price: 8.10, tax: 0.12, category: 'cereais e grãos', law: 'Lei SC 19.397/2025' },
  { id: 'macarrao', name: 'Macarrão 500g', price: 4.50, tax: 0.175, category: 'cereais e grãos', law: 'IBPT — NCM 1902.19.00' },
  { id: 'farinha', name: 'Farinha de trigo 1kg', price: 5.00, tax: 0.12, category: 'cereais e grãos', law: 'Lei SC 19.397/2025 (ICMS isento)' },
  // Carnes e ovos
  { id: 'carne', name: 'Carne bovina 1kg', price: 42.00, tax: 0.186, category: 'carnes e ovos', law: 'IBPT — NCM 0201.30.00' },
  { id: 'frango', name: 'Frango 1kg', price: 15.00, tax: 0.16, category: 'carnes e ovos', law: 'IBPT — NCM 0207.14.00' },
  { id: 'ovos', name: 'Ovos 12 unidades', price: 12.00, tax: 0.105, category: 'carnes e ovos', law: 'IBPT — NCM 0407.21.00 (isento ICMS SC)' },
  { id: 'linguica', name: 'Linguiça 500g', price: 14.00, tax: 0.21, category: 'carnes e ovos', law: 'IBPT — NCM 1601.00.00' },
  // Laticínios
  { id: 'leite', name: 'Leite UHT 1L', price: 5.50, tax: 0.187, category: 'laticínios', law: 'IBPT — NCM 0401.20.10' },
  { id: 'queijo', name: 'Queijo mussarela 500g', price: 25.00, tax: 0.213, category: 'laticínios', law: 'IBPT — NCM 0406.10.00' },
  { id: 'manteiga', name: 'Manteiga 200g', price: 12.00, tax: 0.36, category: 'laticínios', law: 'IBPT — NCM 0405.10.00' },
  { id: 'iogurte', name: 'Iogurte 170g', price: 3.50, tax: 0.33, category: 'laticínios', law: 'IBPT — NCM 0403.10.00' },
  // Padaria
  { id: 'pao', name: 'Pão francês 1kg', price: 16.00, tax: 0.169, category: 'padaria', law: 'IBPT — NCM 1905.90.90' },
  { id: 'biscoito', name: 'Biscoito 200g', price: 5.00, tax: 0.263, category: 'padaria', law: 'IBPT — NCM 1905.31.00' },
  { id: 'bolo', name: 'Bolo pronto', price: 15.00, tax: 0.263, category: 'padaria', law: 'IBPT — NCM 1905.90.90' },
  // Básicos
  { id: 'oleo', name: 'Óleo de soja 900ml', price: 7.50, tax: 0.26, category: 'básicos', law: 'IBPT — NCM 1507.90.11' },
  { id: 'acucar', name: 'Açúcar 1kg', price: 5.00, tax: 0.323, category: 'básicos', law: 'IBPT — NCM 1701.14.00' },
  { id: 'cafe', name: 'Café 500g', price: 18.00, tax: 0.165, category: 'básicos', law: 'IBPT — NCM 0901.21.00' },
  { id: 'sal', name: 'Sal 1kg', price: 3.00, tax: 0.15, category: 'básicos', law: 'IBPT — NCM 2501.00.20' },
  { id: 'tomate', name: 'Tomate 1kg', price: 8.00, tax: 0.0, category: 'básicos', law: 'Isento — hortifruti (RICMS-SC)' },
  { id: 'cebola', name: 'Cebola 1kg', price: 6.00, tax: 0.0, category: 'básicos', law: 'Isento — hortifruti (RICMS-SC)' },
  { id: 'batata', name: 'Batata 1kg', price: 5.50, tax: 0.0, category: 'básicos', law: 'Isento — hortifruti (RICMS-SC)' },
  { id: 'banana', name: 'Banana 1kg', price: 5.00, tax: 0.035, category: 'básicos', law: 'IBPT — NCM 0803.90.00' },
  // Bebidas
  { id: 'agua', name: 'Água mineral 1,5L', price: 3.00, tax: 0.315, category: 'bebidas', law: 'IBPT — NCM 2201.10.00' },
  { id: 'refrigerante', name: 'Refrigerante 2L', price: 8.00, tax: 0.46, category: 'bebidas', law: 'IBPT — NCM 2202.10.00' },
  { id: 'cerveja', name: 'Cerveja lata 350ml', price: 4.00, tax: 0.425, category: 'bebidas', law: 'ICMS-ST 25% SC + IPI 6%' },
  { id: 'suco', name: 'Suco de caixa 1L', price: 7.00, tax: 0.28, category: 'bebidas', law: 'IBPT — NCM 2009.19.00' },
  // Higiene e limpeza
  { id: 'shampoo', name: 'Shampoo 400ml', price: 15.00, tax: 0.365, category: 'higiene e limpeza', law: 'IBPT — NCM 3305.10.00' },
  { id: 'sabonete', name: 'Sabonete 3un', price: 8.00, tax: 0.323, category: 'higiene e limpeza', law: 'IBPT — NCM 3401.20.00' },
  { id: 'pasta', name: 'Pasta de dente', price: 7.00, tax: 0.322, category: 'higiene e limpeza', law: 'IBPT — NCM 3306.10.00' },
  { id: 'papel', name: 'Papel higiênico 12un', price: 18.00, tax: 0.263, category: 'higiene e limpeza', law: 'IBPT — NCM 4818.90.00' },
  { id: 'detergente', name: 'Detergente 500ml', price: 3.50, tax: 0.338, category: 'higiene e limpeza', law: 'IBPT — NCM 3402.20.00' },
  { id: 'sabaopó', name: 'Sabão em pó 1kg', price: 12.00, tax: 0.313, category: 'higiene e limpeza', law: 'IBPT — NCM 3402.20.00' },
  { id: 'desinfetante', name: 'Desinfetante 500ml', price: 6.00, tax: 0.36, category: 'higiene e limpeza', law: 'IBPT — NCM 3808.94.19' },
] as const

const PERFIS: Record<string, Record<string, number>> = {
  minimo: {
    arroz: 2, feijao: 2, macarrao: 4, farinha: 1,
    carne: 1, frango: 2, ovos: 2, linguica: 0,
    leite: 6, queijo: 0, manteiga: 0, iogurte: 0,
    pao: 4, biscoito: 0, bolo: 0,
    oleo: 1, acucar: 2, cafe: 1, sal: 1, tomate: 2, cebola: 1, batata: 2, banana: 2,
    agua: 0, refrigerante: 0, cerveja: 0, suco: 0,
    shampoo: 1, sabonete: 1, pasta: 1, papel: 1, detergente: 1, sabaopó: 1, desinfetante: 0,
  },
  media: {
    arroz: 2, feijao: 1, macarrao: 2, farinha: 1,
    carne: 3, frango: 2, ovos: 2, linguica: 1,
    leite: 8, queijo: 1, manteiga: 1, iogurte: 4,
    pao: 4, biscoito: 2, bolo: 1,
    oleo: 1, acucar: 1, cafe: 1, sal: 1, tomate: 2, cebola: 1, batata: 2, banana: 2,
    agua: 4, refrigerante: 1, cerveja: 6, suco: 2,
    shampoo: 1, sabonete: 1, pasta: 1, papel: 1, detergente: 2, sabaopó: 1, desinfetante: 1,
  },
  alta: {
    arroz: 1, feijao: 0, macarrao: 1, farinha: 0,
    carne: 6, frango: 2, ovos: 3, linguica: 2,
    leite: 12, queijo: 2, manteiga: 1, iogurte: 8,
    pao: 4, biscoito: 2, bolo: 2,
    oleo: 1, acucar: 1, cafe: 2, sal: 1, tomate: 3, cebola: 1, batata: 2, banana: 3,
    agua: 8, refrigerante: 2, cerveja: 12, suco: 4,
    shampoo: 1, sabonete: 1, pasta: 1, papel: 1, detergente: 2, sabaopó: 1, desinfetante: 1,
  },
}

const CATEGORIAS = ['cereais e grãos', 'carnes e ovos', 'laticínios', 'padaria', 'básicos', 'bebidas', 'higiene e limpeza'] as const

function fmt(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }

export default function ProductXRay() {
  const [cart, setCart] = useState<Record<string, number>>(() => ({ ...PERFIS.media }))
  const [expanded, setExpanded] = useState<string | null>(null)

  const setQty = (id: string, qty: number) => setCart(prev => ({ ...prev, [id]: Math.max(0, qty) }))
  const loadProfile = (profile: string) => setCart({ ...PERFIS[profile] })

  const summary = useMemo(() => {
    let totalSpent = 0
    let totalTax = 0
    const byCategory: Record<string, { spent: number; tax: number }> = {}
    for (const p of PRODUTOS) {
      const qty = cart[p.id] || 0
      if (qty === 0) continue
      const spent = p.price * qty
      const tax = spent * p.tax / (1 + p.tax)
      totalSpent += spent
      totalTax += tax
      if (!byCategory[p.category]) byCategory[p.category] = { spent: 0, tax: 0 }
      byCategory[p.category].spent += spent
      byCategory[p.category].tax += tax
    }
    return { totalSpent, totalTax, rate: totalSpent > 0 ? totalTax / totalSpent : 0, byCategory }
  }, [cart])

  const activeCount = PRODUTOS.filter(p => (cart[p.id] || 0) > 0).length

  return (
    <div className="space-y-6">
      <SEO title="Compra do Mês — Impostos no supermercado" description="Monte seu carrinho de supermercado e descubra quanto de imposto está escondido em cada produto." path="/produtos" />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-semibold text-white">Compra do Mês</h1>
        <p className="text-txt-secondary text-sm mt-0.5">Monte seu carrinho de supermercado e veja o imposto escondido em cada produto</p>
      </motion.div>

      {/* Perfis */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'minimo', label: 'Salário Mínimo', desc: 'R$ 1.621/mês' },
          { key: 'media', label: 'Classe Média', desc: 'R$ 5.000/mês' },
          { key: 'alta', label: 'Classe Alta', desc: 'R$ 15.000/mês' },
        ].map(p => (
          <button key={p.key} onClick={() => loadProfile(p.key)}
            className="flex flex-col px-4 py-2 rounded-xl text-left transition-all hover:scale-[1.02]"
            style={{ backgroundColor: '#0F2440', border: '1px solid #163356' }}>
            <span className="text-xs font-medium text-white">{p.label}</span>
            <span className="text-[10px] text-txt-tertiary">{p.desc}</span>
          </button>
        ))}
      </div>

      {/* Hero resumo */}
      {summary.totalSpent > 0 && (
        <motion.div className="rounded-2xl p-6 relative overflow-hidden shadow-glow-lg"
          style={{ background: 'linear-gradient(145deg, #080E1A 0%, #0C1525 50%, #0F2440 100%)' }}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gold-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <ShoppingCart size={12} /> Impostos na sua compra mensal
              </p>
              <p className="text-3xl sm:text-4xl font-bold font-mono text-gold-300">{fmt(summary.totalTax)}</p>
              <p className="text-txt-secondary text-sm mt-1">
                de {fmt(summary.totalSpent)} — <span className="text-gold-400 font-semibold">{(summary.rate * 100).toFixed(1)}%</span> é imposto
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white font-mono">{activeCount}</p>
                <p className="text-[10px] text-txt-tertiary">itens</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gold-400 font-mono">{(summary.rate * 10).toFixed(1)}</p>
                <p className="text-[10px] text-txt-tertiary">de cada R$ 10</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Lista por categoria */}
      {CATEGORIAS.map(cat => {
        const items = PRODUTOS.filter(p => p.category === cat)
        return (
          <motion.div key={cat} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-[10px] uppercase tracking-widest text-txt-tertiary mb-2 capitalize">{cat}</h3>
            <div className="space-y-1">
              {items.map(product => {
                const qty = cart[product.id] || 0
                const Icon = ICONS[product.id] || ShoppingCart
                const itemTotal = product.price * qty
                const itemTax = itemTotal * product.tax / (1 + product.tax)
                const isExpanded = expanded === product.id

                return (
                  <div key={product.id}>
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
                      style={{ backgroundColor: qty > 0 ? '#0F2440' : '#0C1525', border: qty > 0 ? '1px solid #163356' : '1px solid transparent' }}>
                      <Icon size={15} className={qty > 0 ? 'text-gold-400' : 'text-txt-tertiary'} style={{ flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${qty > 0 ? 'text-white' : 'text-txt-secondary'}`}>{product.name}</p>
                        <p className="text-[10px] text-txt-tertiary">{fmt(product.price)} · {(product.tax * 100).toFixed(1)}% imp.</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setQty(product.id, qty - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#163356' }}>
                          <Minus size={10} className="text-white" />
                        </button>
                        <span className="text-xs font-mono text-white w-5 text-center">{qty}</span>
                        <button onClick={() => setQty(product.id, qty + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: '#163356' }}>
                          <Plus size={10} className="text-white" />
                        </button>
                      </div>
                      {qty > 0 && (
                        <div className="text-right w-20 flex-shrink-0">
                          <p className="text-xs font-mono text-white">{fmt(itemTotal)}</p>
                          <p className="text-[10px] font-mono text-gold-400">{fmt(itemTax)}</p>
                        </div>
                      )}
                      {qty > 0 && (
                        <button onClick={() => setExpanded(isExpanded ? null : product.id)} className="flex-shrink-0">
                          <ChevronDown size={12} className={`text-txt-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                    <AnimatePresence>
                      {isExpanded && qty > 0 && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-3 py-2 ml-7 text-[11px] text-txt-tertiary space-y-1" style={{ borderLeft: '2px solid #163356' }}>
                            <p><span className="text-txt-secondary">Base legal:</span> {product.law}</p>
                            <p><span className="text-txt-secondary">Cálculo:</span> {fmt(product.price)} × {qty} = {fmt(itemTotal)} → {fmt(itemTax)} é imposto (por dentro)</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )
      })}

      {/* Resumo por categoria */}
      {summary.totalSpent > 0 && (
        <motion.div className="rounded-2xl shadow-card p-5" style={{ background: 'linear-gradient(180deg, #0F2440 0%, #0C1525 100%)' }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-[10px] uppercase tracking-widest text-txt-tertiary mb-4">Impostos por categoria</h3>
          <div className="space-y-2.5">
            {Object.entries(summary.byCategory).sort(([, a], [, b]) => b.tax - a.tax).map(([cat, data]) => {
              const maxTax = Math.max(...Object.values(summary.byCategory).map(d => d.tax))
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-xs text-txt-secondary w-24 capitalize flex-shrink-0">{cat}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#080E1A' }}>
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: '#E5A216', width: `${maxTax > 0 ? (data.tax / maxTax) * 100 : 0}%` }}
                      initial={{ width: 0 }} animate={{ width: `${maxTax > 0 ? (data.tax / maxTax) * 100 : 0}%` }} transition={{ duration: 0.5 }} />
                  </div>
                  <span className="text-xs font-mono text-gold-400 w-20 text-right">{fmt(data.tax)}</span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid #163356' }}>
            <p className="text-[10px] text-txt-tertiary">
              Fonte: IBPT (De Olho no Imposto, Lei 12.741/2012). Impostos por dentro (embutidos no preço). Dados SC 2026.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
