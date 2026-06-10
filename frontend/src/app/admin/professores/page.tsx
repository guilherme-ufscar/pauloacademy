'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import type { Professor } from '@/types'

export default function ProfessoresPage() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => api.get('/professors/all').then(r => setProfessors(r.data)).finally(() => setLoading(false))
  useEffect(load, [])

  const remove = async (id: number) => {
    if (!confirm('Deletar professor?')) return
    try {
      await api.delete(`/professors/${id}`)
      setProfessors(ps => ps.filter(p => p.id !== id))
      toast.success('Professor deletado')
    } catch { toast.error('Erro ao deletar') }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professores</h1>
          <p className="text-gray-500">{professors.length} professores cadastrados</p>
        </div>
        <Link href="/admin/professores/novo" className="btn-primary">
          <Plus size={18} /> Novo Professor
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-16"><Loader2 size={32} className="animate-spin text-primary-500" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professors.map(prof => (
            <div key={prof.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start gap-4">
                <div className="relative w-14 h-14 shrink-0">
                  {prof.photo ? (
                    <Image src={prof.photo} alt={prof.name} fill className="rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
                      {prof.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{prof.name}</h3>
                  {prof.bio && <p className="text-gray-500 text-sm mt-1 line-clamp-2">{prof.bio}</p>}
                  {prof.specialties?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prof.specialties.slice(0, 3).map(s => (
                        <span key={s} className="badge bg-primary-100 text-primary-700 text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link href={`/admin/professores/${prof.id}`}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                  <Edit size={14} /> Editar
                </Link>
                <button onClick={() => remove(prof.id)}
                        className="flex items-center justify-center gap-1 py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {professors.length === 0 && !loading && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              Nenhum professor cadastrado.{' '}
              <Link href="/admin/professores/novo" className="text-primary-600 hover:underline">Adicionar agora</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
