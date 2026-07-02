'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, GraduationCap, Instagram, Facebook, Youtube, ChevronDown } from 'lucide-react'

type NavItem = { label: string; href: string; children?: never } | { label: string; children: { label: string; href: string }[]; href?: never }

const categories: NavItem[] = [
  { label: 'EJA', href: '/#cursos-eja' },
  { label: 'Pós-Graduação', href: '/#cursos-pos-graduacao' },
  {
    label: 'Graduação',
    children: [
      { label: 'Bacharelado', href: '/#cursos-graduacao' },
      { label: 'Tecnólogo', href: '/#cursos-tecnologo' },
    ],
  },
  { label: 'Cursos Livres', href: '/#cursos-livre' },
  { label: 'Técnico', href: '/#cursos-tecnico' },
]

interface SocialData {
  instagram?: string
  facebook?: string
  youtube?: string
  whatsapp?: string
}

interface Props {
  socialData?: SocialData
}

export default function Header({ socialData }: Props) {
  const [open, setOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileSubOpen, setMobileSubOpen] = useState<string | null>(null)
  const d = socialData || {}

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
              c.children ? (
                <div
                  key={c.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(c.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    onClick={() => setOpenMenu(openMenu === c.label ? null : c.label)}
                    className="flex items-center gap-1 text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {c.label}
                    <ChevronDown size={14} className={`transition-transform ${openMenu === c.label ? 'rotate-180' : ''}`} />
                  </button>
                  {openMenu === c.label && (
                    <div className="absolute top-full left-0 pt-2 min-w-[160px]">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 overflow-hidden">
                        {c.children.map(sub => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            onClick={() => setOpenMenu(null)}
                            className="block px-4 py-2 text-sm text-primary-900 hover:bg-primary-50 transition-colors"
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a key={c.label} href={c.href} className="text-sm text-blue-200 hover:text-white transition-colors">
                  {c.label}
                </a>
              )
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Redes Sociais */}
            {d.instagram && (
              <a href={d.instagram} target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-700 transition-colors text-blue-300 hover:text-white">
                <Instagram size={18} />
              </a>
            )}
            {d.facebook && (
              <a href={d.facebook} target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-700 transition-colors text-blue-300 hover:text-white">
                <Facebook size={18} />
              </a>
            )}
            {d.youtube && (
              <a href={d.youtube} target="_blank" rel="noopener noreferrer"
                 className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary-700 transition-colors text-blue-300 hover:text-white">
                <Youtube size={18} />
              </a>
            )}
            <a
              href={`https://wa.me/${d.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
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
            c.children ? (
              <div key={c.label}>
                <button
                  onClick={() => setMobileSubOpen(mobileSubOpen === c.label ? null : c.label)}
                  className="flex items-center justify-between w-full text-blue-200 hover:text-white py-1"
                >
                  {c.label}
                  <ChevronDown size={16} className={`transition-transform ${mobileSubOpen === c.label ? 'rotate-180' : ''}`} />
                </button>
                {mobileSubOpen === c.label && (
                  <div className="pl-4 space-y-2 pt-1">
                    {c.children.map(sub => (
                      <a key={sub.label} href={sub.href} onClick={() => { setOpen(false); setMobileSubOpen(null) }}
                         className="block text-blue-300 hover:text-white py-1 text-sm">
                        {sub.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a key={c.label} href={c.href} onClick={() => setOpen(false)}
                 className="block text-blue-200 hover:text-white py-1">
                {c.label}
              </a>
            )
          ))}
          <div className="flex gap-3 pt-1">
            {d.instagram && (
              <a href={d.instagram} target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 bg-primary-700 rounded-lg flex items-center justify-center text-blue-300 hover:text-white">
                <Instagram size={18} />
              </a>
            )}
            {d.facebook && (
              <a href={d.facebook} target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 bg-primary-700 rounded-lg flex items-center justify-center text-blue-300 hover:text-white">
                <Facebook size={18} />
              </a>
            )}
            {d.youtube && (
              <a href={d.youtube} target="_blank" rel="noopener noreferrer"
                 className="w-9 h-9 bg-primary-700 rounded-lg flex items-center justify-center text-blue-300 hover:text-white">
                <Youtube size={18} />
              </a>
            )}
          </div>
          <a
            href={`https://wa.me/${d.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
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
