-- DormíBien Database Schema

-- Leads captured from quiz
CREATE TABLE IF NOT EXISTS sleep_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT,
  genero TEXT NOT NULL CHECK (genero IN ('hombre', 'mujer')),
  tipo_insomnio TEXT NOT NULL CHECK (tipo_insomnio IN ('mente_acelerada', 'despertador', 'zombi', 'irregular')),
  severidad INTEGER NOT NULL CHECK (severidad >= 1 AND severidad <= 10),
  respuestas JSONB DEFAULT '{}',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users who purchased (created by Hotmart webhook)
CREATE TABLE IF NOT EXISTS sleep_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT,
  genero TEXT NOT NULL DEFAULT 'hombre' CHECK (genero IN ('hombre', 'mujer')),
  tipo_insomnio TEXT NOT NULL DEFAULT 'mente_acelerada' CHECK (tipo_insomnio IN ('mente_acelerada', 'despertador', 'zombi', 'irregular')),
  plan TEXT NOT NULL DEFAULT 'front' CHECK (plan IN ('front', 'upsell')),
  hotmart_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sleep diary entries
CREATE TABLE IF NOT EXISTS sleep_diary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL REFERENCES sleep_users(email) ON DELETE CASCADE,
  date DATE NOT NULL,
  hora_acostar TIME NOT NULL,
  hora_dormir TIME NOT NULL,
  despertares INTEGER NOT NULL DEFAULT 0 CHECK (despertares >= 0),
  calidad INTEGER NOT NULL CHECK (calidad >= 1 AND calidad <= 10),
  energia_dia INTEGER NOT NULL CHECK (energia_dia >= 1 AND energia_dia <= 10),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_email, date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sleep_leads_email ON sleep_leads(email);
CREATE INDEX IF NOT EXISTS idx_sleep_leads_created ON sleep_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sleep_users_email ON sleep_users(email);
CREATE INDEX IF NOT EXISTS idx_sleep_diary_user ON sleep_diary(user_email, date DESC);
