-- Usuários admin
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Cursos
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT,
  cover_image VARCHAR(500),
  workload INTEGER,
  modality VARCHAR(50) DEFAULT 'EAD',
  duration VARCHAR(100),
  category VARCHAR(100) DEFAULT 'Livre',
  price_pix DECIMAL(10,2) DEFAULT 0,
  price_installment DECIMAL(10,2) DEFAULT 0,
  installments INTEGER DEFAULT 12,
  installment_value DECIMAL(10,2) DEFAULT 0,
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  vacancy_count INTEGER,
  offer_expires_at TIMESTAMP,
  whatsapp_message TEXT,
  seo_title VARCHAR(500),
  seo_description VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Módulos do curso
CREATE TABLE IF NOT EXISTS course_modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  workload INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Disciplinas de cada módulo
CREATE TABLE IF NOT EXISTS course_disciplines (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES course_modules(id) ON DELETE CASCADE,
  name VARCHAR(500) NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- Professores
CREATE TABLE IF NOT EXISTS professors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio VARCHAR(600),
  photo VARCHAR(500),
  linkedin VARCHAR(500),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Especialidades dos professores
CREATE TABLE IF NOT EXISTS professor_specialties (
  id SERIAL PRIMARY KEY,
  professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL
);

-- Relação curso-professores
CREATE TABLE IF NOT EXISTS course_professors (
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  professor_id INTEGER REFERENCES professors(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, professor_id)
);

-- Cupons de desconto
CREATE TABLE IF NOT EXISTS coupons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  code VARCHAR(100) UNIQUE NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL,
  expires_at TIMESTAMP,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seções de conteúdo (CMS)
CREATE TABLE IF NOT EXISTS content_sections (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255),
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Depoimentos
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  content TEXT NOT NULL,
  photo VARCHAR(500),
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  coupon_id INTEGER REFERENCES coupons(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  payment_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seções extras por curso (descrições adicionais)
CREATE TABLE IF NOT EXISTS course_extra_sections (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  image VARCHAR(500),
  order_index INTEGER DEFAULT 0
);

-- FAQ por curso
CREATE TABLE IF NOT EXISTS course_faqs (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0
);

-- Migrações
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='price_original') THEN
    ALTER TABLE courses ADD COLUMN price_original DECIMAL(10,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='discount_percent') THEN
    ALTER TABLE courses ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='professors' AND column_name='role') THEN
    ALTER TABLE professors ADD COLUMN role VARCHAR(100) DEFAULT 'Professor';
  END IF;
END $$;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
