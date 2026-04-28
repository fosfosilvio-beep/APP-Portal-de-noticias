-- ============================================================
-- MIGRAÇÃO: Ad Slots — Canvas Editor Upgrade
-- Versão: 20260428
-- Descrição: Adiciona colunas para suporte ao editor visual
--            drag-and-drop (custom_width, custom_height, zone_order,
--            zone_id) na tabela ad_slots.
-- ============================================================

-- 1. Dimensões customizadas (sobrescreve o padrão da zona)
ALTER TABLE public.ad_slots
  ADD COLUMN IF NOT EXISTS custom_width  INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS custom_height INTEGER DEFAULT NULL;

-- 2. Ordem dentro de uma mesma zona (para múltiplos banners por zona)
ALTER TABLE public.ad_slots
  ADD COLUMN IF NOT EXISTS zone_order INTEGER DEFAULT 0;

-- 3. Identificador canônico da zona no canvas
--    Formato: "{página}__{posição}" — ex: "home__header_top", "article__in_article_1"
--    Substitui progressivamente posicao_html para o novo sistema de zonas.
--    posicao_html é mantido por compatibilidade retroativa com DynamicAdSlot.
ALTER TABLE public.ad_slots
  ADD COLUMN IF NOT EXISTS zone_id TEXT DEFAULT NULL;

-- 4. Comentários de documentação nas colunas
COMMENT ON COLUMN public.ad_slots.custom_width  IS 'Largura customizada em px definida no Canvas Editor. NULL = usa dimensão padrão da zona.';
COMMENT ON COLUMN public.ad_slots.custom_height IS 'Altura customizada em px definida no Canvas Editor. NULL = usa dimensão padrão da zona.';
COMMENT ON COLUMN public.ad_slots.zone_order    IS 'Ordem de exibição quando múltiplos banners estão na mesma zona.';
COMMENT ON COLUMN public.ad_slots.zone_id       IS 'ID canônico da zona no canvas. Formato: {pagina}__{posicao}. Ex: home__header_top, article__sidebar_1.';

-- 5. Índice para queries de renderização pública (DynamicAdSlot busca por zone_id)
CREATE INDEX IF NOT EXISTS idx_ad_slots_zone_id
  ON public.ad_slots (zone_id)
  WHERE status_ativo = TRUE;

-- 6. Índice composto para ordenação por zona
CREATE INDEX IF NOT EXISTS idx_ad_slots_zone_order
  ON public.ad_slots (zone_id, zone_order)
  WHERE status_ativo = TRUE;

-- 7. Mapa de compatibilidade: popula zone_id para slots existentes
--    baseado no posicao_html legado.
UPDATE public.ad_slots SET zone_id =
  CASE posicao_html
    WHEN 'header_top'      THEN 'home__header_top'
    WHEN 'sidebar_right_1' THEN 'home__sidebar_1'
    WHEN 'sidebar_right_2' THEN 'home__sidebar_2'
    WHEN 'in_article'      THEN 'article__in_article_1'
    WHEN 'footer_top'      THEN 'home__footer_top'
    ELSE NULL
  END
WHERE zone_id IS NULL
  AND posicao_html IS NOT NULL;

-- ============================================================
-- RESULTADO ESPERADO:
--   ad_slots agora possui:
--     - zone_id         TEXT        (novo sistema canônico)
--     - custom_width    INTEGER     (dimensão custom W)
--     - custom_height   INTEGER     (dimensão custom H)
--     - zone_order      INTEGER     (ordenação por zona)
--   Slots legados são automaticamente migrados via UPDATE acima.
-- ============================================================
