'use client'
import { useState } from 'react'
import { Save, Loader2, ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/admin/ImageUpload'
import type { Professor } from '@/types'

interface Props {
  initialData?: Partial<Professor>
  onSubmit: (data: unknown) => Promise<void>
}

export default function ProfessorForm({ initialData, onSubmit }: Props) {
  const [saving, setSaving] = useState(false)
  const [newSpecialty, setNewSpecialty] = useState('')
  const ROLES_BY_TEAM: Record<string, string[]> = {
    docente: ['Professor', 'Coordenador do Curso', 'Coordenador de Polo', 'Supervisor Acadêmico', 'Orientador', 'Tutor'],
    comercial: ['Vendedor', 'Consultor Comercial', 'Suporte Técnico'],
  }

  const [form, setForm] = useState({
    name: initialData?.name || '',
    bio: initialData?.bio || '',
    photo: initialData?.photo || '',
    linkedin: initialData?.linkedin || '',
    active: initialData?.active ?? true,
    team_type: (initialData as { team_type?: string })?.team_type || 'docente',
    role: (initialData as { role?: string })?.role || 'Professor',
    specialties: initialData?.specialties || [] as string[],
  })

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const setTeamType = (t: string) => {
    setForm(f => ({ ...f, team_type: t, role: ROLES_BY_TEAM[t][0] }))
  }

  const addSpecialty = () => {
    if (!newSpecialty.trim()) return
    if (!form.specialties.includes(newSpecialty.trim())) {
      set('specialties', [...form.specialties, newSpecialty.trim()])
    }
    setNewSpecialty('')
  }

  const removeSpecialty = (s: string) => set('specialties', form.specialties.filter(x => x !== s))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Nome obrigatório'); return }
    setSaving(true)
    try {
      await onSubmit(form)
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/professores" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1" />
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Save size={18} /> Salvar</>}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <ImageUpload value={form.photo} onChange={v => set('photo', v)} label="Foto do Professor (quadrado)" />
        <div>
          <label className="label">Nome Completo *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="Prof. Dr. Nome Sobrenome" />
        </div>
        <div>
          <label className="label">Corpo</label>
          <select value={form.team_type} onChange={e => setTeamType(e.target.value)} className="input">
            <option value="docente">Corpo Docente</option>
            <option value="comercial">Corpo Administrativo Comercial</option>
          </select>
        </div>
        <div>
          <label className="label">Função / Cargo</label>
          <select value={form.role} onChange={e => set('role', e.target.value)} className="input">
            {ROLES_BY_TEAM[form.team_type].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Mini Bio (até 600 caracteres)</label>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value)} className="input" rows={3} maxLength={600}
                    placeholder="Especialista em..." />
          <p className="text-xs text-gray-400 mt-1">{form.bio.length}/600</p>
        </div>
        <div>
          <label className="label">LinkedIn (opcional)</label>
          <input value={form.linkedin} onChange={e => set('linkedin', e.target.value)} className="input" placeholder="https://linkedin.com/in/..." />
        </div>
        <div>
          <label className="label">Especialidades</label>
          <div className="flex gap-2 mb-2">
            <input
              value={newSpecialty}
              onChange={e => setNewSpecialty(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
              className="input"
              placeholder="Ex: Compliance"
            />
            <button type="button" onClick={addSpecialty} className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          {form.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.specialties.map(s => (
                <span key={s} className="inline-flex items-center gap-1 badge bg-primary-100 text-primary-700">
                  {s}
                  <button type="button" onClick={() => removeSpecialty(s)} className="hover:text-red-500">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`w-12 h-6 rounded-full transition-colors relative ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}
               onClick={() => set('active', !form.active)}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">{form.active ? 'Professor ativo' : 'Inativo'}</span>
        </label>
      </div>
    </form>
  )
}
