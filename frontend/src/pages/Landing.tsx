import { useRef, useEffect, useState, useMemo, type ReactNode } from 'react'
import SEO, { CalculatorSchema as CalculatorSchemaData, FAQSchema as FAQSchemaData } from '../components/SEO'

function SEOHead() {
  return <SEO path="/" />
}
import { motion, useInView, useScroll, useTransform } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Calendar,
  TrendingDown,
  PenLine,
  BarChart3,
  Target,
  Scan,
  GitCompare,
  Scale,
  ShieldCheck,
  ArrowRight,
  Github,
  CircleDollarSign,
  CircleOff,
} from 'lucide-react'

// ─── Animated counter hook ──────────────────────────────────────────────────

function useAnimatedNumber(
  target: number,
  duration: number,
  shouldAnimate: boolean,
): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!shouldAnimate) return

    const startTime = Date.now()

    function tick() {
      const elapsed = (Date.now() - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setValue(target * eased)

      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [target, duration, shouldAnimate])

  return value
}

// ─── Section wrapper (animate on scroll) ────────────────────────────────────

interface SectionProps {
  readonly children: ReactNode
  readonly className?: string
  readonly id?: string
}

function Section({ children, className = '', id }: SectionProps) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

// ─── Reusable card with hover lift ──────────────────────────────────────────

interface HoverCardProps {
  readonly children: ReactNode
  readonly className?: string
  readonly delay?: number
}

function HoverCard({ children, className = '', delay = 0 }: HoverCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={`rounded-2xl shadow-card h-full flex flex-col ${className}`}
      style={{ backgroundColor: '#1E1E24', border: '1px solid #2A2A32' }}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -4,
        borderColor: '#3D3D48',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5), 0 0 16px rgba(229,162,22,0.06)',
        transition: { duration: 0.2 },
      }}
    >
      {children}
    </motion.div>
  )
}

// ─── Section heading ────────────────────────────────────────────────────────

interface HeadingProps {
  readonly children: ReactNode
  readonly subtitle?: string
}

function SectionHeading({ children, subtitle }: HeadingProps) {
  return (
    <div className="text-center mb-10 lg:mb-12">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-txt-primary">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-4 text-txt-secondary text-sm sm:text-base max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── Waffle square ──────────────────────────────────────────────────────────

interface WaffleSquareProps {
  readonly index: number
  readonly isTax: boolean
  readonly isInView: boolean
}

function WaffleSquare({ index, isTax, isInView }: WaffleSquareProps) {
  const color = isTax ? '#F5B731' : '#34D399'
  const bg = isTax ? '#2E2008' : '#1A3A2E'

  return (
    <motion.div
      className="flex-1 min-w-0 rounded-xl py-4 flex flex-col items-center justify-center gap-1.5"
      style={{ backgroundColor: bg }}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {isTax ? (
        <CircleOff size={28} style={{ color }} strokeWidth={1.5} />
      ) : (
        <CircleDollarSign size={28} style={{ color }} strokeWidth={1.5} />
      )}
      <span className="text-[11px] font-bold font-mono" style={{ color }}>R$ 1</span>
      <span className="text-[9px] uppercase tracking-wider" style={{ color: isTax ? '#9E6D0B' : '#2D6480' }}>
        {isTax ? 'imposto' : 'seu'}
      </span>
    </motion.div>
  )
}

// ─── Stat card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  readonly value: string
  readonly label: string
  readonly source: string
  readonly delay: number
}

function StatCard({ value, label, source, delay }: StatCardProps) {
  return (
    <HoverCard className="p-5 text-center" delay={delay}>
      <p className="text-xl font-bold font-mono text-accent-400 tabular-nums">
        {value}
      </p>
      <p className="text-sm text-txt-primary mt-2 flex-1">{label}</p>
      <p className="text-[10px] text-txt-tertiary mt-3 uppercase tracking-wider">
        {source}
      </p>
    </HoverCard>
  )
}

// ─── Step item ──────────────────────────────────────────────────────────────

interface StepItemProps {
  readonly icon: ReactNode
  readonly title: string
  readonly description: string
  readonly step: number
  readonly delay: number
}

function StepItem({ icon, title, description, step, delay }: StepItemProps) {
  return (
    <HoverCard className="p-6 text-center items-center relative" delay={delay}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
          style={{ backgroundColor: '#2E2008', color: '#F5B731' }}
        >
          {step}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(229,162,22,0.08)' }}
        >
          {icon}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-txt-primary mb-2">{title}</h3>
      <p className="text-xs text-txt-secondary leading-relaxed flex-1">{description}</p>
    </HoverCard>
  )
}

// ─── Problem card data ──────────────────────────────────────────────────────

const PROBLEM_CARDS = [
  {
    icon: Eye,
    title: 'Impostos invisíveis',
    description:
      'No Brasil, os impostos estão embutidos no preço. Você nunca vê a cobrança separada.',
  },
  {
    icon: Calendar,
    title: '149 a 153 dias por ano',
    description:
      'De janeiro até final de maio, cada centavo que você ganha vai para o governo. Em 2026, projeção de 153 dias com aumento do IOF. IBPT.',
  },
  {
    icon: TrendingDown,
    title: '30º de 30 países',
    description:
      'O Brasil é o ÚLTIMO em retorno dos impostos à sociedade. Pela 14ª vez consecutiva. IBPT/IRBES.',
  },
] as const

const FEATURE_CARDS = [
  {
    icon: Scan,
    title: 'Raio-X do Salário',
    description:
      'Cascata completa: empresa → bruto → líquido → consumo → poder de compra real.',
  },
  {
    icon: GitCompare,
    title: 'CLT vs PJ',
    description:
      'Compare regimes lado a lado: CLT, Simples Nacional, Lucro Presumido, MEI.',
  },
  {
    icon: Scale,
    title: 'Base Legal',
    description:
      'Cada número com lei, artigo e link para planalto.gov.br.',
  },
  {
    icon: ShieldCheck,
    title: 'Zero Dados',
    description:
      'Nada é armazenado. Seu salário nunca sai do seu navegador.',
  },
] as const

const STAT_CARDS = [
  { value: 'R$ 3,98 tri', label: 'arrecadados em impostos em 2025', source: 'Impostômetro / ACSP' },
  { value: '153 dias', label: 'projeção de dias trabalhados p/ impostos em 2026', source: 'IBPT (c/ aumento IOF, Lei 14.973/2024)' },
  { value: '40,82%', label: 'da renda foi para tributos em 2025', source: 'IBPT — Estudo Dias Trabalhados 2025' },
  { value: '83 dias', label: 'foram só para impostos sobre consumo em 2025', source: 'IBPT — Estudo Dias Trabalhados 2025' },
  { value: '30º de 30', label: 'pior retorno de impostos à sociedade em 2025', source: 'IBPT/IRBES 14ª edição, maio 2025' },
  { value: 'Lei 12.741/2012', label: 'obriga informar impostos na nota fiscal', source: 'planalto.gov.br — em vigor desde 10/06/2013' },
] as const

// ─── Main component ────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate()

  // Hero parallax
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  // Hero counter
  const counterRef = useRef<HTMLDivElement>(null)
  const counterInView = useInView(counterRef, { once: true })
  const animatedValue = useAnimatedNumber(40.82, 2, counterInView)
  const formattedCounter = useMemo(
    () => animatedValue.toFixed(2).replace('.', ','),
    [animatedValue],
  )

  // Waffle
  const waffleRef = useRef<HTMLDivElement>(null)
  const waffleInView = useInView(waffleRef, { once: true, margin: '-60px' })
  const waffleSquares = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        index: i,
        isTax: i < 4,
      })),
    [],
  )

  function handleCTA() {
    navigate('/raio-x')
  }

  return (
    <div className="min-h-screen bg-surface-0 text-txt-primary overflow-x-hidden">
      <SEOHead />
      <FAQSchemaData />
      <CalculatorSchemaData />
      {/* ═══ SEÇÃO 1 — HERO ═══ */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background glow */}
        <motion.div
          className="absolute inset-0 bg-gradient-hero"
          style={{ y: heroY }}
        />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(229,162,22,0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center"
          style={{ opacity: heroOpacity }}
        >
          <motion.p
            className="text-xs sm:text-sm uppercase tracking-[0.2em] text-accent-400 font-semibold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transparência tributária
          </motion.p>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-txt-primary"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Cada preço tem um segredo.
            <br />
            <span className="text-accent-400">Aqui ele aparece.</span>
          </motion.h1>

          <motion.p
            className="mt-6 text-base sm:text-lg text-txt-secondary max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Descubra quanto do seu dinheiro é imposto — do custo da empresa ao
            seu poder de compra real.
          </motion.p>

          {/* Animated counter */}
          <motion.div
            ref={counterRef}
            className="mt-10 sm:mt-14"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold font-mono tabular-nums"
              style={{ color: '#F5B731' }}
            >
              {formattedCounter}
            </span>
            <span className="text-3xl sm:text-4xl md:text-5xl font-bold font-mono text-accent-400 ml-1">
              %
            </span>
            <p className="text-sm sm:text-base text-txt-secondary mt-3">
              da sua renda vai para impostos no Brasil
            </p>
            <p className="text-[10px] text-txt-tertiary mt-2 uppercase tracking-wider">
              IBPT — Projeção 2026 (com IOF)
            </p>
          </motion.div>

          {/* CTA */}
          <motion.button
            onClick={handleCTA}
            type="button" className="mt-10 sm:mt-12 inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white transition-colors cursor-pointer"
            style={{
              backgroundColor: '#E5A216',
              boxShadow: '0 0 30px rgba(229,162,22,0.25)',
            }}
            whileHover={{
              backgroundColor: '#C4880E',
              scale: 1.03,
              boxShadow: '0 0 40px rgba(229,162,22,0.35)',
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Descobrir meus impostos
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-8 rounded-full flex justify-center pt-1.5" style={{ border: '2px solid #3D3D48' }}>
            <div className="w-1 h-2 rounded-full" style={{ backgroundColor: '#6B6B7B' }} />
          </div>
        </motion.div>
      </div>

      {/* ═══ SEÇÃO 2 — O PROBLEMA ═══ */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <SectionHeading>O que estão escondendo de você</SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROBLEM_CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <HoverCard key={card.title} className="p-6" delay={i * 0.1}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#2E2008' }}
                >
                  <Icon size={22} style={{ color: '#F5B731' }} />
                </div>
                <h3 className="text-base font-semibold text-txt-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-txt-secondary leading-relaxed flex-1">
                  {card.description}
                </p>
              </HoverCard>
            )
          })}
        </div>
      </Section>

      {/* ═══ SEÇÃO 3 — COMO FUNCIONA ═══ */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <SectionHeading>Como o TributôMetro funciona</SectionHeading>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden md:block absolute top-24 left-[16.6%] right-[16.6%] h-px"
            style={{ backgroundColor: 'rgba(229,162,22,0.2)' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <StepItem
              step={1}
              icon={<PenLine size={24} style={{ color: '#E5A216' }} />}
              title="Insira seu salário"
              description="Basta informar quanto você ganha. Não armazenamos nenhum dado."
              delay={0}
            />
            <StepItem
              step={2}
              icon={<BarChart3 size={24} style={{ color: '#E5A216' }} />}
              title="Veja a cascata"
              description="De ponta a ponta: quanto a empresa gasta → seus descontos → impostos no consumo."
              delay={0.12}
            />
            <StepItem
              step={3}
              icon={<Target size={24} style={{ color: '#E5A216' }} />}
              title="Descubra a verdade"
              description="Quanto do seu dinheiro realmente é seu — e quanto vai para impostos."
              delay={0.24}
            />
          </div>
        </div>
      </Section>

      {/* ═══ SEÇÃO 4 — FEATURES ═══ */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <SectionHeading>O que você pode fazer</SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURE_CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <HoverCard key={card.title} className="p-6" delay={i * 0.08}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(229,162,22,0.08)' }}
                >
                  <Icon size={22} style={{ color: '#E5A216' }} />
                </div>
                <h3 className="text-base font-semibold text-txt-primary mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-txt-secondary leading-relaxed flex-1">
                  {card.description}
                </p>
              </HoverCard>
            )
          })}
        </div>
      </Section>

      {/* ═══ SEÇÃO 5 — IMPACTO VISUAL (Waffle) ═══ */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 max-w-4xl mx-auto">
        <SectionHeading>De cada R$ 10 que você ganha...</SectionHeading>

        <div ref={waffleRef} className="flex gap-2 max-w-3xl mx-auto">
          {waffleSquares.map((sq) => (
            <WaffleSquare
              key={sq.index}
              index={sq.index}
              isTax={sq.isTax}
              isInView={waffleInView}
            />
          ))}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={waffleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.4 }}
        >
          <p className="text-base sm:text-lg text-txt-primary font-medium">
            ...
            <span style={{ color: '#F5B731' }} className="font-bold">
              R$ 4 vão para impostos
            </span>
            .
          </p>
          <p className="text-sm text-txt-secondary mt-2 max-w-lg mx-auto">
            E o Brasil devolve menos do que qualquer outro país com carga similar.
          </p>
        </motion.div>
      </Section>

      {/* ═══ SEÇÃO 6 — DADOS REAIS ═══ */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <SectionHeading>Números que você precisa conhecer</SectionHeading>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {STAT_CARDS.map((card, i) => (
            <StatCard
              key={card.value}
              value={card.value}
              label={card.label}
              source={card.source}
              delay={i * 0.08}
            />
          ))}
        </div>
      </Section>

      {/* ═══ SEÇÃO 7 — CTA FINAL ═══ */}
      <Section className="py-20 sm:py-28 px-4 sm:px-6">
        <div
          className="max-w-4xl mx-auto rounded-3xl px-6 py-16 sm:px-12 sm:py-20 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #E5A216 0%, #C4880E 50%, #9E6D0B 100%)',
          }}
        >
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: '#111113' }}>
              Pare de pagar sem saber quanto.
            </h2>
            <p className="mt-4 text-base sm:text-lg" style={{ color: '#2E2008' }}>
              O primeiro passo é ver os números.
            </p>

            <motion.button
              onClick={handleCTA}
              type="button" className="mt-10 inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-semibold cursor-pointer"
              style={{
                backgroundColor: '#111113',
                color: '#F5B731',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              Calcular meus impostos
              <ArrowRight size={18} />
            </motion.button>

            <p className="mt-6 text-xs max-w-md mx-auto" style={{ color: '#2E2008' }}>
              100% gratuito. Zero cadastro. Seus dados nunca saem do seu navegador.
            </p>
          </div>
        </div>
      </Section>

      {/* ═══ SEÇÃO 8 — FOOTER ═══ */}
      <footer className="py-12 sm:py-16 px-4 sm:px-6" style={{ borderTop: '1px solid #232328' }}>
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center shadow-glow">
              <Eye size={14} className="text-accent-200" />
            </div>
            <span className="text-sm font-semibold text-txt-primary">
              Tributô<span className="text-accent-400 font-light">Metro</span>
            </span>
            <span className="text-txt-tertiary mx-1">—</span>
            <span className="text-xs text-txt-tertiary">
              Transparência tributária
            </span>
          </div>

          <p className="text-xs text-txt-tertiary leading-relaxed">
            Dados baseados na legislação brasileira vigente em 2026.
          </p>
          <p className="text-xs text-txt-tertiary leading-relaxed">
            Fontes: IBPT, Receita Federal, INSS, Planalto.
          </p>
          <p className="text-xs text-txt-tertiary leading-relaxed">
            Não tem filiação partidária. Transparência não tem lado.
          </p>

          <a
            href="https://github.com/Pl3ntz/tributometro"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-txt-tertiary hover:text-txt-secondary transition-colors mt-4"
          >
            <Github size={14} />
            Código aberto no GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
