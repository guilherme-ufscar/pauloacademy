import Link from 'next/link'
import Image from 'next/image'
import { Clock, Monitor, Tag, ArrowRight } from 'lucide-react'
import type { Course } from '@/types'

export default function CourseCard({ course }: { course: Course }) {
  const installmentValue = Number(course.installment_value || 0)
  const pricePixVal = Number(course.price_pix || 0)

  return (
    <Link href={`/cursos/${course.slug}`} className="card group flex flex-col">
      <div className="relative h-48 bg-gradient-to-br from-primary-800 to-primary-900 overflow-hidden">
        {course.cover_image ? (
          <Image src={course.cover_image} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <div className="w-24 h-24 border-4 border-white rounded-full" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="badge bg-accent-500 text-white">{course.category}</span>
        </div>
        {course.featured && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-yellow-400 text-yellow-900">Destaque</span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-primary-900 text-lg leading-tight mb-2 group-hover:text-accent-600 transition-colors">
          {course.title}
        </h3>
        {course.subtitle && (
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.subtitle}</p>
        )}

        <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
          {course.workload && (
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-primary-600" />
              {course.workload}h
            </span>
          )}
          <span className="flex items-center gap-1">
            <Monitor size={13} className="text-primary-600" />
            {course.modality}
          </span>
          {course.duration && (
            <span className="flex items-center gap-1">
              <Tag size={13} className="text-primary-600" />
              {course.duration}
            </span>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-end justify-between mb-4">
            <div>
              {pricePixVal > 0 && (
                <>
                  <p className="text-xs text-gray-400">À vista no PIX</p>
                  <p className="text-2xl font-bold text-primary-900">
                    {pricePixVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  {installmentValue > 0 && (
                    <p className="text-xs text-gray-500">
                      ou {course.installments}x de {installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
          <span className="btn-primary w-full justify-center text-sm py-2.5">
            Ver Detalhes <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  )
}
