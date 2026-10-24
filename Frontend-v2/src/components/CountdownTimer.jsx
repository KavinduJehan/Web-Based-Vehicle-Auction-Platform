import { useState, useEffect } from 'react'

function calcLeft(target) {
  const diff = new Date(target) - Date.now()
  if (diff <= 0) return null
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff % 86400000) / 3600000),
    m: Math.floor((diff % 3600000) / 60000),
    s: Math.floor((diff % 60000) / 1000),
  }
}

export default function CountdownTimer({ endsAt, className = '' }) {
  const [left, setLeft] = useState(() => calcLeft(endsAt))

  useEffect(() => {
    const id = setInterval(() => setLeft(calcLeft(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (!left) {
    return <span className={`text-red-600 font-semibold text-sm ${className}`}>Ended</span>
  }

  const parts = []
  if (left.d > 0) parts.push(`${left.d}d`)
  parts.push(`${String(left.h).padStart(2, '0')}h`)
  parts.push(`${String(left.m).padStart(2, '0')}m`)
  parts.push(`${String(left.s).padStart(2, '0')}s`)

  return (
    <span className={`font-mono font-semibold text-sm text-green-700 ${className}`}>
      {parts.join(' ')}
    </span>
  )
}
