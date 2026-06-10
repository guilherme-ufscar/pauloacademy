'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Users, ShoppingBag, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import type { DashboardStats } from '@/types'

const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  paid: { label: 'Pago', cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
  pending: { label: 'Pendente', cls: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
  failed: { label: 'Falhou', cls: 'bg-red-100 text-red-700', icon: <AlertCircle size={12} /> },
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Cursos Ativos', value: stats?.courses || 0, icon: BookOpen, color: 'bg-blue-500', link: '/admin/cursos' },
    { label: 'Professores', value: stats?.professors || 0, icon: Users, color: 'bg-indigo-500', link: '/admin/professores' },
    { label: 'Total de Pedidos', value: stats?.orders.total || 0, icon: ShoppingBag, color: 'bg-orange-500', link: '/admin/pedidos' },
    {
      label: 'Receita Total', value: (stats?.revenue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      icon: DollarSign, color: 'bg-green-500', link: '/admin/pedidos'
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral da sua plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(c => (
          <Link key={c.label} href={c.link} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-500">{c.label}</p>
              <div className={`${c.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                <c.icon size={20} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{c.value}</p>
          </Link>
        ))}
      </div>

      {/* Pedidos por status */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Pedidos Pagos', value: stats.orders.paid || 0, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Pedidos Pendentes', value: stats.orders.pending || 0, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Taxa de Conversão', value: stats.orders.total > 0 ? `${Math.round(((stats.orders.paid || 0) / stats.orders.total) * 100)}%` : '0%', color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-6 flex items-center gap-4`}>
              <TrendingUp size={32} className={s.color} />
              <div>
                <p className="text-sm text-gray-600">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pedidos recentes */}
      {stats?.recent_orders && stats.recent_orders.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="text-sm text-primary-600 hover:text-primary-800">Ver todos</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Cliente', 'Curso', 'Valor', 'Status', 'Data'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recent_orders.map(order => {
                  const s = STATUS_MAP[order.status] || STATUS_MAP.pending
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-gray-400 text-xs">{order.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 truncate max-w-[200px]">{order.course_title}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {Number(order.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 ${s.cls} badge`}>
                          {s.icon} {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
