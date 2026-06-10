const router = require('express').Router()
const { pool } = require('../db')
const { requireAuth } = require('../middleware/auth')

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT cp.*, c.title AS course_title FROM coupons cp
       LEFT JOIN courses c ON c.id = cp.course_id
       ORDER BY cp.created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar cupons' })
  }
})

router.post('/validate', async (req, res) => {
  try {
    const { code, course_id } = req.body
    const { rows } = await pool.query(
      `SELECT * FROM coupons WHERE code = $1 AND active = true
       AND (course_id IS NULL OR course_id = $2)
       AND (expires_at IS NULL OR expires_at > NOW())
       AND (max_uses IS NULL OR used_count < max_uses)`,
      [code.toUpperCase(), course_id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Cupom inválido ou expirado' })
    const c = rows[0]
    res.json({ id: c.id, code: c.code, discount_percent: c.discount_percent })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao validar cupom' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { course_id, code, discount_percent, expires_at, max_uses, active } = req.body
    const { rows } = await pool.query(
      `INSERT INTO coupons (course_id, code, discount_percent, expires_at, max_uses, active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [course_id || null, code.toUpperCase(), discount_percent, expires_at || null, max_uses || null, active ?? true]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Código já existe' })
    res.status(500).json({ error: 'Erro ao criar cupom' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { course_id, code, discount_percent, expires_at, max_uses, active } = req.body
    const { rows } = await pool.query(
      `UPDATE coupons SET course_id=$1, code=$2, discount_percent=$3, expires_at=$4, max_uses=$5, active=$6
       WHERE id=$7 RETURNING *`,
      [course_id || null, code.toUpperCase(), discount_percent, expires_at || null, max_uses || null, active, req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Cupom não encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar cupom' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM coupons WHERE id = $1', [req.params.id])
    res.json({ message: 'Cupom deletado' })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar cupom' })
  }
})

module.exports = router
