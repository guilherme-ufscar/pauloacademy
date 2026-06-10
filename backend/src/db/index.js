const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
  await pool.query(schema)
  console.log('Schema aplicado com sucesso')
  await seedAdmin()
  await seedContent()
  await seedSampleData()
}

async function seedAdmin() {
  const { rows } = await pool.query('SELECT id FROM users WHERE email = $1', [process.env.ADMIN_EMAIL])
  if (rows.length > 0) return

  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
  await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)',
    [process.env.ADMIN_EMAIL, hash, process.env.ADMIN_NAME]
  )
  console.log(`Admin criado: ${process.env.ADMIN_EMAIL}`)
}

async function seedContent() {
  const sections = [
    {
      key: 'hero',
      title: 'Hero Principal',
      data: {
        headline: 'Transforme sua carreira com educação de qualidade',
        subheadline: 'Cursos EJA, Pós-Graduação e muito mais — 100% EAD, com certificado reconhecido.',
        cta_text: 'Ver Cursos',
        cta_url: '#cursos',
        background_image: '',
        badge_text: 'Mais de 5.000 alunos formados',
      }
    },
    {
      key: 'benefits',
      title: 'Barra de Benefícios',
      data: {
        items: [
          { icon: 'award', text: 'Certificado Reconhecido' },
          { icon: 'monitor', text: '100% Online' },
          { icon: 'clock', text: 'Estude no seu ritmo' },
          { icon: 'headphones', text: 'Suporte Dedicado' },
        ]
      }
    },
    {
      key: 'about',
      title: 'Sobre a Academia',
      data: {
        title: 'Por que escolher a Academy Pop?',
        text: 'Somos especializados em EJA e Compliance, com cursos desenvolvidos por profissionais experientes do mercado. Nossa metodologia é focada na aplicação prática e na sua empregabilidade.',
        image: '',
        stats: [
          { value: '5.000+', label: 'Alunos Formados' },
          { value: '15+', label: 'Cursos Disponíveis' },
          { value: '98%', label: 'Satisfação' },
          { value: '30 dias', label: 'Para emitir certificado' },
        ]
      }
    },
    {
      key: 'footer',
      title: 'Rodapé',
      data: {
        company_name: 'Academy Pop',
        description: 'Educação de qualidade para transformar vidas.',
        whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5511999999999',
        email: 'contato@academypop.com.br',
        address: '',
        instagram: '',
        facebook: '',
        youtube: '',
      }
    }
  ]

  for (const section of sections) {
    const { rows } = await pool.query('SELECT id FROM content_sections WHERE key = $1', [section.key])
    if (rows.length === 0) {
      await pool.query(
        'INSERT INTO content_sections (key, title, data) VALUES ($1, $2, $3)',
        [section.key, section.title, JSON.stringify(section.data)]
      )
    }
  }
  console.log('Conteúdo inicial criado')
}

async function seedSampleData() {
  const { rows } = await pool.query('SELECT id FROM courses LIMIT 1')
  if (rows.length > 0) return

  // Professor exemplo
  const profResult = await pool.query(
    `INSERT INTO professors (name, bio, photo, linkedin) VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      'Prof. Dr. Carlos Mendes',
      'Doutor em Educação pela USP, com 15 anos de experiência em EJA e políticas públicas de educação.',
      '',
      'https://linkedin.com'
    ]
  )
  const professorId = profResult.rows[0].id

  await pool.query(`INSERT INTO professor_specialties (professor_id, name) VALUES ($1, $2), ($1, $3)`,
    [professorId, 'EJA', 'Educação de Adultos'])

  // Curso EJA
  const ejaResult = await pool.query(
    `INSERT INTO courses (slug, title, subtitle, description, workload, modality, duration, category, price_pix, price_installment, installments, installment_value, active, featured, whatsapp_message)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
    [
      'curso-eja',
      'Curso EJA – Educação de Jovens e Adultos',
      'Conclua em 4 meses com certificado reconhecido',
      '<h2>Sobre o Curso</h2><p>O Curso EJA é voltado para jovens e adultos que desejam concluir o Ensino Fundamental ou Médio de forma rápida e certificada. Com metodologia adaptada ao perfil adulto, você estuda no seu ritmo, sem abrir mão da qualidade.</p><h2>Para quem é este curso?</h2><ul><li>Adultos que não concluíram os estudos na idade regular</li><li>Profissionais que precisam do diploma para progressão na carreira</li><li>Pessoas que buscam valorização pessoal e profissional</li></ul>',
      200, 'EAD', '4 meses', 'EJA',
      1350.00, 1350.00, 12, 112.50,
      true, true,
      'Olá! Tenho interesse no Curso EJA. Podem me passar mais informações?'
    ]
  )
  const ejaId = ejaResult.rows[0].id

  await pool.query('INSERT INTO course_professors (course_id, professor_id) VALUES ($1, $2)', [ejaId, professorId])

  const mod1 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [ejaId, 'Módulo 1 – Língua Portuguesa e Literatura', 50, 0]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5),($1,$6,$7)`,
    [mod1.rows[0].id, 'Interpretação de Texto', 0, 'Gramática Essencial', 1, 'Produção Textual', 2])

  const mod2 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [ejaId, 'Módulo 2 – Matemática Aplicada', 50, 1]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5),($1,$6,$7)`,
    [mod2.rows[0].id, 'Matemática Básica', 0, 'Geometria', 1, 'Estatística', 2])

  const mod3 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [ejaId, 'Módulo 3 – Ciências da Natureza', 50, 2]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5)`,
    [mod3.rows[0].id, 'Biologia Básica', 0, 'Química e Física', 1])

  const mod4 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [ejaId, 'Módulo 4 – Ciências Humanas', 50, 3]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5)`,
    [mod4.rows[0].id, 'História do Brasil', 0, 'Geografia e Atualidades', 1])

  // Cupom de exemplo para EJA
  await pool.query(
    `INSERT INTO coupons (course_id, code, discount_percent, max_uses, active) VALUES ($1, $2, $3, $4, $5)`,
    [ejaId, 'EJA10', 10.00, 100, true]
  )

  // Depoimento EJA
  await pool.query(
    `INSERT INTO testimonials (name, role, content, course_id, active, order_index) VALUES ($1,$2,$3,$4,$5,$6)`,
    ['Maria Silva', 'Auxiliar Administrativa', 'Depois de 20 anos sem estudar, consegui terminar meu ensino médio em apenas 4 meses! O material é excelente e o suporte foi incrível.', ejaId, true, 0]
  )

  // Professor Compliance
  const profComp = await pool.query(
    `INSERT INTO professors (name, bio, photo, linkedin) VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      'Dr. Ricardo Pinheiro',
      'Especialista em Compliance Corporativo, com passagem por grandes consultorias e órgãos reguladores.',
      '',
      'https://linkedin.com'
    ]
  )
  const profCompId = profComp.rows[0].id
  await pool.query(`INSERT INTO professor_specialties (professor_id, name) VALUES ($1,$2),($1,$3)`,
    [profCompId, 'Compliance', 'Direito Administrativo'])

  // Pós-Graduação Compliance
  const compResult = await pool.query(
    `INSERT INTO courses (slug, title, subtitle, description, workload, modality, duration, category, price_pix, price_installment, installments, installment_value, active, featured, whatsapp_message)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
    [
      'pos-graduacao-compliance',
      'Pós-Graduação em Compliance',
      'Torne-se especialista em conformidade e gestão de riscos corporativos',
      '<h2>Sobre o Curso</h2><p>A Pós-Graduação em Compliance é voltada para profissionais que desejam se especializar na área de conformidade corporativa, gestão de riscos e ética empresarial. Totalmente online com 560 horas e corpo docente especializado.</p><h2>Mercado em Alta</h2><p>O mercado de Compliance cresce 25% ao ano no Brasil, com alta demanda por profissionais qualificados.</p><h2>Para quem é?</h2><ul><li>Advogados e Contadores</li><li>Gestores e Diretores</li><li>Profissionais de RH e Financeiro</li><li>Servidores Públicos</li></ul>',
      560, 'EAD', '18 meses', 'Pós-Graduação',
      1548.00, 1548.00, 12, 129.00,
      true, true,
      'Olá! Tenho interesse na Pós-Graduação em Compliance. Podem me passar mais informações?'
    ]
  )
  const compId = compResult.rows[0].id

  await pool.query('INSERT INTO course_professors (course_id, professor_id) VALUES ($1, $2)', [compId, profCompId])

  const cm1 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [compId, 'Módulo 1 – Fundamentos do Compliance', 80, 0]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5),($1,$6,$7)`,
    [cm1.rows[0].id, 'Conceitos e Evolução do Compliance', 0, 'Framework Internacional (ISO 37001)', 1, 'Legislação Brasileira Anticorrupção', 2])

  const cm2 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [compId, 'Módulo 2 – Gestão de Riscos', 80, 1]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5)`,
    [cm2.rows[0].id, 'Identificação e Mapeamento de Riscos', 0, 'Controles Internos e Mitigação', 1])

  const cm3 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [compId, 'Módulo 3 – Due Diligence e KYC', 80, 2]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5)`,
    [cm3.rows[0].id, 'Know Your Customer (KYC)', 0, 'Due Diligence em Terceiros', 1])

  const cm4 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [compId, 'Módulo 4 – LGPD e Proteção de Dados', 80, 3]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5)`,
    [cm4.rows[0].id, 'Fundamentos da LGPD', 0, 'Implementação de Programas de Privacidade', 1])

  const cm5 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [compId, 'Módulo 5 – Canal de Denúncias e Investigação', 80, 4]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5)`,
    [cm5.rows[0].id, 'Estruturação do Canal de Denúncias', 0, 'Condução de Investigações Internas', 1])

  const cm6 = await pool.query(
    'INSERT INTO course_modules (course_id, name, workload, order_index) VALUES ($1, $2, $3, $4) RETURNING id',
    [compId, 'Módulo 6 – Prática e TCC', 160, 5]
  )
  await pool.query(`INSERT INTO course_disciplines (module_id, name, order_index) VALUES ($1,$2,$3),($1,$4,$5)`,
    [cm6.rows[0].id, 'Estudo de Casos Reais', 0, 'Trabalho de Conclusão de Curso', 1])

  await pool.query(
    `INSERT INTO testimonials (name, role, content, course_id, active, order_index) VALUES ($1,$2,$3,$4,$5,$6)`,
    ['João Oliveira', 'Gerente de Compliance', 'Excelente programa. Após a pós, fui promovido e triplicamos nossa estrutura de compliance na empresa.', compId, true, 0]
  )

  console.log('Dados de seed inseridos com sucesso')
}

module.exports = { pool, initDb }
