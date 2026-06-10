'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, ArrowLeft, Calculator } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/admin/ImageUpload'
import RichTextEditor from '@/components/admin/RichTextEditor'
import CurriculumEditor, { type CurriculumModule } from '@/components/admin/CurriculumEditor'
import api from '@/lib/api'
import type { Course, Professor } from '@/types'

interface Props {
  initialData?: Partial<Course>
  onSubmit: (data: unknown) => Promise<void>
}

const CATEGORIES = ['EJA', 'Pós-Graduação', 'Graduação', 'Tecnólogo', 'Superior', 'Técnico', 'Livre', 'Compliance']
const MODALITIES = ['EAD', 'Semi-presencial', 'Presencial']

export default function CourseForm({ initialData, onSubmit }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [professors, setProfessors] = useState<Professor[]>([])

  const [form, setForm] = useState({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    description: initialData?.description || '',
    cover_image: initialData?.cover_image || '',
    workload: initialData?.workload || '',
    modality: initialData?.modality || 'EAD',
    duration: initialData?.duration || '',
    category: initialData?.category || 'EJA',
    price_pix: initialData?.price_pix || '',
    price_installment: initialData?.price_installment || '',
    installments: initialData?.installments || 12,
    installment_value: initialData?.installment_value || '',
    active: initialData?.active ?? true,
    featured: initialData?.featured ?? false,
    vacancy_count: initialData?.vacancy_count || '',
    offer_expires_at: initialData?.offer_expires_at ? initialData.offer_expires_at.slice(0, 16) : '',
    whatsapp_message: initialData?.whatsapp_message || '',
    seo_title: initialData?.seo_title || '',
    seo_description: initialData?.seo_description || '',
    selected_professors: (initialData?.professors || []).map(p => p.id),
    modules: ((initialData?.modules || []).map(m => ({
      name: m.name,
      workload: m.workload || 0,
      order_index: m.order_index || 0,
      disciplines: (m.disciplines || []).map(d =>
        typeof d === 'string' ? { name: d, order_index: 0 } : { name: d.name, order_index: (d as { order_index?: number }).order_index || 0 }
      ),
    }))) as CurriculumModule[],
  })

  useEffect(() => {
    api.get('/professors/all').then(r => setProfessors(r.data)).catch(() => {})
  }, [])

  const calcInstallment = () => {
    const total = parseFloat(String(form.price_installment || form.price_pix))
    const inst = parseInt(String(form.installments))
    if (total && inst) {
      setForm(f => ({ ...f, installment_value: (total / inst).toFixed(2) }))
    }
  }

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Título obrigatório'); return }
    setSaving(true)
    try {
      await onSubmit({
        ...form,
        professors: form.selected_professors,
        modules: form.modules,
      })
    } catch {
      toast.error('Erro ao salvar curso')
    } finally {
      setSaving(false)
    }
  }

  const toggleProfessor = (id: number) => {
    const sel = form.selected_professors
    set('selected_professors', sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/cursos" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1" />
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Save size={18} /> Salvar Curso</>}
        </button>
      </div>

      {/* Informações Básicas */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Informações Básicas</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Título do Curso *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} className="input" placeholder="Ex: Pós-Graduação em Compliance" />
          </div>
          <div>
            <label className="label">Subtítulo</label>
            <input value={form.subtitle} onChange={e => set('subtitle', e.target.value)} className="input" placeholder="Ex: Torne-se especialista em conformidade corporativa" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Categoria</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Modalidade</label>
              <select value={form.modality} onChange={e => set('modality', e.target.value)} className="input">
                {MODALITIES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Carga Horária (h)</label>
              <input type="number" value={form.workload} onChange={e => set('workload', e.target.value)} className="input" placeholder="560" />
            </div>
            <div>
              <label className="label">Duração</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)} className="input" placeholder="18 meses" />
            </div>
          </div>
          <div>
            <label className="label">Descrição (conteúdo da página)</label>
            <RichTextEditor value={form.description} onChange={v => set('description', v)} />
          </div>
          <ImageUpload value={form.cover_image} onChange={v => set('cover_image', v)} label="Imagem de Capa" />
        </div>
      </div>

      {/* Preços */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Preços e Pagamento</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Preço à Vista (PIX)</label>
            <input type="number" step="0.01" value={form.price_pix} onChange={e => set('price_pix', e.target.value)} className="input" placeholder="1350.00" />
          </div>
          <div>
            <label className="label">Preço Parcelado</label>
            <input type="number" step="0.01" value={form.price_installment} onChange={e => set('price_installment', e.target.value)} className="input" placeholder="1548.00" />
          </div>
          <div>
            <label className="label">Nº de Parcelas</label>
            <input type="number" value={form.installments} onChange={e => set('installments', e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Valor da Parcela</label>
            <div className="flex gap-2">
              <input type="number" step="0.01" value={form.installment_value} onChange={e => set('installment_value', e.target.value)} className="input" placeholder="Calculado" />
              <button type="button" onClick={calcInstallment} title="Calcular"
                      className="px-3 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
                <Calculator size={16} />
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Clique no botão calculadora para calcular automaticamente o valor da parcela.
        </p>
      </div>

      {/* Grade Curricular */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Grade Curricular</h2>
        <CurriculumEditor value={form.modules} onChange={v => set('modules', v)} />
      </div>

      {/* Professores */}
      {professors.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Professores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {professors.map(prof => {
              const selected = form.selected_professors.includes(prof.id)
              return (
                <label key={prof.id}
                       className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggleProfessor(prof.id)} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'}`}>
                    {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-800">{prof.name}</p>
                    {prof.specialties && prof.specialties.length > 0 && (
                      <p className="text-xs text-gray-400">{prof.specialties.slice(0, 2).join(', ')}</p>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      )}

      {/* Gatilhos de Escassez */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Gatilhos de Urgência (opcional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Vagas Restantes</label>
            <input type="number" value={form.vacancy_count} onChange={e => set('vacancy_count', e.target.value)} className="input" placeholder="Ex: 20" />
          </div>
          <div>
            <label className="label">Oferta Expira em</label>
            <input type="datetime-local" value={form.offer_expires_at} onChange={e => set('offer_expires_at', e.target.value)} className="input" />
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Mensagem WhatsApp personalizada</label>
          <textarea value={form.whatsapp_message} onChange={e => set('whatsapp_message', e.target.value)} className="input" rows={2}
                    placeholder="Olá! Tenho interesse no curso..." />
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">SEO</h2>
        <div className="space-y-4">
          <div>
            <label className="label">Título para SEO</label>
            <input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} className="input" placeholder="Deixe vazio para usar o título do curso" />
          </div>
          <div>
            <label className="label">Descrição para SEO</label>
            <textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)} className="input" rows={2} />
          </div>
        </div>
      </div>

      {/* Visibilidade */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Visibilidade</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
                 onClick={() => set('active', !form.active)}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {form.active ? 'Curso ativo (visível no site)' : 'Curso inativo (oculto)'}
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full transition-colors relative ${form.featured ? 'bg-accent-500' : 'bg-gray-300'}`}
                 onClick={() => set('featured', !form.featured)}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.featured ? 'translate-x-7' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {form.featured ? 'Curso em destaque' : 'Curso normal'}
            </span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pb-8">
        <button type="submit" disabled={saving} className="btn-primary text-base px-10 py-3">
          {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Save size={18} /> Salvar Curso</>}
        </button>
      </div>
    </form>
  )
}
