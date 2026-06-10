'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import ProfessorForm from '../_components/ProfessorForm'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Professor } from '@/types'

export default function EditProfessorPage() {
  const router = useRouter()
  const params = useParams()
  const [prof, setProf] = useState<Professor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/professors/${params.id}`).then(r => setProf(r.data)).finally(() => setLoading(false))
  }, [params.id])

  const handleSubmit = async (data: unknown) => {
    await api.put(`/professors/${params.id}`, data)
    toast.success('Professor atualizado!')
    router.push('/admin/professores')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 size={32} className="animate-spin text-primary-500" /></div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Professor</h1>
      <p className="text-gray-500 mb-8">{prof?.name}</p>
      <ProfessorForm initialData={prof || undefined} onSubmit={handleSubmit} />
    </div>
  )
}
