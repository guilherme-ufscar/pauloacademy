import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary-950 flex items-center justify-center px-4 text-white">
      <div className="text-center">
        <GraduationCap size={64} className="mx-auto mb-4 text-accent-400" />
        <h1 className="text-8xl font-black text-primary-700 mb-2">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página não encontrada</h2>
        <p className="text-blue-300 mb-8">A página que você está procurando não existe.</p>
        <Link href="/" className="btn-primary">Voltar ao início</Link>
      </div>
    </div>
  )
}
