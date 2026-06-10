'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { GraduationCap, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { setToken, isAuthenticated } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>()

  useEffect(() => {
    if (isAuthenticated()) router.push('/admin')
  }, [router])

  const onSubmit = async (data: { email: string; password: string }) => {
    setLoading(true)
    try {
      const r = await api.post('/auth/login', data)
      const { token } = r.data
      setToken(token)
      document.cookie = `admin_token=${token}; path=/; max-age=${7 * 24 * 3600}; samesite=strict`
      toast.success('Bem-vindo!')
      router.push('/admin')
    } catch {
      toast.error('E-mail ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-950 to-primary-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white">Academy<span className="text-accent-400">Pop</span></h1>
          <p className="text-blue-300 mt-1">Painel Administrativo</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-primary-900 mb-6">Entrar no sistema</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input
                {...register('email', { required: 'Obrigatório' })}
                type="email"
                className="input"
                placeholder="admin@academypop.com.br"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Obrigatório' })}
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading}
                    className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Entrando...</> : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
