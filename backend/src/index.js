require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { initDb } = require('./db')

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/auth', require('./routes/auth'))
app.use('/courses', require('./routes/courses'))
app.use('/professors', require('./routes/professors'))
app.use('/content', require('./routes/content'))
app.use('/coupons', require('./routes/coupons'))
app.use('/orders', require('./routes/orders'))
app.use('/upload', require('./routes/upload'))
app.use('/dashboard', require('./routes/dashboard'))

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Erro interno do servidor' })
})

async function start() {
  let retries = 10
  while (retries > 0) {
    try {
      await initDb()
      console.log('Banco de dados inicializado')
      break
    } catch (err) {
      retries--
      console.error(`Erro ao conectar ao banco, tentando novamente... (${retries} tentativas restantes)`)
      console.error(err.message)
      await new Promise(r => setTimeout(r, 3000))
    }
  }
  if (retries === 0) {
    console.error('Não foi possível conectar ao banco de dados')
    process.exit(1)
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend rodando na porta ${PORT}`)
  })
}

start()
