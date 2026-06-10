const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' })
  }

  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    if (!rows.length) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const user = rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/me', async (req, res) => {
  const header = req.headers.authorization
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    res.json({ user: { id: payload.id, email: payload.email, name: payload.name } })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

router.post('/change-password', async (req, res) => {
  const header = req.headers.authorization
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const { current_password, new_password } = req.body

    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [payload.id])
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' })

    const valid = await bcrypt.compare(current_password, rows[0].password_hash)
    if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' })

    const hash = await bcrypt.hash(new_password, 10)
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, payload.id])

    res.json({ message: 'Senha alterada com sucesso' })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

module.exports = router
