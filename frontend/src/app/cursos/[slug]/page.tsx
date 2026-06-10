import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  Clock, Monitor, Tag, Award, CheckCircle, ChevronDown,
  Users, Star, MessageCircle
} from 'lucide-react'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import WhatsAppButton from '@/components/public/WhatsAppButton'
import CountdownTimer from '@/components/public/CountdownTimer'
import type { Course } from '@/types'

async function getCourse(slug: string): Promise<Course | null> {
  const base = process.env.INTERNAL_API_URL || 'http://backend:3001'
  try {
    const res = await fetch(`${base}/courses/slug/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getContent() {
  const base = process.env.INTERNAL_API_URL || 'http://backend:3001'
  try {
    const res = await fetch(`${base}/content`, { next: { revalidate: 300 } })
    return res.ok ? res.json() : {}
  } catch { return {} }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const course = await getCourse(params.slug)
  if (!course) return { title: 'Curso não encontrado' }
  return {
    title: course.seo_title || `${course.title} | Academy Pop`,
    description: course.seo_description || course.subtitle,
  }
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const [course, content] = await Promise.all([getCourse(params.slug), getContent()])
  if (!course) notFound()

  const footer = content.footer || {}
  const pricePix = Number(course.price_pix || 0)
  const installmentValue = Number(course.installment_value || 0)
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
  const whatsappMsg = encodeURIComponent(
    course.whatsapp_message || `Olá! Tenho interesse no curso ${course.title}.`
  )
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${whatsappMsg}`

  return (
    <>
      <Header />

      {/* Hero do Curso */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Link href="/" className="text-blue-300 hover:text-white text-sm">Início</Link>
                <span className="text-blue-500">/</span>
                <span className="text-blue-300 text-sm">{course.category}</span>
              </div>
              <span className="badge bg-accent-500 text-white mb-4 inline-block">{course.category}</span>
              <h1 className="text-3xl md:text-5xl font-black leading-tight mb-4">{course.title}</h1>
              {course.subtitle && <p className="text-xl text-blue-200 mb-6">{course.subtitle}</p>}

              <div className="flex flex-wrap gap-4 mb-6 text-sm text-blue-200">
                {course.workload && (
                  <span className="flex items-center gap-1.5"><Clock size={16} className="text-accent-400" /> {course.workload} horas</span>
                )}
                <span className="flex items-center gap-1.5"><Monitor size={16} className="text-accent-400" /> {course.modality}</span>
                {course.duration && (
                  <span className="flex items-center gap-1.5"><Tag size={16} className="text-accent-400" /> {course.duration}</span>
                )}
                {course.vacancy_count && (
                  <span className="flex items-center gap-1.5 text-accent-400 font-semibold">
                    <Users size={16} /> Apenas {course.vacancy_count} vagas
                  </span>
                )}
              </div>

              {course.offer_expires_at && (
                <div className="bg-accent-500/20 border border-accent-400/30 rounded-lg px-4 py-2 mb-6 inline-block">
                  <CountdownTimer expiresAt={course.offer_expires_at} />
                </div>
              )}
            </div>

            {/* Cartão de Preço */}
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8">
              {course.cover_image && (
                <div className="relative h-48 rounded-xl overflow-hidden mb-6">
                  <Image src={course.cover_image} alt={course.title} fill className="object-cover" />
                </div>
              )}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Investimento</p>
                {pricePix > 0 ? (
                  <>
                    <p className="text-xs text-green-600 font-medium mb-0.5">À vista no PIX</p>
                    <p className="text-4xl font-black text-primary-900">
                      {pricePix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {installmentValue > 0 && (
                      <p className="text-gray-500 mt-1">
                        ou {course.installments}x de{' '}
                        <strong className="text-primary-700">
                          {installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </strong>
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-2xl font-bold text-primary-700">Consulte condições</p>
                )}
              </div>

              <Link
                href={`/checkout/${course.slug}`}
                className="btn-primary w-full justify-center text-base py-4 mb-3"
              >
                Matricular Agora
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                <MessageCircle size={18} /> Tirar dúvidas no WhatsApp
              </a>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                {['Certificado reconhecido', 'Acesso imediato ao material', 'Suporte dedicado', 'Estude no seu ritmo'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle size={16} className="text-green-500 shrink-0" /> {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre o Curso */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-primary-900 mb-8">Sobre o Curso</h2>
          {course.description && (
            <div
              className="prose-content text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          )}
        </div>
      </section>

      {/* Grade Curricular */}
      {course.modules && course.modules.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-primary-900 mb-8">Grade Curricular</h2>
            <div className="space-y-4">
              {course.modules.map((mod, i) => (
                <details key={mod.id || i} className="bg-white rounded-xl shadow-sm border border-gray-100 group" open={i === 0}>
                  <summary className="flex items-center justify-between p-5 cursor-pointer select-none">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-sm font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="font-semibold text-primary-900">{mod.name}</span>
                      {mod.workload > 0 && (
                        <span className="text-xs text-gray-400 hidden sm:block">{mod.workload}h</span>
                      )}
                    </div>
                    <ChevronDown size={18} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0" />
                  </summary>
                  {mod.disciplines && mod.disciplines.length > 0 && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      <ul className="mt-4 space-y-2">
                        {(mod.disciplines as Array<string | { name: string }>).map((d, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-accent-500 rounded-full shrink-0" />
                            {typeof d === 'string' ? d : d.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Professores */}
      {course.professors && course.professors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-primary-900 mb-8">Corpo Docente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.professors.map(prof => (
                <div key={prof.id} className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="relative w-16 h-16 shrink-0">
                    {prof.photo ? (
                      <Image src={prof.photo} alt={prof.name} fill className="rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
                        {prof.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-primary-900 truncate">{prof.name}</h3>
                    {prof.bio && <p className="text-gray-600 text-sm mt-1 line-clamp-3">{prof.bio}</p>}
                    {prof.specialties && prof.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prof.specialties.map(s => (
                          <span key={s} className="badge bg-primary-100 text-primary-700">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Depoimentos */}
      {course.testimonials && course.testimonials.length > 0 && (
        <section className="py-16 bg-primary-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-primary-900 mb-8">O que nossos alunos dizem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {course.testimonials.map(t => (
                <div key={t.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary-200 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                      {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Award size={48} className="mx-auto mb-4 text-accent-400" />
          <h2 className="text-3xl font-black mb-4">Garanta sua vaga agora</h2>
          <p className="text-blue-200 mb-8 text-lg">
            {pricePix > 0
              ? `Por apenas ${pricePix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} à vista ou ${course.installments}x de ${installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
              : 'Entre em contato para saber as condições'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/checkout/${course.slug}`} className="btn-primary text-base px-10 py-4">
              Matricular Agora
            </Link>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer"
               className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-10 py-4 rounded-lg transition-colors">
              <MessageCircle size={20} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer data={footer as Parameters<typeof Footer>[0]['data']} />
      <WhatsAppButton number={whatsappNumber} message={course.whatsapp_message} />
    </>
  )
}
