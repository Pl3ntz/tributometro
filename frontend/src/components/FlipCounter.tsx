import { useEffect, useRef, useState } from 'react'
import './FlipCounter.css'

interface Props {
  value: number
  prefix?: string
  decimals?: number
  className?: string
}

/**
 * Split-flap display counter (airport/train station style).
 * Each digit flips from top to bottom when changing.
 */
export default function FlipCounter({ value, prefix = 'R$ ', decimals = 2, className = '' }: Props) {
  const formatted = formatNumber(value, decimals)
  const chars = (prefix + formatted).split('')

  return (
    <div className={`flex items-center gap-[2px] ${className}`}>
      {chars.map((char, i) => (
        <FlipDigit key={`${i}-pos`} char={char} index={i} />
      ))}
    </div>
  )
}

function FlipDigit({ char, index }: { char: string; index: number }) {
  const [current, setCurrent] = useState(char)
  const [previous, setPrevious] = useState(char)
  const [flipping, setFlipping] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (char !== current) {
      setPrevious(current)
      setCurrent(char)
      setFlipping(true)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setFlipping(false), 400)
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [char, current])

  const isDigit = /\d/.test(char)
  const isSeparator = char === '.' || char === ','

  if (isSeparator) {
    return <span className="flip-separator">{char}</span>
  }

  if (!isDigit && char !== ' ') {
    return <span className="flip-prefix">{char}</span>
  }

  if (char === ' ') {
    return <span className="flip-space" />
  }

  return (
    <div
      className="flip-card"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Static top half — shows current */}
      <div className="flip-card-top">
        <span>{current}</span>
      </div>

      {/* Static bottom half — shows current */}
      <div className="flip-card-bottom">
        <span>{current}</span>
      </div>

      {/* Animated top flap — flips down from previous to current */}
      {flipping && (
        <div className="flip-card-flap-top" key={`${current}-${Date.now()}`}>
          <span>{previous}</span>
        </div>
      )}

      {/* Animated bottom flap — reveals current */}
      {flipping && (
        <div className="flip-card-flap-bottom" key={`b-${current}-${Date.now()}`}>
          <span>{current}</span>
        </div>
      )}

      {/* Center line */}
      <div className="flip-card-line" />
    </div>
  )
}

function formatNumber(value: number, decimals: number): string {
  const parts = value.toFixed(decimals).split('.')
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return decimals > 0 ? `${intPart},${parts[1]}` : intPart
}
