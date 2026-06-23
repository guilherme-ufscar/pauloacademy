'use client'
import { useEffect, useState } from 'react'
import { Timer } from 'lucide-react'

export default function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0, expired: false, loaded: false })

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTime({ d: 0, h: 0, m: 0, s: 0, expired: true, loaded: true })
        return
      }
      const d = Math.floor(diff / 86_400_000)
      const h = Math.floor((diff % 86_400_000) / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      setTime({ d, h, m, s, expired: false, loaded: true })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (!time.loaded) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  if (time.expired) {
    return (
      <div className="flex items-center gap-2 text-red-600 font-bold text-base">
        <Timer size={20} />
        <span>Oferta encerrada</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-accent-700 font-bold text-sm uppercase tracking-wide">
        <Timer size={18} className="animate-pulse" />
        <span>Oferta por tempo limitado!</span>
      </div>
      <div className="flex items-center gap-2 font-mono font-black text-2xl text-accent-800">
        {time.d > 0 && (
          <>
            <span className="bg-accent-100 border border-accent-300 text-accent-800 px-3 py-1.5 rounded-lg min-w-[3rem] text-center">{pad(time.d)}</span>
            <span className="text-accent-500">d</span>
          </>
        )}
        <span className="bg-accent-100 border border-accent-300 text-accent-800 px-3 py-1.5 rounded-lg min-w-[3rem] text-center">{pad(time.h)}</span>
        <span className="text-accent-500 text-xl">:</span>
        <span className="bg-accent-100 border border-accent-300 text-accent-800 px-3 py-1.5 rounded-lg min-w-[3rem] text-center">{pad(time.m)}</span>
        <span className="text-accent-500 text-xl">:</span>
        <span className="bg-accent-100 border border-accent-300 text-accent-800 px-3 py-1.5 rounded-lg min-w-[3rem] text-center">{pad(time.s)}</span>
      </div>
    </div>
  )
}
