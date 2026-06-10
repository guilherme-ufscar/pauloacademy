'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { CreditCard, Tag, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import type { Course, Coupon } from '@/types'

const schema = z.object({
  customer_name: z.string().min(3, 'Nome obrigatório'),
  customer_email: z.string().email('E-mail inválido'),
  customer_phone: z.string().min(10, 'Telefone inválido'),
  payment_method: z.enum(['pix', 'credit_card']),
})

type FormData = z.infer<typeof schema>

export default function CheckoutPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'pix' },
  })
  const paymentMethod = watch('payment_method')

  useEffect(() => {
    api.get(`/courses/slug/${slug}`)
      .then(r => setCourse(r.data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false))
  }, [slug, router])

  const pricePix = Number(course?.price_pix || 0)
  const installmentValue = Number(course?.installment_value || 0)
  const discountAmount = coupon ? pricePix * (coupon.discount_percent / 100) : 0
  const finalPrice = pricePix - discountAmount

  const handleCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    try {
      const r = await api.post('/coupons/validate', { code: couponCode, course_id: course?.id })
      setCoupon(r.data)
      toast.success(`Cupom aplicado! ${r.data.discount_percent}% de desconto`)
    } catch {
      toast.error('Cupom inválido ou expirado')
      setCoupon(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      const r = await api.post('/orders', {
        course_id: course?.id,
        coupon_code: coupon?.code,
        ...data,
      })
      const { payment_url, whatsapp_fallback } = r.data

      if (payment_url) {
        window.location.href = payment_url
      } else {
        window.location.href = whatsapp_fallback
      }
    } catch {
      toast.error('Erro ao processar pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-primary-600" />
      </div>
    )
  }

  if (!course) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary-900 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href={`/cursos/${slug}`} className="text-blue-300 hover:text-white">
            <ArrowLeft size={20} />
          </Link>
          <span className="font-semibold">Checkout Seguro</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-xl font-bold text-primary-900 mb-6">Seus dados</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Nome completo *</label>
                  <input {...register('customer_name')} className="input" placeholder="Seu nome completo" />
                  {errors.customer_name && <p className="text-red-500 text-xs mt-1">{errors.customer_name.message}</p>}
                </div>
                <div>
                  <label className="label">E-mail *</label>
                  <input {...register('customer_email')} type="email" className="input" placeholder="seu@email.com" />
                  {errors.customer_email && <p className="text-red-500 text-xs mt-1">{errors.customer_email.message}</p>}
                </div>
                <div>
                  <label className="label">Telefone/WhatsApp *</label>
                  <input {...register('customer_phone')} className="input" placeholder="(11) 99999-9999" />
                  {errors.customer_phone && <p className="text-red-500 text-xs mt-1">{errors.customer_phone.message}</p>}
                </div>

                <div>
                  <label className="label">Forma de Pagamento *</label>
                  <div className="grid grid-cols-2 gap-3 mt-1">
                    {[
                      { value: 'pix', label: 'PIX (à vista)', desc: 'Melhor preço' },
                      { value: 'credit_card', label: 'Cartão de Crédito', desc: `${course.installments}x parcelado` },
                    ].map(opt => (
                      <label key={opt.value}
                             className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === opt.value ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" value={opt.value} {...register('payment_method')} className="hidden" />
                        <CreditCard size={20} className={paymentMethod === opt.value ? 'text-primary-600' : 'text-gray-400'} />
                        <div>
                          <p className="font-semibold text-sm text-gray-800">{opt.label}</p>
                          <p className="text-xs text-gray-500">{opt.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cupom */}
                <div>
                  <label className="label">Cupom de desconto</label>
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      className="input"
                      placeholder="CÓDIGO"
                      disabled={!!coupon}
                    />
                    {coupon ? (
                      <button type="button" onClick={() => { setCoupon(null); setCouponCode('') }}
                              className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium">
                        Remover
                      </button>
                    ) : (
                      <button type="button" onClick={handleCoupon} disabled={couponLoading}
                              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1">
                        {couponLoading ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                        Aplicar
                      </button>
                    )}
                  </div>
                  {coupon && (
                    <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                      <CheckCircle size={12} /> {coupon.discount_percent}% de desconto aplicado
                    </p>
                  )}
                </div>

                <button type="submit" disabled={submitting}
                        className="btn-primary w-full justify-center text-base py-4 mt-2">
                  {submitting ? (
                    <><Loader2 size={20} className="animate-spin" /> Processando...</>
                  ) : (
                    'Finalizar Matrícula'
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 mt-2">
                  Pagamento seguro. Seus dados estão protegidos.
                </p>
              </form>
            </div>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h3 className="font-bold text-primary-900 mb-4">Resumo do Pedido</h3>
              <p className="font-semibold text-gray-800 text-sm">{course.title}</p>
              {course.modality && <p className="text-gray-500 text-xs mt-1">{course.modality} · {course.duration}</p>}

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor do curso</span>
                  <span className="font-medium">{pricePix.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto ({coupon.discount_percent}%)</span>
                    <span>- {discountAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-primary-900">{finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                {paymentMethod === 'credit_card' && installmentValue > 0 && (
                  <p className="text-xs text-gray-500 text-right">
                    ou {course.installments}x de {installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2">
                {['Acesso imediato', 'Certificado incluso', 'Suporte por WhatsApp', 'Estude no ritmo'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle size={14} className="text-green-500" /> {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
