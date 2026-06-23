const router = require('express').Router()
const { pool } = require('../db')
const { requireAuth } = require('../middleware/auth')

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, c.title AS course_title, cp.code AS coupon_code
       FROM orders o
       LEFT JOIN courses c ON c.id = o.course_id
       LEFT JOIN coupons cp ON cp.id = o.coupon_id
       ORDER BY o.created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { course_id, coupon_code, customer_name, customer_email, customer_phone, payment_method } = req.body

    const { rows: courseRows } = await pool.query('SELECT * FROM courses WHERE id = $1 AND active = true', [course_id])
    if (!courseRows.length) return res.status(404).json({ error: 'Curso não encontrado' })
    const course = courseRows[0]

    let amount = parseFloat(course.price_pix)
    let couponId = null

    if (coupon_code) {
      const { rows: couponRows } = await pool.query(
        `SELECT * FROM coupons WHERE code = $1 AND active = true
         AND (course_id IS NULL OR course_id = $2)
         AND (expires_at IS NULL OR expires_at > NOW())
         AND (max_uses IS NULL OR used_count < max_uses)`,
        [coupon_code.toUpperCase(), course_id]
      )
      if (couponRows.length) {
        const coupon = couponRows[0]
        couponId = coupon.id
        amount = amount * (1 - parseFloat(coupon.discount_percent) / 100)
        await pool.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = $1', [coupon.id])
      }
    }

    let paymentUrl = null
    let paymentId = null
    let pixQrCode = null
    let pixQrCodeBase64 = null
    let boletoUrl = null
    let boletoBarcode = null

    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
      try {
        const { MercadoPagoConfig, Payment } = require('mercadopago')
        const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN })
        const paymentApi = new Payment(mp)
        const nameParts = customer_name.trim().split(' ')
        const firstName = nameParts[0]
        const lastName = nameParts.slice(1).join(' ') || firstName

        if (payment_method === 'pix') {
          const result = await paymentApi.create({
            body: {
              transaction_amount: Math.round(amount * 100) / 100,
              payment_method_id: 'pix',
              payer: { email: customer_email, first_name: firstName, last_name: lastName },
              description: course.title,
            }
          })
          paymentId = String(result.id)
          pixQrCode = result.point_of_interaction?.transaction_data?.qr_code
          pixQrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64
        } else if (payment_method === 'boleto') {
          const cpf = req.body.customer_cpf?.replace(/\D/g, '') || ''
          const result = await paymentApi.create({
            body: {
              transaction_amount: Math.round(amount * 100) / 100,
              payment_method_id: 'bolbradesco',
              payer: {
                email: customer_email,
                first_name: firstName,
                last_name: lastName,
                identification: { type: 'CPF', number: cpf },
              },
              description: course.title,
            }
          })
          paymentId = String(result.id)
          boletoUrl = result.transaction_details?.external_resource_url
          boletoBarcode = result.barcode?.content
        } else {
          // cartão: usa Checkout Pro (redirect)
          const { Preference } = require('mercadopago')
          const preference = new Preference(mp)
          const result = await preference.create({
            body: {
              items: [{ title: course.title, quantity: 1, unit_price: Math.round(amount * 100) / 100 }],
              payer: { name: customer_name, email: customer_email },
              payment_methods: { excluded_payment_types: [{ id: 'ticket' }, { id: 'bank_transfer' }], installments: course.installments },
              back_urls: {
                success: `${process.env.APP_URL || ''}/checkout/sucesso`,
                failure: `${process.env.APP_URL || ''}/checkout/erro`,
              },
              auto_approve: false,
            }
          })
          paymentId = result.id
          paymentUrl = result.init_point
        }
      } catch (mpErr) {
        console.error('Erro Mercado Pago:', mpErr.message)
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (course_id, coupon_id, customer_name, customer_email, customer_phone, amount, payment_method, payment_id, payment_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [course_id, couponId, customer_name, customer_email, customer_phone, amount.toFixed(2), payment_method || 'pix', paymentId, paymentUrl, 'pending']
    )

    res.status(201).json({
      order: rows[0],
      payment_url: paymentUrl,
      pix_qr_code: pixQrCode,
      pix_qr_code_base64: pixQrCodeBase64,
      boleto_url: boletoUrl,
      boleto_barcode: boletoBarcode,
      whatsapp_fallback: buildWhatsApp(course, customer_name, amount),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar pedido' })
  }
})

// Webhook Mercado Pago
router.post('/webhook/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body
    if (type === 'payment' && data?.id) {
      await pool.query(
        `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE payment_id = $1`,
        [String(data.id)]
      )
    }
    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
})

router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Pedido não encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar pedido' })
  }
})

function buildWhatsApp(course, customerName, amount) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999'
  const msg = encodeURIComponent(
    `Olá! Meu nome é ${customerName} e gostaria de realizar minha matrícula no ${course.title}. Valor: R$ ${amount.toFixed(2).replace('.', ',')}`
  )
  return `https://wa.me/${number}?text=${msg}`
}

module.exports = router
