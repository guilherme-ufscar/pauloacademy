'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, GraduationCap } from 'lucide-react'

const categories = [
  { label: 'EJA', href: '/#cursos' },
  { label: 'Pós-Graduação', href: '/#cursos' },
  { label: 'Cursos Livres', href: '/#cursos' },
  { label: 'Técnico', href: '/#cursos' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-primary-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 bg-accent-500 rounded-lg flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span>Academy<span className="text-accent-400">Pop</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {categories.map(c => (
              <a key={c.label} href={c.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                {c.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2"
            >
              Fale Conosco
            </a>
          </div>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-primary-800">
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-primary-800 border-t border-primary-700 px-4 py-4 space-y-3">
          {categories.map(c => (
            <a key={c.label} href={c.href} onClick={() => setOpen(false)}
               className="block text-blue-200 hover:text-white py-1">
              {c.label}
            </a>
          ))}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm py-2 mt-2 w-full justify-center"
          >
            Fale Conosco
          </a>
        </div>
      )}
    </header>
  )
}
