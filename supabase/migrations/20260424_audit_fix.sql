-- ============================================================
-- MIGRAÇÃO: Auditoria e Correção Completa do Banco de Dados
-- Data: 2026-04-24
-- Autor: Antigravity (Auditoria Automatizada)
-- ============================================================
-- Execute este script no Supabase Dashboard → SQL Editor
-- Todos os comandos são idempotentes (IF NOT EXISTS / ON CONFLICT)
-- ============================================================

-- ============================================================
-- SEÇÃO 1: TABELA `categorias`
-- Frontend consulta: supabase.from("categorias").select("id, nome")
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categorias (
  id       UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome     TEXT    NOT NULL,
  slug     TEXT    UNIQUE,
  ativa    BOOLEAN NOT NULL DEFAULT true,
  ordem    INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select categorias" ON public.categorias;
CREATE POLICY "Public select categorias"
  ON public.categorias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage categorias" ON public.categorias;
CREATE POLICY "Auth manage categorias"
  ON public.categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed: categorias padrão (idempotente via ON CONFLICT)
INSERT INTO public.categorias (nome, slug, ativa, ordem) VALUES
  ('Geral',          'geral',          true, 1),
  ('Política',       'politica',       true, 2),
  ('Economia',       'economia',       true, 3),
  ('Educação',       'educacao',       true, 4),
  ('Saúde',          'saude',          true, 5),
  ('Esportes',       'esportes',       true, 6),
  ('Entretenimento', 'entretenimento', true, 7),
  ('Tecnologia',     'tecnologia',     true, 8),
  ('Segurança',      'seguranca',      true, 9),
  ('Cidade',         'cidade',         true, 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEÇÃO 2: TABELA `colunistas`
-- Frontend consulta: supabase.from("colunistas").select("id, nome")
-- ============================================================
CREATE TABLE IF NOT EXISTS public.colunistas (
  id        UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nome      TEXT    NOT NULL,
  slug      TEXT    UNIQUE,
  bio       TEXT,
  foto_url  TEXT,
  email     TEXT,
  ativa     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.colunistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select colunistas" ON public.colunistas;
CREATE POLICY "Public select colunistas"
  ON public.colunistas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage colunistas" ON public.colunistas;
CREATE POLICY "Auth manage colunistas"
  ON public.colunistas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- SEÇÃO 3: TABELA `news_drafts`
-- Frontend usa: upsert({ user_id, data, updated_at }, { onConflict: "user_id" })
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news_drafts (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  data       JSONB       NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.news_drafts ENABLE ROW LEVEL SECURITY;

-- Cada usuário acessa apenas o próprio rascunho
DROP POLICY IF EXISTS "Users manage own draft" ON public.news_drafts;
CREATE POLICY "Users manage own draft"
  ON public.news_drafts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEÇÃO 4: COLUNAS FALTANTES NA TABELA `noticias`
-- ============================================================

-- 4.1: colunista_id (FK para colunistas)
ALTER TABLE public.noticias
  ADD COLUMN IF NOT EXISTS colunista_id UUID NULL REFERENCES public.colunistas(id) ON DELETE SET NULL;

-- 4.2: ad_id (FK para ad_slots — renomeia/clarifica sponsor_id)
--   Nota: sponsor_id foi criado em migration anterior como UUID NULL.
--   Criamos ad_id como alias de negócio apontando para ad_slots.
ALTER TABLE public.noticias
  ADD COLUMN IF NOT EXISTS ad_id UUID NULL REFERENCES public.ad_slots(id) ON DELETE SET NULL;

-- 4.3: Garantir galeria_urls como array (já deve existir, mas blindamos)
ALTER TABLE public.noticias
  ALTER COLUMN galeria_urls SET DEFAULT '{}';

-- ============================================================
-- SEÇÃO 5: FUNÇÃO `slug_disponivel` — Verificação de Unicidade
-- Chamada pelo frontend antes de publicar para garantir slug livre.
-- Retorna TRUE se o slug está disponível, FALSE se já existe.
-- ============================================================
CREATE OR REPLACE FUNCTION public.slug_disponivel(
  p_slug       TEXT,
  p_excluir_id UUID DEFAULT NULL  -- para ignorar a própria notícia no UPDATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.noticias
    WHERE slug = p_slug
      AND (p_excluir_id IS NULL OR id <> p_excluir_id)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.slug_disponivel(TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.slug_disponivel(TEXT, UUID) TO authenticated;

-- ============================================================
-- SEÇÃO 6: ÍNDICE de performance no slug (já tem UNIQUE, mas garante)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_noticias_slug ON public.noticias (slug);
CREATE INDEX IF NOT EXISTS idx_noticias_status ON public.noticias (status);
CREATE INDEX IF NOT EXISTS idx_noticias_colunista ON public.noticias (colunista_id);
CREATE INDEX IF NOT EXISTS idx_noticias_publish_at ON public.noticias (publish_at DESC);

-- ============================================================
-- SEÇÃO 7: RLS da tabela noticias — blindar INSERT/UPDATE/DELETE
-- (Garante que políticas existam — idempotente)
-- ============================================================
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select noticias" ON public.noticias;
CREATE POLICY "Public select noticias"
  ON public.noticias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Auth manage noticias" ON public.noticias;
CREATE POLICY "Auth manage noticias"
  ON public.noticias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- RELOAD do schema cache do PostgREST
-- ============================================================
NOTIFY pgrst, 'reload schema';
