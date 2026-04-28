-- ============================================================
-- MIGRAÇÃO: Ad Slots — Restrição por Notícia (Contexto Dinâmico)
-- Versão: 20260428_2
-- Descrição: Adiciona coluna noticia_id para permitir que um banner 
--            seja exibido SOMENTE numa notícia específica.
-- ============================================================

-- 1. Adicionar coluna com Foreign Key
ALTER TABLE public.ad_slots
  ADD COLUMN IF NOT EXISTS noticia_id UUID DEFAULT NULL REFERENCES public.noticias(id) ON DELETE CASCADE;

-- 2. Comentário de documentação
COMMENT ON COLUMN public.ad_slots.noticia_id IS 'Se nulo, banner é Global. Se preenchido, o banner aparece apenas na notícia especificada.';

-- 3. Criar índice para performance de leitura no DynamicAdSlot
CREATE INDEX IF NOT EXISTS idx_ad_slots_noticia_id
  ON public.ad_slots (noticia_id)
  WHERE status_ativo = TRUE AND noticia_id IS NOT NULL;
