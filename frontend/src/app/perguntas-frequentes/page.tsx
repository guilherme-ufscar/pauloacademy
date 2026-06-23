import type { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'

export const metadata: Metadata = {
  title: 'Perguntas Frequentes | Academy Pop',
}

async function getContent() {
  const base = process.env.INTERNAL_API_URL || 'http://backend:3001'
  try {
    const res = await fetch(`${base}/content`, { next: { revalidate: 300 } })
    return res.ok ? res.json() : {}
  } catch { return {} }
}

export default async function FaqPage() {
  const content = await getContent()
  const footer = (content.footer as Record<string, unknown>) || {}
  const faqGeral = (content.faq_geral as Record<string, unknown>) || {}
  const items = (faqGeral.items as Array<{ question: string; answer: string }>) || []

  return (
    <>
      <Header socialData={footer as Parameters<typeof Header>[0]['socialData']} />

      <section className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">Perguntas Frequentes</h1>
          <p className="text-blue-200 text-xl">Tire suas dúvidas sobre nossos cursos e plataforma</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 py-16">
              Nenhuma pergunta cadastrada ainda. Acesse o painel administrativo → Conteúdo → FAQ Geral.
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item, i) => (
                <details key={i} className="bg-gray-50 rounded-xl border border-gray-100 group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer select-none font-semibold text-primary-900 text-lg">
                    {item.question}
                    <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0 ml-4" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-200 pt-4">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer data={footer as Parameters<typeof Footer>[0]['data']} />
    </>
  )
}
