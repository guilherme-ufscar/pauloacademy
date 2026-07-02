'use client'
import { useEffect, useState } from 'react'
import { Save, Loader2, Plus, Trash2, ChevronDown, ChevronUp, Rocket, CheckCircle, School, Building2, HelpCircle, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import ImageUpload from '@/components/admin/ImageUpload'

interface BenefitItem { icon: string; text: string }
interface Stat { value: string; label: string }

const ICONS = ['award', 'monitor', 'clock', 'headphones', 'check', 'star', 'users', 'book']

export default function ConteudoPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [sections, setSections] = useState<Record<string, unknown>>({})
  const [expanded, setExpanded] = useState<string>('hero')

  useEffect(() => {
    api.get('/content').then(r => setSections(r.data)).finally(() => setLoading(false))
  }, [])

  const save = async (key: string) => {
    setSaving(key)
    try {
      await api.put(`/content/${key}`, { data: sections[key] })
      toast.success('Seção salva!')
    } catch { toast.error('Erro ao salvar') }
    finally { setSaving(null) }
  }

  const update = (key: string, data: unknown) => setSections(s => ({ ...s, [key]: data }))

  const getSection = (key: string): Record<string, unknown> => {
    return (sections[key] as Record<string, unknown>) || {}
  }

  const toggle = (key: string) => setExpanded(e => e === key ? '' : key)

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>

  const sectionCard = (key: string, icon: React.ReactNode, title: string, content: React.ReactNode) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => toggle(key)}>
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="text-primary-600">{icon}</span> {title}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); save(key) }}
            disabled={saving === key}
            className="btn-primary py-1.5 px-4 text-sm"
          >
            {saving === key ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Salvar</>}
          </button>
          {expanded === key ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </div>
      {expanded === key && <div className="px-5 pb-5 border-t border-gray-100 pt-4">{content}</div>}
    </div>
  )

  // Hero
  const hero = getSection('hero')
  // Benefits
  const benefits = getSection('benefits')
  const benefitItems = (benefits.items as BenefitItem[]) || []
  // About
  const about = getSection('about')
  const stats = (about.stats as Stat[]) || []
  // Footer
  const footer = getSection('footer')
  // Sobre Nós
  const sobreNos = getSection('sobre_nos')
  const sobreValues = (sobreNos.values as string[]) || []
  // FAQ Geral
  const faqGeral = getSection('faq_geral')
  const faqItems = (faqGeral.items as Array<{ question: string; answer: string }>) || []

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Conteúdo do Site</h1>
        <p className="text-gray-500">Edite textos e imagens das seções principais</p>
      </div>

      {sectionCard('hero', <Rocket size={18} />, 'Hero – Seção Principal', (
        <div className="space-y-4">
          <div>
            <label className="label">Título Principal (headline)</label>
            <input value={String(hero.headline || '')} onChange={e => update('hero', { ...hero, headline: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Subtítulo</label>
            <textarea value={String(hero.subheadline || '')} onChange={e => update('hero', { ...hero, subheadline: e.target.value })} className="input" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Texto do Botão CTA</label>
              <input value={String(hero.cta_text || '')} onChange={e => update('hero', { ...hero, cta_text: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Badge (ex: "5.000 alunos")</label>
              <input value={String(hero.badge_text || '')} onChange={e => update('hero', { ...hero, badge_text: e.target.value })} className="input" />
            </div>
          </div>
          <ImageUpload value={String(hero.background_image || '')} onChange={v => update('hero', { ...hero, background_image: v })} label="Imagem de Fundo (opcional)" />
        </div>
      ))}

      {sectionCard('benefits', <CheckCircle size={18} />, 'Barra de Benefícios', (
        <div className="space-y-3">
          {benefitItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <select
                value={item.icon}
                onChange={e => {
                  const items = [...benefitItems]; items[i] = { ...items[i], icon: e.target.value }
                  update('benefits', { ...benefits, items })
                }}
                className="input w-32 text-xs"
              >
                {ICONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <input
                value={item.text}
                onChange={e => {
                  const items = [...benefitItems]; items[i] = { ...items[i], text: e.target.value }
                  update('benefits', { ...benefits, items })
                }}
                className="input flex-1"
                placeholder="Benefício"
              />
              <button type="button" onClick={() => {
                const items = benefitItems.filter((_, idx) => idx !== i)
                update('benefits', { ...benefits, items })
              }} className="p-2 text-red-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => update('benefits', { ...benefits, items: [...benefitItems, { icon: 'check', text: 'Novo benefício' }] })}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800">
            <Plus size={14} /> Adicionar benefício
          </button>
        </div>
      ))}

      {sectionCard('about', <School size={18} />, 'Sobre a Plataforma', (
        <div className="space-y-4">
          <div>
            <label className="label">Título</label>
            <input value={String(about.title || '')} onChange={e => update('about', { ...about, title: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Texto</label>
            <textarea value={String(about.text || '')} onChange={e => update('about', { ...about, text: e.target.value })} className="input" rows={4} />
          </div>
          <ImageUpload value={String(about.image || '')} onChange={v => update('about', { ...about, image: v })} label="Imagem" />
          <div>
            <label className="label">Estatísticas</label>
            <div className="space-y-2">
              {stats.map((s, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input value={s.value} onChange={e => {
                    const ss = [...stats]; ss[i] = { ...ss[i], value: e.target.value }
                    update('about', { ...about, stats: ss })
                  }} className="input w-28" placeholder="5.000+" />
                  <input value={s.label} onChange={e => {
                    const ss = [...stats]; ss[i] = { ...ss[i], label: e.target.value }
                    update('about', { ...about, stats: ss })
                  }} className="input flex-1" placeholder="Alunos formados" />
                  <button type="button" onClick={() => update('about', { ...about, stats: stats.filter((_, idx) => idx !== i) })}
                          className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => update('about', { ...about, stats: [...stats, { value: '', label: '' }] })}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800">
                <Plus size={14} /> Adicionar estatística
              </button>
            </div>
          </div>
        </div>
      ))}

      {sectionCard('sobre_nos', <Building2 size={18} />, 'Sobre Nós', (
        <div className="space-y-4">
          <div>
            <label className="label">Título da página</label>
            <input value={String(sobreNos.title || '')} onChange={e => update('sobre_nos', { ...sobreNos, title: e.target.value })} className="input" placeholder="Sobre a Academy Pop" />
          </div>
          <div>
            <label className="label">Missão</label>
            <textarea value={String(sobreNos.mission || '')} onChange={e => update('sobre_nos', { ...sobreNos, mission: e.target.value })} className="input" rows={3} placeholder="Nossa missão é..." />
          </div>
          <div>
            <label className="label">Visão</label>
            <textarea value={String(sobreNos.vision || '')} onChange={e => update('sobre_nos', { ...sobreNos, vision: e.target.value })} className="input" rows={2} placeholder="Nossa visão é..." />
          </div>
          <div>
            <label className="label">Valores (um por linha)</label>
            <textarea
              value={sobreValues.join('\n')}
              onChange={e => update('sobre_nos', { ...sobreNos, values: e.target.value.split('\n').filter(Boolean) })}
              className="input" rows={5} placeholder={'Excelência no ensino\nInovação\nRespeito ao aluno'} />
          </div>
          <div>
            <label className="label">História / Texto livre</label>
            <textarea value={String(sobreNos.history || '')} onChange={e => update('sobre_nos', { ...sobreNos, history: e.target.value })} className="input" rows={5} placeholder="A Academy Pop nasceu em..." />
          </div>
          <ImageUpload value={String(sobreNos.image || '')} onChange={v => update('sobre_nos', { ...sobreNos, image: v })} label="Foto / Imagem principal" />
        </div>
      ))}

      {sectionCard('faq_geral', <HelpCircle size={18} />, 'Perguntas Frequentes Gerais', (
        <div className="space-y-3">
          {faqItems.map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary-600">Pergunta {i + 1}</span>
                <button type="button" onClick={() => {
                  const items = faqItems.filter((_, idx) => idx !== i)
                  update('faq_geral', { ...faqGeral, items })
                }} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
              <input value={item.question} onChange={e => {
                const items = [...faqItems]; items[i] = { ...items[i], question: e.target.value }
                update('faq_geral', { ...faqGeral, items })
              }} className="input" placeholder="Pergunta..." />
              <textarea value={item.answer} onChange={e => {
                const items = [...faqItems]; items[i] = { ...items[i], answer: e.target.value }
                update('faq_geral', { ...faqGeral, items })
              }} className="input" rows={2} placeholder="Resposta..." />
            </div>
          ))}
          <button type="button" onClick={() => update('faq_geral', { ...faqGeral, items: [...faqItems, { question: '', answer: '' }] })}
                  className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800">
            <Plus size={14} /> Adicionar pergunta
          </button>
        </div>
      ))}

      {sectionCard('footer', <Link2 size={18} />, 'Rodapé e Contato', (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Nome da Empresa</label>
            <input value={String(footer.company_name || '')} onChange={e => update('footer', { ...footer, company_name: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">WhatsApp (com DDI, ex: 5511999999999)</label>
            <input value={String(footer.whatsapp || '')} onChange={e => update('footer', { ...footer, whatsapp: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">E-mail de contato</label>
            <input value={String(footer.email || '')} onChange={e => update('footer', { ...footer, email: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Endereço (opcional)</label>
            <input value={String(footer.address || '')} onChange={e => update('footer', { ...footer, address: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input value={String(footer.instagram || '')} onChange={e => update('footer', { ...footer, instagram: e.target.value })} className="input" placeholder="https://instagram.com/..." />
          </div>
          <div>
            <label className="label">Facebook</label>
            <input value={String(footer.facebook || '')} onChange={e => update('footer', { ...footer, facebook: e.target.value })} className="input" placeholder="https://facebook.com/..." />
          </div>
          <div>
            <label className="label">YouTube</label>
            <input value={String(footer.youtube || '')} onChange={e => update('footer', { ...footer, youtube: e.target.value })} className="input" placeholder="https://youtube.com/@..." />
          </div>
          <div className="md:col-span-2">
            <label className="label">Descrição</label>
            <textarea value={String(footer.description || '')} onChange={e => update('footer', { ...footer, description: e.target.value })} className="input" rows={2} />
          </div>
        </div>
      ))}
    </div>
  )
}
