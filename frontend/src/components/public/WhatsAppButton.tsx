'use client'
import { MessageCircle } from 'lucide-react'

interface Props {
  number?: string
  message?: string
}

export default function WhatsAppButton({ number, message }: Props) {
  const tel = number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
  const msg = encodeURIComponent(message || 'Olá! Gostaria de saber mais sobre os cursos da Academy Pop.')
  const href = `https://wa.me/${tel}?text=${msg}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-3 rounded-full shadow-2xl transition-all duration-200 hover:scale-105 group"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle size={24} />
      <span className="hidden md:block text-sm">Falar no WhatsApp</span>
    </a>
  )
}
