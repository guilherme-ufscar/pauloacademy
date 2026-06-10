import Link from 'next/link'
import { CheckCircle, ArrowLeft } from 'lucide-react'

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento Confirmado!</h1>
        <p className="text-gray-600 mb-8">
          Sua matrícula foi realizada com sucesso. Em breve você receberá um e-mail com as instruções de acesso.
        </p>
        <Link href="/" className="btn-primary w-full justify-center">
          <ArrowLeft size={18} /> Voltar ao início
        </Link>
      </div>
    </div>
  )
}
