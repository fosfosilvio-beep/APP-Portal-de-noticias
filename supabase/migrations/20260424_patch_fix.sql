-- ============================================================
-- PATCH: Correção idempotente do banco de dados
-- Execute no Supabase Dashboard → SQL Editor
-- Data: 2026-04-24
-- ============================================================

-- PATCH 1: news_drafts — adiciona colunas se não existirem
ALTER TABLE public.news_drafts
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.news_drafts
  ADD COLUMN IF NOT EXISTS data JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.news_drafts
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'news_drafts_user_id_key'
      AND conrelid = 'public.news_drafts'::regclass
  ) THEN
    ALTER TABLE public.news_drafts ADD CONSTRAINT news_drafts_user_id_key UNIQUE (user_id);
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Constraint já existe: %', SQLERRM;
END;
$$;

ALTER TABLE public.news_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own draft" ON public.news_drafts;
CREATE POLICY "Users manage own draft"
  ON public.news_drafts FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- PATCH 2: categorias
CREATE TABLE IF NOT EXISTS public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  ativa BOOLEAN NOT NULL DEFAULT true,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select categorias" ON public.categorias;
CREATE POLICY "Public select categorias" ON public.categorias FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth manage categorias" ON public.categorias;
CREATE POLICY "Auth manage categorias" ON public.categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.categorias (nome, slug, ativa, ordem) VALUES
  ('Geral','geral',true,1),('Política','politica',true,2),
  ('Economia','economia',true,3),('Educação','educacao',true,4),
  ('Saúde','saude',true,5),('Esportes','esportes',true,6),
  ('Entretenimento','entretenimento',true,7),('Tecnologia','tecnologia',true,8),
  ('Segurança','seguranca',true,9),('Cidade','cidade',true,10)
ON CONFLICT (slug) DO NOTHING;

-- PATCH 3: colunistas
CREATE TABLE IF NOT EXISTS public.colunistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  bio TEXT,
  foto_url TEXT,
  email TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.colunistas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select colunistas" ON public.colunistas;
CREATE POLICY "Public select colunistas" ON public.colunistas FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth manage colunistas" ON public.colunistas;
CREATE POLICY "Auth manage colunistas" ON public.colunistas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- PATCH 4: colunas faltantes em noticias
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS colunista_id UUID NULL REFERENCES public.colunistas(id) ON DELETE SET NULL;
ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS ad_id UUID NULL REFERENCES public.ad_slots(id) ON DELETE SET NULL;

-- PATCH 5: RPC slug_disponivel
CREATE OR REPLACE FUNCTION public.slug_disponivel(p_slug TEXT, p_excluir_id UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.noticias
    WHERE slug = p_slug AND (p_excluir_id IS NULL OR id <> p_excluir_id)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.slug_disponivel(TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.slug_disponivel(TEXT, UUID) TO authenticated;

-- PATCH 6: índices e RLS da tabela noticias
CREATE INDEX IF NOT EXISTS idx_noticias_slug ON public.noticias (slug);
CREATE INDEX IF NOT EXISTS idx_noticias_status ON public.noticias (status);

ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select noticias" ON public.noticias;
CREATE POLICY "Public select noticias" ON public.noticias FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth manage noticias" ON public.noticias;
CREATE POLICY "Auth manage noticias" ON public.noticias FOR ALL TO authenticated USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
