const router = require('express').Router()
const { pool } = require('../db')
const { requireAuth } = require('../middleware/auth')

const selectFields = `p.*, p.role,
  COALESCE(json_agg(ps.name) FILTER (WHERE ps.id IS NOT NULL), '[]') AS specialties`

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${selectFields} FROM professors p
       LEFT JOIN professor_specialties ps ON ps.professor_id = p.id
       WHERE p.active = true GROUP BY p.id ORDER BY p.name`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar professores' })
  }
})

router.get('/all', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${selectFields} FROM professors p
       LEFT JOIN professor_specialties ps ON ps.professor_id = p.id
       GROUP BY p.id ORDER BY p.name`
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar professores' })
  }
})

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${selectFields} FROM professors p
       LEFT JOIN professor_specialties ps ON ps.professor_id = p.id
       WHERE p.id = $1 GROUP BY p.id`,
      [req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Professor não encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar professor' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, bio, photo, linkedin, active, role, team_type, specialties } = req.body
    const { rows } = await pool.query(
      'INSERT INTO professors (name, bio, photo, linkedin, active, role, team_type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, bio, photo, linkedin, active ?? true, role || 'Professor', team_type || 'docente']
    )
    const prof = rows[0]
    if (specialties?.length) {
      for (const s of specialties) {
        await pool.query('INSERT INTO professor_specialties (professor_id, name) VALUES ($1, $2)', [prof.id, s])
      }
    }
    res.status(201).json(prof)
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar professor' })
  }
})

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, bio, photo, linkedin, active, role, team_type, specialties } = req.body
    const { rows } = await pool.query(
      'UPDATE professors SET name=$1, bio=$2, photo=$3, linkedin=$4, active=$5, role=$6, team_type=$7 WHERE id=$8 RETURNING *',
      [name, bio, photo, linkedin, active, role || 'Professor', team_type || 'docente', req.params.id]
    )
    if (!rows.length) return res.status(404).json({ error: 'Professor não encontrado' })

    await pool.query('DELETE FROM professor_specialties WHERE professor_id = $1', [req.params.id])
    if (specialties?.length) {
      for (const s of specialties) {
        await pool.query('INSERT INTO professor_specialties (professor_id, name) VALUES ($1, $2)', [req.params.id, s])
      }
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar professor' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM professors WHERE id = $1 RETURNING id', [req.params.id])
    if (!rows.length) return res.status(404).json({ error: 'Professor não encontrado' })
    res.json({ message: 'Professor deletado' })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar professor' })
  }
})

module.exports = router
