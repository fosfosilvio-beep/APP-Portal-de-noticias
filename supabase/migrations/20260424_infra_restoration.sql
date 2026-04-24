-- ============================================================
-- MIGRAÇÃO: Restauração de Infraestrutura Básica (Home/Live)
-- Data: 2026-04-24
-- Objetivo: Criar tabelas fundamentais que estavam ausentes
-- ============================================================

-- 1. Tabela de Configurações do Portal
CREATE TABLE IF NOT EXISTS configuracao_portal (
  id BIGINT PRIMARY KEY DEFAULT 1,
  nome_plataforma TEXT DEFAULT 'Nossa Web TV',
  logo_url TEXT,
  ui_settings JSONB DEFAULT '{}'::jsonb,
  modo_manutencao BOOLEAN DEFAULT FALSE,
  alerta_urgente_ativo BOOLEAN DEFAULT FALSE,
  alerta_urgente_texto TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Status da Live
CREATE TABLE IF NOT EXISTS portal_live_status (
  id BIGINT PRIMARY KEY DEFAULT 1,
  is_live BOOLEAN DEFAULT FALSE,
  url_youtube TEXT,
  url_facebook TEXT,
  titulo TEXT,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Layout do Puck
CREATE TABLE IF NOT EXISTS page_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  draft_data JSONB DEFAULT '{}'::jsonb,
  published_data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Biblioteca de Lives
CREATE TABLE IF NOT EXISTS biblioteca_lives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  url_video TEXT NOT NULL,
  thumbnail TEXT,
  data_live DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Habilitar RLS
ALTER TABLE configuracao_portal ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_live_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_layout ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_lives ENABLE ROW LEVEL SECURITY;

-- 6. Políticas de Leitura Pública
DROP POLICY IF EXISTS "Leitura pública configuracao_portal" ON configuracao_portal;
CREATE POLICY "Leitura pública configuracao_portal" ON configuracao_portal FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública portal_live_status" ON portal_live_status;
CREATE POLICY "Leitura pública portal_live_status" ON portal_live_status FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública page_layout" ON page_layout;
CREATE POLICY "Leitura pública page_layout" ON page_layout FOR SELECT USING (true);

DROP POLICY IF EXISTS "Leitura pública biblioteca_lives" ON biblioteca_lives;
CREATE POLICY "Leitura pública biblioteca_lives" ON biblioteca_lives FOR SELECT USING (true);

-- 7. Inserir sementes iniciais
INSERT INTO configuracao_portal (id, nome_plataforma) 
VALUES (1, 'Nossa Web TV') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO portal_live_status (id, is_live) 
VALUES (1, false) 
ON CONFLICT (id) DO NOTHING;
