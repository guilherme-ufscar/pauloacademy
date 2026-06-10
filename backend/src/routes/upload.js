const router = require('express').Router()
const multer = require('multer')
const { requireAuth } = require('../middleware/auth')
const { uploadFile } = require('../lib/storage')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Apenas imagens são permitidas'))
  }
})

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    const url = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype)
    res.json({ url })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message || 'Erro ao fazer upload' })
  }
})

module.exports = router
