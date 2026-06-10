'use client'
import { useRouter } from 'next/navigation'
import CourseForm from '../_components/CourseForm'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function NovoCursoPage() {
  const router = useRouter()

  const handleSubmit = async (data: unknown) => {
    await api.post('/courses', data)
    toast.success('Curso criado com sucesso!')
    router.push('/admin/cursos')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Novo Curso</h1>
      <p className="text-gray-500 mb-8">Preencha os dados do novo curso</p>
      <CourseForm onSubmit={handleSubmit} />
    </div>
  )
}
