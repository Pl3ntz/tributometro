import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import SEO from '../components/SEO'

const PRODUTOS = [
  { cod: '001', name: 'ARROZ TP1 5KG', un: 'PC', price: 26.50, tax: 0.12, cat: 'MERCEARIA' },
  { cod: '002', name: 'FEIJAO PRETO 1KG', un: 'PC', price: 8.10, tax: 0.12, cat: 'MERCEARIA' },
  { cod: '003', name: 'MACARRAO ESPAG 500G', un: 'PC', price: 4.50, tax: 0.175, cat: 'MERCEARIA' },
  { cod: '004', name: 'FARINHA TRIGO 1KG', un: 'PC', price: 5.00, tax: 0.12, cat: 'MERCEARIA' },
  { cod: '005', name: 'OLEO SOJA 900ML', un: 'UN', price: 7.50, tax: 0.26, cat: 'MERCEARIA' },
  { cod: '006', name: 'ACUCAR REFINADO 1KG', un: 'PC', price: 5.00, tax: 0.323, cat: 'MERCEARIA' },
  { cod: '007', name: 'CAFE TORR MOIDO 500G', un: 'PC', price: 18.00, tax: 0.165, cat: 'MERCEARIA' },
  { cod: '008', name: 'SAL REFINADO 1KG', un: 'PC', price: 3.00, tax: 0.15, cat: 'MERCEARIA' },
  { cod: '009', name: 'CARNE BOV ACÉM KG', un: 'KG', price: 42.00, tax: 0.186, cat: 'AÇOUGUE' },
  { cod: '010', name: 'FRANGO INTEIRO KG', un: 'KG', price: 15.00, tax: 0.16, cat: 'AÇOUGUE' },
  { cod: '011', name: 'OVOS BRANCOS 12UN', un: 'DZ', price: 12.00, tax: 0.105, cat: 'AÇOUGUE' },
  { cod: '012', name: 'LINGUICA TOSCANA 500G', un: 'PC', price: 14.00, tax: 0.21, cat: 'AÇOUGUE' },
  { cod: '013', name: 'LEITE UHT INTEGRAL 1L', un: 'UN', price: 5.50, tax: 0.187, cat: 'LATICÍNIOS' },
  { cod: '014', name: 'QUEIJO MUÇARELA 500G', un: 'PC', price: 25.00, tax: 0.213, cat: 'LATICÍNIOS' },
  { cod: '015', name: 'MANTEIGA 200G', un: 'UN', price: 12.00, tax: 0.36, cat: 'LATICÍNIOS' },
  { cod: '016', name: 'IOGURTE NATURAL 170G', un: 'UN', price: 3.50, tax: 0.33, cat: 'LATICÍNIOS' },
  { cod: '017', name: 'PAO FRANCES KG', un: 'KG', price: 16.00, tax: 0.169, cat: 'PADARIA' },
  { cod: '018', name: 'BISCOITO CREAM 200G', un: 'PC', price: 5.00, tax: 0.263, cat: 'PADARIA' },
  { cod: '019', name: 'TOMATE SALADA KG', un: 'KG', price: 8.00, tax: 0.0, cat: 'HORTIFRUTI' },
  { cod: '020', name: 'CEBOLA KG', un: 'KG', price: 6.00, tax: 0.0, cat: 'HORTIFRUTI' },
  { cod: '021', name: 'BATATA INGLESA KG', un: 'KG', price: 5.50, tax: 0.0, cat: 'HORTIFRUTI' },
  { cod: '022', name: 'BANANA CATURRA KG', un: 'KG', price: 5.00, tax: 0.035, cat: 'HORTIFRUTI' },
  { cod: '023', name: 'AGUA MIN S/GAS 1,5L', un: 'UN', price: 3.00, tax: 0.315, cat: 'BEBIDAS' },
  { cod: '024', name: 'REFRIG COLA 2L', un: 'UN', price: 8.00, tax: 0.46, cat: 'BEBIDAS' },
  { cod: '025', name: 'CERVEJA PILSEN 350ML', un: 'UN', price: 4.00, tax: 0.425, cat: 'BEBIDAS' },
  { cod: '026', name: 'SUCO LARANJA 1L', un: 'UN', price: 7.00, tax: 0.28, cat: 'BEBIDAS' },
  { cod: '027', name: 'SHAMPOO 400ML', un: 'UN', price: 15.00, tax: 0.365, cat: 'HIGIENE' },
  { cod: '028', name: 'SABONETE 3UN', un: 'PC', price: 8.00, tax: 0.323, cat: 'HIGIENE' },
  { cod: '029', name: 'CREME DENTAL 90G', un: 'UN', price: 7.00, tax: 0.322, cat: 'HIGIENE' },
  { cod: '030', name: 'PAPEL HIG 12 ROLOS', un: 'PC', price: 18.00, tax: 0.263, cat: 'HIGIENE' },
  { cod: '031', name: 'DETERGENTE LIQ 500ML', un: 'UN', price: 3.50, tax: 0.338, cat: 'LIMPEZA' },
  { cod: '032', name: 'SABAO EM PO 1KG', un: 'PC', price: 12.00, tax: 0.313, cat: 'LIMPEZA' },
  { cod: '033', name: 'DESINFETANTE 500ML', un: 'UN', price: 6.00, tax: 0.36, cat: 'LIMPEZA' },
] as const

type ProdutoId = typeof PRODUTOS[number]['cod']

const PERFIS: Record<string, Record<string, number>> = {
  basica: { '001':2,'002':2,'003':4,'004':1,'005':1,'006':2,'007':1,'008':1,'009':1,'010':2,'011':2,'012':0,'013':6,'014':0,'015':0,'016':0,'017':4,'018':0,'019':2,'020':1,'021':2,'022':2,'023':0,'024':0,'025':0,'026':0,'027':1,'028':1,'029':1,'030':1,'031':1,'032':1,'033':0 },
  media: { '001':2,'002':1,'003':2,'004':1,'005':1,'006':1,'007':1,'008':1,'009':3,'010':2,'011':2,'012':1,'013':8,'014':1,'015':1,'016':4,'017':4,'018':2,'019':2,'020':1,'021':2,'022':2,'023':4,'024':1,'025':6,'026':2,'027':1,'028':1,'029':1,'030':1,'031':2,'032':1,'033':1 },
  completa: { '001':1,'002':0,'003':1,'004':0,'005':1,'006':1,'007':2,'008':1,'009':6,'010':2,'011':3,'012':2,'013':12,'014':2,'015':1,'016':8,'017':4,'018':2,'019':3,'020':1,'021':2,'022':3,'023':8,'024':2,'025':12,'026':4,'027':1,'028':1,'029':1,'030':1,'031':2,'032':1,'033':1 },
}

function fmt(v: number) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

export default function ProductXRay() {
  const [cart, setCart] = useState<Record<string, number>>(() => ({ ...PERFIS.media }))
  const [activeProfile, setActiveProfile] = useState('media')

  const setQty = (cod: string, qty: number) => setCart(prev => ({ ...prev, [cod]: Math.max(0, qty) }))
  const loadProfile = (key: string) => { setCart({ ...PERFIS[key] }); setActiveProfile(key) }

  const { items, totalQty, totalValue, totalTax } = useMemo(() => {
    let totalQty = 0, totalValue = 0, totalTax = 0
    const items = PRODUTOS.map(p => {
      const qty = cart[p.cod] || 0
      const value = p.price * qty
      const tax = value * p.tax / (1 + p.tax)
      totalQty += qty
      totalValue += value
      totalTax += tax
      return { ...p, qty, value, tax }
    }).filter(i => i.qty > 0)
    return { items, totalQty, totalValue, totalTax }
  }, [cart])

  const CATS = [...new Set(PRODUTOS.map(p => p.cat))]

  return (
    <div className="max-w-2xl mx-auto">
      <SEO title="Compra do Mês — Cupom Fiscal com Impostos" description="Simule sua compra de supermercado e veja o imposto escondido em cada produto." path="/produtos" />

      {/* Seletor de perfil */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-gold-400" />
          <span className="text-sm text-white font-medium">Selecione a compra:</span>
        </div>
        <div className="flex gap-1.5">
          {[
            { key: 'basica', label: 'Básica' },
            { key: 'media', label: 'Média' },
            { key: 'completa', label: 'Completa' },
          ].map(p => (
            <button key={p.key} onClick={() => loadProfile(p.key)}
              className="text-[11px] px-3 py-1 rounded-md transition-all"
              style={{
                backgroundColor: activeProfile === p.key ? '#E5A216' : '#0F2440',
                color: activeProfile === p.key ? '#080E1A' : '#B8C4D6',
                fontWeight: activeProfile === p.key ? 700 : 400,
              }}>
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ═══ CUPOM FISCAL ═══ */}
      <motion.div
        className="rounded-lg font-mono text-[11px] leading-relaxed"
        style={{ backgroundColor: '#f5f0e8', color: '#1a1a1a', padding: '20px 16px' }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      >
        {/* Header do estabelecimento */}
        <div className="text-center mb-3">
          <p className="font-bold text-sm">SUPERMERCADO TRIBUTÔMETRO LTDA</p>
          <p className="text-[10px]">CNPJ: 00.000.000/0001-00</p>
          <p className="text-[10px]">Rua da Transparência, 149 - Florianópolis/SC</p>
        </div>

        <p className="text-center text-[10px] border-t border-b border-dashed border-gray-400 py-1 mb-2">
          DOCUMENTO AUXILIAR DA NOTA FISCAL DE CONSUMIDOR ELETRÔNICA
        </p>

        {/* Cabeçalho da tabela */}
        <div className="flex text-[9px] font-bold border-b border-dashed border-gray-400 pb-1 mb-1">
          <span className="w-8">CÓD</span>
          <span className="flex-1">DESCRIÇÃO</span>
          <span className="w-8 text-center">QTD</span>
          <span className="w-6 text-center">UN</span>
          <span className="w-14 text-right">VL UN</span>
          <span className="w-14 text-right">VL TOT</span>
          <span className="w-3"></span>
        </div>

        {/* Itens agrupados por setor */}
        {CATS.map(cat => {
          const catItems = PRODUTOS.filter(p => p.cat === cat)
          const hasItems = catItems.some(p => (cart[p.cod] || 0) > 0)

          return (
            <div key={cat}>
              {/* Linha de setor (só se tem item OU para adicionar) */}
              <p className="text-[8px] font-bold mt-2 mb-0.5 text-gray-500">--- {cat} ---</p>

              {catItems.map(product => {
                const qty = cart[product.cod] || 0
                const value = product.price * qty

                return (
                  <div key={product.cod} className="flex items-center py-0.5 group">
                    <span className="w-8 text-[9px] text-gray-400">{product.cod}</span>
                    <span className={`flex-1 text-[10px] truncate ${qty > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {product.name}
                    </span>

                    {/* Qty controls */}
                    <div className="flex items-center gap-0.5 w-8 justify-center" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setQty(product.cod, qty - 1)}
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ backgroundColor: qty > 0 ? '#e0d8c8' : 'transparent' }}>
                        {qty > 0 && <Minus size={8} className="text-gray-700" />}
                      </button>
                      <span className={`text-[10px] w-3 text-center ${qty > 0 ? 'font-bold text-gray-900' : 'text-gray-300'}`}>{qty}</span>
                      <button onClick={() => setQty(product.cod, qty + 1)}
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ backgroundColor: '#e0d8c8' }}>
                        <Plus size={8} className="text-gray-700" />
                      </button>
                    </div>

                    <span className="w-6 text-center text-[9px] text-gray-400">{product.un}</span>
                    <span className={`w-14 text-right text-[10px] ${qty > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                      {fmt(product.price)}
                    </span>
                    <span className={`w-14 text-right text-[10px] ${qty > 0 ? 'font-bold text-gray-900' : 'text-gray-300'}`}>
                      {qty > 0 ? fmt(value) : '-'}
                    </span>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* Totais */}
        <div className="border-t border-dashed border-gray-400 mt-3 pt-2">
          <div className="flex justify-between text-xs">
            <span>QTD. TOTAL DE ITENS</span>
            <span className="font-bold">{items.length}</span>
          </div>
          <div className="flex justify-between text-sm font-bold mt-1">
            <span>VALOR TOTAL R$</span>
            <span>{fmt(totalValue)}</span>
          </div>
        </div>

        {/* TRIBUTOS — o campo real do cupom fiscal (Lei 12.741/2012) */}
        <div className="border-t border-dashed border-gray-400 mt-3 pt-2">
          <p className="text-[10px] font-bold text-center mb-1">
            INFORMAÇÃO DOS TRIBUTOS TOTAIS INCIDENTES
          </p>
          <p className="text-[9px] text-center text-gray-500 mb-2">(Lei Federal 12.741/2012)</p>

          <div className="flex justify-between text-xs font-bold" style={{ color: '#B91C1C' }}>
            <span>Val. Aprox. dos Tributos R$</span>
            <span>{fmt(totalTax)} ({totalValue > 0 ? ((totalTax / totalValue) * 100).toFixed(1) : '0.0'}%)</span>
          </div>

          {/* Breakdown dos itens com mais imposto */}
          <div className="mt-2 space-y-0.5">
            {items
              .sort((a, b) => b.tax - a.tax)
              .slice(0, 5)
              .map(item => (
                <div key={item.cod} className="flex justify-between text-[9px] text-gray-500">
                  <span className="truncate flex-1">{item.name}</span>
                  <span className="ml-2 font-medium" style={{ color: '#B91C1C' }}>{fmt(item.tax)}</span>
                </div>
              ))}
            {items.length > 5 && (
              <p className="text-[9px] text-gray-400 text-center">... e mais {items.length - 5} itens</p>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t border-dashed border-gray-400 mt-3 pt-2 text-center">
          <p className="text-[9px] text-gray-400">Fonte: IBPT (De Olho no Imposto)</p>
          <p className="text-[9px] text-gray-400">Impostos aproximados · Dados SC 2026</p>
          <p className="text-[8px] text-gray-300 mt-2 font-mono tracking-wider">
            TRIB 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000
          </p>
          <p className="text-[8px] text-gray-400 mt-1">tributometro.vitorplentz.com.br</p>
        </div>
      </motion.div>
    </div>
  )
}
