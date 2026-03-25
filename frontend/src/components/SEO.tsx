import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  path?: string
  ogImage?: string
}

const BASE_URL = 'https://tributometro.com.br'
const DEFAULT_TITLE = 'TributôMetro — Descubra quanto do seu dinheiro é imposto'
const DEFAULT_DESC = 'Calculadora tributária que revela o imposto invisível: do custo da empresa ao seu poder de compra real. 100% gratuito, zero cadastro. Dados da legislação 2026.'

export default function SEO({ title, description, path = '', ogImage }: SEOProps) {
  const fullTitle = title ? `${title} | TributôMetro` : DEFAULT_TITLE
  const desc = description || DEFAULT_DESC
  const url = `${BASE_URL}${path}`
  const image = ogImage || `${BASE_URL}/og-image.png`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="TributôMetro" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />

      {/* Extra */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="TributôMetro" />
      <meta name="theme-color" content="#111113" />
    </Helmet>
  )
}

/** JSON-LD structured data for the calculator */
export function CalculatorSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'TributôMetro',
    url: BASE_URL,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
    },
    description: DEFAULT_DESC,
    author: {
      '@type': 'Organization',
      name: 'TributôMetro',
    },
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  )
}

/** FAQ schema for landing page */
export function FAQSchema() {
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quanto de imposto o brasileiro paga?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'O brasileiro trabalha em média 149 a 153 dias por ano só para pagar impostos, o que equivale a 40,82% da renda. Fonte: IBPT 2025.',
        },
      },
      {
        '@type': 'Question',
        name: 'Qual a diferença de custo entre CLT e PJ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Um funcionário CLT custa para a empresa cerca de 60% a mais que o salário bruto (encargos patronais + provisões). No Simples Nacional, os encargos podem ser significativamente menores dependendo do faturamento.',
        },
      },
      {
        '@type': 'Question',
        name: 'O TributôMetro armazena meus dados?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não. O TributôMetro é um calculador puro — nenhum dado é armazenado. Seu salário nunca sai do seu navegador. Zero cadastro, zero cookies de rastreamento.',
        },
      },
      {
        '@type': 'Question',
        name: 'De onde vêm os dados do TributôMetro?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Todos os cálculos são baseados na legislação brasileira vigente em 2026: tabela INSS (Portaria MPS/MF 13/2026), tabela IRPF (Receita Federal + Lei 15.270/2025), encargos CLT (Lei 8.212/91, Lei 8.036/90), e dados do IBPT.',
        },
      },
      {
        '@type': 'Question',
        name: 'Quem ganha até R$ 5.000 é isento de IR em 2026?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. A Lei 15.270/2025, em vigor desde 01/01/2026, isenta de Imposto de Renda quem ganha até R$ 5.000 mensais. Entre R$ 5.000 e R$ 7.350 há redução parcial.',
        },
      },
    ],
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(faq)}</script>
    </Helmet>
  )
}
