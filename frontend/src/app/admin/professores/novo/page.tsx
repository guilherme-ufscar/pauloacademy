'use client'
import { useRouter } from 'next/navigation'
import ProfessorForm from '../_components/ProfessorForm'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function NovoProfessorPage() {
  const router = useRouter()
  const handleSubmit = async (data: unknown) => {
    await api.post('/professors', data)
    toast.success('Professor criado!')
    router.push('/admin/professores')
  }
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Professor</h1>
      <p className="text-gray-500 mb-8">Adicione um novo docente à plataforma</p>
      <ProfessorForm onSubmit={handleSubmit} />
    </div>
  )
}
