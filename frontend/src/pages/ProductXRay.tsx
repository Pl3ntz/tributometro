import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Wheat, Beef, Egg, Droplets, Croissant, CupSoda, Beer,
  Plus, Minus, ShoppingCart, ChevronDown, Receipt,
  Sparkles, SprayCan, Apple, Milk, Cookie, CircleDollarSign,
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
  papel: SprayCan, detergente: SprayCan, sabaopo: SprayCan, desinfetante: SprayCan,
}

const PRODUTOS = [
  { id: 'arroz', name: 'Arroz 5kg', price: 26.50, tax: 0.12, category: 'cereais e grãos', law: 'Lei SC 19.397/2025 (ICMS isento)' },
  { id: 'feijao', name: 'Feijão 1kg', price: 8.10, tax: 0.12, category: 'cereais e grãos', law: 'Lei SC 19.397/2025' },
  { id: 'macarrao', name: 'Macarrão 500g', price: 4.50, tax: 0.175, category: 'cereais e grãos', law: 'IBPT — NCM 1902.19.00' },
  { id: 'farinha', name: 'Farinha de trigo 1kg', price: 5.00, tax: 0.12, category: 'cereais e grãos', law: 'Lei SC 19.397/2025 (ICMS isento)' },
  { id: 'carne', name: 'Carne bovina 1kg', price: 42.00, tax: 0.186, category: 'carnes e ovos', law: 'IBPT — NCM 0201.30.00' },
  { id: 'frango', name: 'Frango 1kg', price: 15.00, tax: 0.16, category: 'carnes e ovos', law: 'IBPT — NCM 0207.14.00' },
  { id: 'ovos', name: 'Ovos 12 unidades', price: 12.00, tax: 0.105, category: 'carnes e ovos', law: 'IBPT — NCM 0407.21.00' },
  { id: 'linguica', name: 'Linguiça 500g', price: 14.00, tax: 0.21, category: 'carnes e ovos', law: 'IBPT — NCM 1601.00.00' },
  { id: 'leite', name: 'Leite UHT 1L', price: 5.50, tax: 0.187, category: 'laticínios', law: 'IBPT — NCM 0401.20.10' },
  { id: 'queijo', name: 'Queijo mussarela 500g', price: 25.00, tax: 0.213, category: 'laticínios', law: 'IBPT — NCM 0406.10.00' },
  { id: 'manteiga', name: 'Manteiga 200g', price: 12.00, tax: 0.36, category: 'laticínios', law: 'IBPT — NCM 0405.10.00' },
  { id: 'iogurte', name: 'Iogurte 170g', price: 3.50, tax: 0.33, category: 'laticínios', law: 'IBPT — NCM 0403.10.00' },
  { id: 'pao', name: 'Pão francês 1kg', price: 16.00, tax: 0.169, category: 'padaria', law: 'IBPT — NCM 1905.90.90' },
  { id: 'biscoito', name: 'Biscoito 200g', price: 5.00, tax: 0.263, category: 'padaria', law: 'IBPT — NCM 1905.31.00' },
  { id: 'bolo', name: 'Bolo pronto', price: 15.00, tax: 0.263, category: 'padaria', law: 'IBPT — NCM 1905.90.90' },
  { id: 'oleo', name: 'Óleo de soja 900ml', price: 7.50, tax: 0.26, category: 'básicos', law: 'IBPT — NCM 1507.90.11' },
  { id: 'acucar', name: 'Açúcar 1kg', price: 5.00, tax: 0.323, category: 'básicos', law: 'IBPT — NCM 1701.14.00' },
  { id: 'cafe', name: 'Café 500g', price: 18.00, tax: 0.165, category: 'básicos', law: 'IBPT — NCM 0901.21.00' },
  { id: 'sal', name: 'Sal 1kg', price: 3.00, tax: 0.15, category: 'básicos', law: 'IBPT — NCM 2501.00.20' },
  { id: 'tomate', name: 'Tomate 1kg', price: 8.00, tax: 0.0, category: 'básicos', law: 'Isento — hortifruti (RICMS-SC)' },
  { id: 'cebola', name: 'Cebola 1kg', price: 6.00, tax: 0.0, category: 'básicos', law: 'Isento — hortifruti (RICMS-SC)' },
  { id: 'batata', name: 'Batata 1kg', price: 5.50, tax: 0.0, category: 'básicos', law: 'Isento — hortifruti (RICMS-SC)' },
  { id: 'banana', name: 'Banana 1kg', price: 5.00, tax: 0.035, category: 'básicos', law: 'IBPT — NCM 0803.90.00' },
  { id: 'agua', name: 'Água mineral 1,5L', price: 3.00, tax: 0.315, category: 'bebidas', law: 'IBPT — NCM 2201.10.00' },
  { id: 'refrigerante', name: 'Refrigerante 2L', price: 8.00, tax: 0.46, category: 'bebidas', law: 'IBPT — NCM 2202.10.00' },
  { id: 'cerveja', name: 'Cerveja lata 350ml', price: 4.00, tax: 0.425, category: 'bebidas', law: 'ICMS-ST 25% SC + IPI 6%' },
  { id: 'suco', name: 'Suco de caixa 1L', price: 7.00, tax: 0.28, category: 'bebidas', law: 'IBPT — NCM 2009.19.00' },
  { id: 'shampoo', name: 'Shampoo 400ml', price: 15.00, tax: 0.365, category: 'higiene e limpeza', law: 'IBPT — NCM 3305.10.00' },
  { id: 'sabonete', name: 'Sabonete 3un', price: 8.00, tax: 0.323, category: 'higiene e limpeza', law: 'IBPT — NCM 3401.20.00' },
  { id: 'pasta', name: 'Pasta de dente', price: 7.00, tax: 0.322, category: 'higiene e limpeza', law: 'IBPT — NCM 3306.10.00' },
  { id: 'papel', name: 'Papel higiênico 12un', price: 18.00, tax: 0.263, category: 'higiene e limpeza', law: 'IBPT — NCM 4818.90.00' },
  { id: 'detergente', name: 'Detergente 500ml', price: 3.50, tax: 0.338, category: 'higiene e limpeza', law: 'IBPT — NCM 3402.20.00' },
  { id: 'sabaopo', name: 'Sabão em pó 1kg', price: 12.00, tax: 0.313, category: 'higiene e limpeza', law: 'IBPT — NCM 3402.20.00' },
  { id: 'desinfetante', name: 'Desinfetante 500ml', price: 6.00, tax: 0.36, category: 'higiene e limpeza', law: 'IBPT — NCM 3808.94.19' },
] as const

const PERFIS: Record<string, Record<string, number>> = {
  minimo: { arroz:2,feijao:2,macarrao:4,farinha:1,carne:1,frango:2,ovos:2,linguica:0,leite:6,queijo:0,manteiga:0,iogurte:0,pao:4,biscoito:0,bolo:0,oleo:1,acucar:2,cafe:1,sal:1,tomate:2,cebola:1,batata:2,banana:2,agua:0,refrigerante:0,cerveja:0,suco:0,shampoo:1,sabonete:1,pasta:1,papel:1,detergente:1,sabaopo:1,desinfetante:0 },
  media: { arroz:2,feijao:1,macarrao:2,farinha:1,carne:3,frango:2,ovos:2,linguica:1,leite:8,queijo:1,manteiga:1,iogurte:4,pao:4,biscoito:2,bolo:1,oleo:1,acucar:1,cafe:1,sal:1,tomate:2,cebola:1,batata:2,banana:2,agua:4,refrigerante:1,cerveja:6,suco:2,shampoo:1,sabonete:1,pasta:1,papel:1,detergente:2,sabaopo:1,desinfetante:1 },
  alta: { arroz:1,feijao:0,macarrao:1,farinha:0,carne:6,frango:2,ovos:3,linguica:2,leite:12,queijo:2,manteiga:1,iogurte:8,pao:4,biscoito:2,bolo:2,oleo:1,acucar:1,cafe:2,sal:1,tomate:3,cebola:1,batata:2,banana:3,agua:8,refrigerante:2,cerveja:12,suco:4,shampoo:1,sabonete:1,pasta:1,papel:1,detergente:2,sabaopo:1,desinfetante:1 },
}

const CATEGORIAS = ['cereais e grãos','carnes e ovos','laticínios','padaria','básicos','bebidas','higiene e limpeza'] as const

function fmt(v: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) }

export default function ProductXRay() {
  const [cart, setCart] = useState<Record<string, number>>(() => ({ ...PERFIS.media }))
  const [expanded, setExpanded] = useState<string | null>(null)
  const [activeProfile, setActiveProfile] = useState('media')

  const setQty = (id: string, qty: number) => setCart(prev => ({ ...prev, [id]: Math.max(0, qty) }))
  const loadProfile = (key: string) => { setCart({ ...PERFIS[key] }); setActiveProfile(key) }

  const summary = useMemo(() => {
    let totalSpent = 0; let totalTax = 0
    for (const p of PRODUTOS) {
      const qty = cart[p.id] || 0
      if (qty === 0) continue
      const spent = p.price * qty
      totalSpent += spent
      totalTax += spent * p.tax / (1 + p.tax)
    }
    return { totalSpent, totalTax, rate: totalSpent > 0 ? totalTax / totalSpent : 0 }
  }, [cart])

  const cartItems = PRODUTOS.filter(p => (cart[p.id] || 0) > 0)

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <SEO title="Compra do Mês — Impostos no supermercado" description="Monte seu carrinho de supermercado e descubra quanto de imposto está escondido." path="/produtos" />

      {/* Header estilo supermercado */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShoppingCart size={22} className="text-gold-400" />
          <h1 className="text-xl font-semibold text-white">Compra do Mês</h1>
        </div>
        <p className="text-txt-secondary text-sm">Selecione um perfil ou monte seu carrinho</p>
      </motion.div>

      {/* Perfis */}
      <div className="flex justify-center gap-2">
        {[
          { key: 'minimo', label: 'Básica', desc: 'Sal. Mínimo' },
          { key: 'media', label: 'Média', desc: 'Classe Média' },
          { key: 'alta', label: 'Completa', desc: 'Classe Alta' },
        ].map(p => (
          <button key={p.key} onClick={() => loadProfile(p.key)}
            className="px-4 py-2 rounded-xl text-center transition-all"
            style={{
              backgroundColor: activeProfile === p.key ? '#E5A216' : '#0F2440',
              color: activeProfile === p.key ? '#080E1A' : '#B8C4D6',
              border: activeProfile === p.key ? '1px solid #E5A216' : '1px solid #163356',
              fontWeight: activeProfile === p.key ? 600 : 400,
            }}>
            <span className="text-xs block">{p.label}</span>
            <span className="text-[10px] block opacity-70">{p.desc}</span>
          </button>
        ))}
      </div>

      {/* Cupom fiscal / Nota */}
      <motion.div
        className="rounded-2xl overflow-hidden shadow-card"
        style={{ backgroundColor: '#0C1525', border: '1px solid #163356' }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      >
        {/* Header do cupom */}
        <div className="px-5 py-4 text-center" style={{ borderBottom: '1px dashed #163356' }}>
          <Receipt size={20} className="text-gold-400 mx-auto mb-1" />
          <p className="text-xs text-txt-tertiary font-mono uppercase tracking-widest">Cupom Fiscal Tributário</p>
          <p className="text-[10px] text-txt-tertiary mt-1">IBPT — Lei 12.741/2012 — SC 2026</p>
        </div>

        {/* Itens — estilo cupom */}
        <div className="px-4 py-3">
          {/* Cabeçalho da tabela */}
          <div className="flex items-center text-[9px] text-txt-tertiary uppercase tracking-wider pb-2 mb-2 font-mono" style={{ borderBottom: '1px solid #163356' }}>
            <span className="flex-1">Item</span>
            <span className="w-12 text-center">Qtd</span>
            <span className="w-16 text-right">Valor</span>
            <span className="w-16 text-right text-gold-400">Imposto</span>
          </div>

          {CATEGORIAS.map(cat => {
            const items = PRODUTOS.filter(p => p.category === cat)
            const hasItems = items.some(p => (cart[p.id] || 0) > 0)

            return (
              <div key={cat}>
                {/* Separador de categoria */}
                <p className="text-[9px] text-txt-tertiary uppercase tracking-widest mt-3 mb-1 font-mono">{cat}</p>

                {items.map(product => {
                  const qty = cart[product.id] || 0
                  const Icon = ICONS[product.id] || ShoppingCart
                  const itemTotal = product.price * qty
                  const itemTax = itemTotal * product.tax / (1 + product.tax)
                  const isExpanded = expanded === product.id

                  return (
                    <div key={product.id}>
                      <div
                        className="flex items-center gap-2 py-1.5 cursor-pointer group"
                        onClick={() => qty > 0 && setExpanded(isExpanded ? null : product.id)}
                      >
                        <Icon size={13} className={qty > 0 ? 'text-gold-400' : 'text-txt-tertiary'} style={{ flexShrink: 0 }} />
                        <span className={`flex-1 text-xs truncate ${qty > 0 ? 'text-white' : 'text-txt-tertiary'}`}>
                          {product.name}
                        </span>

                        {/* Qty controls */}
                        <div className="flex items-center gap-1 w-12 justify-center" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setQty(product.id, qty - 1)}
                            className="w-5 h-5 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: '#163356' }}>
                            <Minus size={8} className="text-white" />
                          </button>
                          <span className="text-[11px] font-mono text-white w-4 text-center">{qty}</span>
                          <button onClick={() => setQty(product.id, qty + 1)}
                            className="w-5 h-5 rounded flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: '#163356' }}>
                            <Plus size={8} className="text-white" />
                          </button>
                        </div>

                        <span className={`w-16 text-right text-[11px] font-mono ${qty > 0 ? 'text-white' : 'text-txt-tertiary'}`}>
                          {qty > 0 ? fmt(itemTotal) : fmt(product.price)}
                        </span>
                        <span className={`w-16 text-right text-[11px] font-mono ${qty > 0 ? 'text-gold-400' : 'text-txt-tertiary'}`}>
                          {qty > 0 ? fmt(itemTax) : `${(product.tax * 100).toFixed(0)}%`}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isExpanded && qty > 0 && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="pl-6 pb-2 text-[10px] text-txt-tertiary font-mono">
                              {product.law} · {fmt(product.price)}/un × {qty} = {fmt(itemTotal)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Totais — estilo cupom fiscal */}
        <div className="px-5 py-4" style={{ borderTop: '2px dashed #163356' }}>
          <div className="flex justify-between text-sm font-mono mb-1">
            <span className="text-txt-secondary">SUBTOTAL</span>
            <span className="text-white font-semibold">{fmt(summary.totalSpent)}</span>
          </div>
          <div className="flex justify-between text-sm font-mono mb-1">
            <span className="text-txt-secondary">ITENS</span>
            <span className="text-white">{cartItems.length} produtos</span>
          </div>
          <div className="my-3" style={{ borderTop: '1px dashed #163356' }} />
          <div className="flex justify-between text-base font-mono">
            <span className="text-gold-400 font-bold flex items-center gap-1.5">
              <CircleDollarSign size={16} />
              IMPOSTOS EMBUTIDOS
            </span>
            <span className="text-gold-300 font-bold text-lg">{fmt(summary.totalTax)}</span>
          </div>
          <div className="flex justify-between text-xs font-mono mt-1">
            <span className="text-txt-tertiary">Percentual sobre a compra</span>
            <span className="text-gold-400">{(summary.rate * 100).toFixed(1)}%</span>
          </div>
          <div className="my-3" style={{ borderTop: '1px dashed #163356' }} />
          <p className="text-[10px] text-txt-tertiary text-center font-mono leading-relaxed">
            Valor aproximado dos tributos conforme Lei 12.741/2012
            <br />Fonte: IBPT (De Olho no Imposto) · Dados SC 2026
            <br />Impostos calculados por dentro (embutidos no preço)
          </p>
        </div>
      </motion.div>
    </div>
  )
}
