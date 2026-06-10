'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Course } from '@/types'

export default function CursosPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = () => {
    api.get('/courses/all').then(r => setCourses(r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const toggleActive = async (course: Course) => {
    try {
      await api.put(`/courses/${course.id}`, { ...course, active: !course.active })
      setCourses(cs => cs.map(c => c.id === course.id ? { ...c, active: !c.active } : c))
      toast.success(course.active ? 'Curso desativado' : 'Curso ativado')
    } catch { toast.error('Erro ao atualizar') }
  }

  const remove = async (id: number) => {
    if (!confirm('Deletar este curso? Esta ação não pode ser desfeita.')) return
    try {
      await api.delete(`/courses/${id}`)
      setCourses(cs => cs.filter(c => c.id !== id))
      toast.success('Curso deletado')
    } catch { toast.error('Erro ao deletar') }
  }

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cursos</h1>
          <p className="text-gray-500">{courses.length} cursos cadastrados</p>
        </div>
        <Link href="/admin/cursos/novo" className="btn-primary">
          <Plus size={18} /> Novo Curso
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9"
              placeholder="Buscar por título ou categoria..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 size={32} className="animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-16 text-gray-400">
            Nenhum curso encontrado.{' '}
            <Link href="/admin/cursos/novo" className="text-primary-600 hover:underline">Criar primeiro curso</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Curso', 'Categoria', 'Modalidade', 'Preço PIX', 'Status', 'Ações'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 max-w-[250px] truncate">{course.title}</p>
                      {course.subtitle && <p className="text-gray-400 text-xs truncate max-w-[250px]">{course.subtitle}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge bg-primary-100 text-primary-700">{course.category}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{course.modality}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {Number(course.price_pix || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${course.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {course.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleActive(course)} title={course.active ? 'Desativar' : 'Ativar'}
                                className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors">
                          {course.active ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <Link href={`/admin/cursos/${course.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                          <Edit size={16} />
                        </Link>
                        <button onClick={() => remove(course.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
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
    </div>
  )
}
