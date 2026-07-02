import { Award, Monitor, Clock, HeadphonesIcon, ChevronRight, Star, CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import WhatsAppButton from '@/components/public/WhatsAppButton'
import CourseCard from '@/components/public/CourseCard'
import type { Course } from '@/types'

function slugifyCategory(cat: string) {
  return cat
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const ICON_MAP: Record<string, React.ReactNode> = {
  award: <Award size={24} />,
  monitor: <Monitor size={24} />,
  clock: <Clock size={24} />,
  headphones: <HeadphonesIcon size={24} />,
}

async function getData() {
  const base = process.env.INTERNAL_API_URL || 'http://backend:3001'
  try {
    const [coursesRes, contentRes] = await Promise.all([
      fetch(`${base}/courses`, { next: { revalidate: 60 } }),
      fetch(`${base}/content`, { next: { revalidate: 300 } }),
    ])
    const courses = coursesRes.ok ? await coursesRes.json() : []
    const content = contentRes.ok ? await contentRes.json() : {}
    return { courses, content }
  } catch {
    return { courses: [], content: {} }
  }
}

export default async function HomePage() {
  const { courses, content } = await getData()
  const hero = content.hero || {}
  const benefits = content.benefits?.items || []
  const about = content.about || {}
  const footer = content.footer || {}

  const categories = Array.from(new Set((courses as Course[]).map(c => c.category)))

  return (
    <>
      <Header socialData={footer} />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            {hero.badge_text && (
              <div className="inline-flex items-center gap-2 bg-accent-500/20 border border-accent-400/30 text-accent-300 text-sm px-4 py-1.5 rounded-full mb-6">
                <Star size={14} className="fill-accent-400 text-accent-400" />
                {hero.badge_text}
              </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              {hero.headline || 'Transforme sua carreira com educação de qualidade'}
            </h1>
            <p className="text-xl text-blue-200 mb-8 leading-relaxed">
              {hero.subheadline || 'Cursos EJA, Pós-Graduação e muito mais — 100% EAD, com certificado reconhecido.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#cursos" className="btn-primary text-base px-8 py-4">
                {hero.cta_text || 'Ver Cursos'} <ChevronRight size={20} />
              </a>
              <a
                href={`https://wa.me/${(footer as Record<string,string>).whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline text-base px-8 py-4"
              >
                Falar com Consultor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits bar */}
      {benefits.length > 0 && (
        <section className="bg-primary-800 text-white py-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {benefits.map((b: { icon: string; text: string }, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm font-medium text-blue-200">
                  <span className="text-accent-400">{ICON_MAP[b.icon] || <CheckCircle size={20} />}</span>
                  {b.text}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cursos */}
      <section id="cursos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Nossos Cursos</h2>
            <p className="section-subtitle">
              Escolha o curso ideal para sua carreira e comece hoje mesmo
            </p>
          </div>

          {categories.map(cat => {
            const catCourses = (courses as Course[]).filter(c => c.category === cat)
            return (
              <div key={cat} id={`cursos-${slugifyCategory(cat)}`} className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-8">
                  <h3 className="text-2xl font-bold text-primary-900">{cat}</h3>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catCourses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </div>
            )
          })}

          {courses.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Monitor size={48} className="mx-auto mb-4 opacity-40" />
              <p>Cursos em breve. Entre em contato!</p>
            </div>
          )}
        </div>
      </section>

      {/* Sobre */}
      {about.title && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="section-title">{about.title}</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">{about.text}</p>
                {about.stats && (
                  <div className="grid grid-cols-2 gap-6">
                    {(about.stats as Array<{ value: string; label: string }>).map((s, i) => (
                      <div key={i} className="text-center p-4 bg-primary-50 rounded-xl">
                        <p className="text-3xl font-black text-accent-600">{s.value}</p>
                        <p className="text-sm text-gray-600 mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                {about.image ? (
                  <Image src={about.image} alt="Sobre" width={600} height={400} className="rounded-2xl shadow-2xl" />
                ) : (
                  <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl h-80 flex items-center justify-center">
                    <Users size={80} className="text-primary-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-accent-600 to-accent-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black mb-4">Pronto para começar?</h2>
          <p className="text-xl text-orange-100 mb-8">
            Fale com nosso time e tire todas as suas dúvidas antes de se matricular.
          </p>
          <a
            href={`https://wa.me/${(footer as Record<string,string>).whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-accent-700 hover:bg-orange-50 font-bold text-lg px-10 py-4 rounded-xl shadow-xl transition-all hover:-translate-y-1"
          >
            Falar no WhatsApp Agora
          </a>
        </div>
      </section>

      <Footer data={footer as Parameters<typeof Footer>[0]['data']} />
      <WhatsAppButton />
    </>
  )
}
