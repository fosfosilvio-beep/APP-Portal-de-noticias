-- ============================================================================
-- CREATE MISSING TABLES — Apenas tabelas que não existem no banco
-- Data: 2026-04-22
-- ============================================================================

-- 1. TABELA news_statuses (para workflow editorial)
CREATE TABLE IF NOT EXISTS news_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#gray',
  display_order INT DEFAULT 0
);

-- Seed statuses (se não existirem)
INSERT INTO news_statuses (name, label, color, display_order) VALUES
  ('draft', 'Rascunho', '#yellow', 0),
  ('in_review', 'Em Revisão', '#blue', 1),
  ('scheduled', 'Agendado', '#purple', 2),
  ('published', 'Publicado', '#green', 3),
  ('archived', 'Arquivado', '#gray', 4)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. TABELAS DO PAGE BUILDER (Puck)
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

-- ============================================================================
-- 3. ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_page_layout_slug ON page_layout(slug);
CREATE INDEX IF NOT EXISTS idx_page_layout_versions_page ON page_layout_versions(page_layout_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_comments_page ON page_comments(page_layout_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_comments_block ON page_comments(block_id);

-- ============================================================================
-- 4. SEED HOME LAYOUT (padrão)
-- ============================================================================

INSERT INTO page_layout (slug, title, published_data, created_at)
VALUES ('home', 'Home — Nossa Web TV', '{"blocks": []}', now())
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ✅ Tabelas criadas com sucesso
-- ============================================================================
