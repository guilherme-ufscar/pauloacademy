'use client'
import { useEffect, useState } from 'react'

export default function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0, expired: false })

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) { setTime(t => ({ ...t, expired: true })); return }
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTime({ h, m, s, expired: false })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (time.expired) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1 text-accent-600">
      <span className="text-xs font-medium">Oferta expira em:</span>
      <div className="flex items-center gap-1 font-mono font-bold text-sm">
        <span className="bg-accent-100 text-accent-700 px-2 py-0.5 rounded">{pad(time.h)}</span>
        <span>:</span>
        <span className="bg-accent-100 text-accent-700 px-2 py-0.5 rounded">{pad(time.m)}</span>
        <span>:</span>
        <span className="bg-accent-100 text-accent-700 px-2 py-0.5 rounded">{pad(time.s)}</span>
      </div>
    </div>
  )
}
