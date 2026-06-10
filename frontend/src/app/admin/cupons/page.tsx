'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Edit, Loader2, Tag, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Coupon, Course } from '@/types'

interface FormState {
  course_id: string
  code: string
  discount_percent: string
  expires_at: string
  max_uses: string
  active: boolean
}

const empty: FormState = { course_id: '', code: '', discount_percent: '', expires_at: '', max_uses: '', active: true }

export default function CuponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const load = () => Promise.all([
    api.get('/coupons').then(r => setCoupons(r.data)),
    api.get('/courses/all').then(r => setCourses(r.data)),
  ]).finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const set = (k: keyof FormState, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim() || !form.discount_percent) { toast.error('Código e desconto obrigatórios'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        course_id: form.course_id || null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
        discount_percent: parseFloat(form.discount_percent),
      }
      if (editing !== null) {
        await api.put(`/coupons/${editing}`, payload)
        toast.success('Cupom atualizado!')
      } else {
        await api.post('/coupons', payload)
        toast.success('Cupom criado!')
      }
      setForm(empty); setEditing(null); setShowForm(false)
      load()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Erro ao salvar'
      toast.error(msg)
    } finally { setSaving(false) }
  }

  const handleEdit = (coupon: Coupon) => {
    setForm({
      course_id: String(coupon.course_id || ''),
      code: coupon.code,
      discount_percent: String(coupon.discount_percent),
      expires_at: coupon.expires_at ? coupon.expires_at.slice(0, 16) : '',
      max_uses: coupon.max_uses ? String(coupon.max_uses) : '',
      active: coupon.active,
    })
    setEditing(coupon.id)
    setShowForm(true)
  }

  const remove = async (id: number) => {
    if (!confirm('Deletar cupom?')) return
    await api.delete(`/coupons/${id}`)
    setCoupons(cs => cs.filter(c => c.id !== id))
    toast.success('Cupom deletado')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupons de Desconto</h1>
          <p className="text-gray-500">{coupons.length} cupons cadastrados</p>
        </div>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(!showForm) }} className="btn-primary">
          <Plus size={18} /> Novo Cupom
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{editing !== null ? 'Editar Cupom' : 'Novo Cupom'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Código *</label>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} className="input font-mono" placeholder="EJA10" />
            </div>
            <div>
              <label className="label">Desconto (%) *</label>
              <input type="number" step="0.01" min="0" max="100" value={form.discount_percent} onChange={e => set('discount_percent', e.target.value)} className="input" placeholder="10" />
            </div>
            <div>
              <label className="label">Curso (deixe vazio para todos)</label>
              <select value={form.course_id} onChange={e => set('course_id', e.target.value)} className="input">
                <option value="">Todos os cursos</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Expira em</label>
              <input type="datetime-local" value={form.expires_at} onChange={e => set('expires_at', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Máximo de usos</label>
              <input type="number" value={form.max_uses} onChange={e => set('max_uses', e.target.value)} className="input" placeholder="Ilimitado" />
            </div>
            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 cursor-pointer mb-1">
                <div className={`w-10 h-5 rounded-full relative transition-colors ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
                     onClick={() => set('active', !form.active)}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-700">Ativo</span>
              </label>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Salvar</>}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setForm(empty) }} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {coupons.length === 0 ? (
            <div className="text-center p-16 text-gray-400">
              <Tag size={48} className="mx-auto mb-3 opacity-40" />
              <p>Nenhum cupom criado. Crie seu primeiro cupom!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Código', 'Desconto', 'Curso', 'Usos', 'Expira', 'Status', 'Ações'].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {coupons.map(coupon => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">{coupon.code}</span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-700">{coupon.discount_percent}%</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{coupon.course_title || 'Todos os cursos'}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {coupon.used_count}/{coupon.max_uses ?? '∞'}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${coupon.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(coupon)} className="p-1.5 text-gray-400 hover:text-blue-600">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => remove(coupon.id)} className="p-1.5 text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
