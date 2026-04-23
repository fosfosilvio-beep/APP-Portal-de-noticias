-- ================================================
-- MIGRATION v15: Categorias dinâmicas + Puck flag
-- Data: 2026-04-22
-- ================================================

-- 1. Tabela categorias (substitui hardcoded)
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#00AEE0',
  ordem INT DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed categorias padrão do portal
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

-- 2. Tabela news_drafts (auto-save em nuvem)
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

-- 3. Feature flag use_puck_home em configuracao_portal
-- (já existe como JSONB no ui_settings, não precisa coluna nova)
-- Ativar via: UPDATE configuracao_portal SET ui_settings = ui_settings || '{"use_puck_home": false}' WHERE id = 1;

-- 4. Coluna ordem em biblioteca_lives (para reordenação)
ALTER TABLE biblioteca_lives ADD COLUMN IF NOT EXISTS ordem INT DEFAULT 0;
ALTER TABLE biblioteca_lives ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE biblioteca_lives ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'live';

-- 5. Garantir coluna published_at em page_layout
ALTER TABLE page_layout ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 6. RLS em categorias (leitura pública, escrita apenas admin/editor)
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

-- 7. Seed flag use_puck_home (off por padrão — usa layout legado como fallback)
UPDATE configuracao_portal 
SET ui_settings = COALESCE(ui_settings, '{}'::jsonb) || '{"use_puck_home": false}'::jsonb
WHERE id = 1;
