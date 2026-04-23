-- ============================================================================
-- RUN ALL MIGRATIONS v10-v15
-- Este arquivo consolida todas as migrations em um único query
-- Execute no Supabase Dashboard → SQL Editor → New query
-- ============================================================================

-- Desabilitar feedback para acelerar execução
\set QUIET on

-- ============================================================================
-- v10: Phase 2B Tables (Admin modules base)
-- ============================================================================

-- Tabela news_statuses para workflow
CREATE TABLE IF NOT EXISTS news_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#gray',
  order INT DEFAULT 0
);

-- Seed statuses
INSERT INTO news_statuses (name, label, color, order) VALUES
  ('draft', 'Rascunho', '#yellow', 0),
  ('in_review', 'Em Revisão', '#blue', 1),
  ('scheduled', 'Agendado', '#purple', 2),
  ('published', 'Publicado', '#green', 3),
  ('archived', 'Arquivado', '#gray', 4)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- v11: Phase 3 Ads (Ad Manager tables)
-- ============================================================================

-- Atualizar ad_slots com campos novos
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS width INT;
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS height INT;
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS is_sponsored_content BOOLEAN DEFAULT false;
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS advertiser_name TEXT;
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS click_url TEXT;
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS sanitized BOOLEAN DEFAULT false;

-- ============================================================================
-- v12: Phase 4 Analytics (Ad tracking tables)
-- ============================================================================

-- Tabela ad_impressions
CREATE TABLE IF NOT EXISTS ad_impressions (
  id BIGSERIAL PRIMARY KEY,
  slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT,
  session_hash TEXT,
  viewport_w INT,
  viewport_h INT
);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_slot_time ON ad_impressions(slot_id, viewed_at DESC);

-- Tabela ad_clicks
CREATE TABLE IF NOT EXISTS ad_clicks (
  id BIGSERIAL PRIMARY KEY,
  slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  session_hash TEXT,
  referrer TEXT
);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_slot_time ON ad_clicks(slot_id, clicked_at DESC);

-- ============================================================================
-- v13: Phase 5 Puck (Page Builder tables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS page_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  draft_data JSONB,
  published_data JSONB,
  settings JSONB,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_layout_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_layout_id UUID REFERENCES page_layout(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  note TEXT,
  diff_summary JSONB
);

CREATE TABLE IF NOT EXISTS page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  thumbnail_url TEXT,
  data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_layout_id UUID REFERENCES page_layout(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  resolved_at TIMESTAMPTZ,
  parent_id UUID REFERENCES page_comments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_page_layout_slug ON page_layout(slug);
CREATE INDEX IF NOT EXISTS idx_page_layout_versions_page ON page_layout_versions(page_layout_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_comments_page ON page_comments(page_layout_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_comments_block ON page_comments(block_id);

-- Seed home layout
INSERT INTO page_layout (slug, title, published_data, created_at)
VALUES ('home', 'Home — Nossa Web TV', '{"blocks": []}', now())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- v14: Phase 6 Governance (Auth + Roles)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'autor', 'revisor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_actions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_user_time ON admin_actions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_entity ON admin_actions(entity_type, entity_id);

-- Adicionar colunas em noticias para workflow
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
  CHECK (status IN ('draft', 'in_review', 'scheduled', 'published', 'archived'));
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ;
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- ============================================================================
-- v15: Consolidação final (Categorias + News Drafts + Flags)
-- ============================================================================

-- 1. Tabela categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#00AEE0',
  ordem INT DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categorias (slug, nome, ordem) VALUES
  ('geral', 'Geral', 0),
  ('arapongas', 'Arapongas', 1),
  ('esportes', 'Esportes', 2),
  ('policia', 'Polícia', 3),
  ('politica', 'Política', 4),
  ('entretenimento', 'Entretenimento', 5),
  ('educacao', 'Educação', 6),
  ('saude', 'Saúde', 7)
ON CONFLICT (slug) DO NOTHING;

-- 2. Tabela news_drafts
CREATE TABLE IF NOT EXISTS news_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_drafts_user_noticia
  ON news_drafts(user_id, noticia_id) WHERE noticia_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_drafts_user
  ON news_drafts(user_id, updated_at DESC);

-- RLS para news_drafts
ALTER TABLE news_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "news_drafts_own" ON news_drafts;
CREATE POLICY "news_drafts_own" ON news_drafts
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Coluna ordem em biblioteca_lives
ALTER TABLE biblioteca_lives ADD COLUMN IF NOT EXISTS ordem INT DEFAULT 0;
ALTER TABLE biblioteca_lives ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE biblioteca_lives ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'live';

-- 4. Coluna published_at em page_layout
ALTER TABLE page_layout ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 5. RLS em categorias
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "categorias_read_all" ON categorias;
DROP POLICY IF EXISTS "categorias_write_admin" ON categorias;
CREATE POLICY "categorias_read_all" ON categorias
  FOR SELECT USING (true);
CREATE POLICY "categorias_write_admin" ON categorias
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));

-- 6. RLS em tabelas principais
ALTER TABLE page_layout ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "page_layout_public_read" ON page_layout;
DROP POLICY IF EXISTS "page_layout_editor_full" ON page_layout;
CREATE POLICY "page_layout_public_read" ON page_layout
  FOR SELECT USING (published_data IS NOT NULL);
CREATE POLICY "page_layout_editor_full" ON page_layout
  FOR ALL TO authenticated
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  ));

ALTER TABLE page_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "page_comments_crud" ON page_comments;
CREATE POLICY "page_comments_crud" ON page_comments
  FOR ALL TO authenticated USING (true);

-- 7. Feature flags (seed)
UPDATE configuracao_portal
SET ui_settings = COALESCE(ui_settings, '{}'::jsonb) || '{"use_puck_home": false}'::jsonb
WHERE id = 1;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

-- Reabilitar feedback
\set QUIET off

-- Exibir resultado
SELECT
  'Migrations v10-v15 EXECUTADAS COM SUCESSO!' as status,
  NOW() as timestamp;

SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
