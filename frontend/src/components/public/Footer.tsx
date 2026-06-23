import Link from 'next/link'
import { GraduationCap, Phone, Mail, Instagram, Facebook, Youtube } from 'lucide-react'

interface FooterData {
  company_name?: string
  description?: string
  whatsapp?: string
  email?: string
  address?: string
  instagram?: string
  facebook?: string
  youtube?: string
}

export default function Footer({ data }: { data?: FooterData }) {
  const d = data || {}

  return (
    <footer className="bg-primary-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <div className="w-9 h-9 bg-accent-500 rounded-lg flex items-center justify-center">
                <GraduationCap size={22} className="text-white" />
              </div>
              <span>{d.company_name || 'Academy Pop'}</span>
            </Link>
            <p className="text-blue-300 text-sm leading-relaxed">
              {d.description || 'Educação de qualidade para transformar vidas.'}
            </p>
            <div className="flex gap-3 mt-4">
              {d.instagram && (
                <a href={d.instagram} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 bg-primary-800 hover:bg-accent-600 rounded-lg flex items-center justify-center transition-colors">
                  <Instagram size={16} />
                </a>
              )}
              {d.facebook && (
                <a href={d.facebook} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 bg-primary-800 hover:bg-accent-600 rounded-lg flex items-center justify-center transition-colors">
                  <Facebook size={16} />
                </a>
              )}
              {d.youtube && (
                <a href={d.youtube} target="_blank" rel="noopener noreferrer"
                   className="w-9 h-9 bg-primary-800 hover:bg-accent-600 rounded-lg flex items-center justify-center transition-colors">
                  <Youtube size={16} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Cursos</h3>
            <ul className="space-y-2 text-blue-300 text-sm">
              {['EJA', 'Pós-Graduação', 'Compliance', 'Cursos Livres', 'Técnico'].map(c => (
                <li key={c}>
                  <a href="/#cursos" className="hover:text-white transition-colors">{c}</a>
                </li>
              ))}
            </ul>
            <h3 className="font-semibold text-white mt-6 mb-4">Institucional</h3>
            <ul className="space-y-2 text-blue-300 text-sm">
              <li><Link href="/sobre-nos" className="hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link href="/perguntas-frequentes" className="hover:text-white transition-colors">Perguntas Frequentes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contato</h3>
            <ul className="space-y-3 text-blue-300 text-sm">
              {d.whatsapp && (
                <li>
                  <a href={`https://wa.me/${d.whatsapp}`} target="_blank" rel="noopener noreferrer"
                     className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone size={14} /> WhatsApp
                  </a>
                </li>
              )}
              {d.email && (
                <li>
                  <a href={`mailto:${d.email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail size={14} /> {d.email}
                  </a>
                </li>
              )}
              {d.address && <li className="text-blue-400">{d.address}</li>}
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-400 text-xs">
            © {new Date().getFullYear()} {d.company_name || 'Academy Pop'}. Todos os direitos reservados.
          </p>
          <div className="flex gap-4 text-blue-400 text-xs">
            <a href="#" className="hover:text-white">Política de Privacidade</a>
            <a href="#" className="hover:text-white">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
