'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import CourseForm from '../_components/CourseForm'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import type { Course } from '@/types'

export default function EditCursoPage() {
  const router = useRouter()
  const params = useParams()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/courses/${params.id}`)
      .then(r => setCourse(r.data))
      .catch(() => router.push('/admin/cursos'))
      .finally(() => setLoading(false))
  }, [params.id, router])

  const handleSubmit = async (data: unknown) => {
    await api.put(`/courses/${params.id}`, data)
    toast.success('Curso atualizado!')
    router.push('/admin/cursos')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Editar Curso</h1>
      <p className="text-gray-500 mb-8">{course?.title}</p>
      <CourseForm initialData={course || undefined} onSubmit={handleSubmit} />
    </div>
  )
}
