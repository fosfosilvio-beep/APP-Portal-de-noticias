-- Fase 0: Setup de tipos e tabelas base para Page Builder

-- Tabela page_layout (Page Builder — home customizável)
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

-- Tabela page_layout_versions (histórico de versões)
CREATE TABLE IF NOT EXISTS page_layout_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_layout_id UUID REFERENCES page_layout(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  note TEXT,
  diff_summary JSONB
);

-- Tabela page_templates (templates reutilizáveis)
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

-- Tabela page_comments (comentários inline no editor)
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

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_page_layout_slug ON page_layout(slug);
CREATE INDEX IF NOT EXISTS idx_page_layout_versions_page ON page_layout_versions(page_layout_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_comments_page ON page_comments(page_layout_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_comments_block ON page_comments(block_id);

-- Seed de home layout (página inicial)
INSERT INTO page_layout (slug, title, published_data, created_at)
VALUES (
  'home',
  'Home — Nossa Web TV',
  '{"blocks": []}',
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- RLS (Row Level Security) — admin e editor podem editar
ALTER TABLE page_layout ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_layout_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_comments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "page_layout_public_read" ON page_layout
  FOR SELECT
  USING (published_data IS NOT NULL);

CREATE POLICY "page_layout_editor_full" ON page_layout
  FOR ALL
  USING (auth.role() IN ('service_role', 'authenticated') AND (
    SELECT role FROM user_roles WHERE user_id = auth.uid()
  ) IN ('admin', 'editor')
);

CREATE POLICY "page_comments_crud" ON page_comments
  FOR ALL
  USING (auth.role() = 'authenticated');
