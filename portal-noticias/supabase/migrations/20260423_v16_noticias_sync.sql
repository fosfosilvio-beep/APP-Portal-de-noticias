-- ================================================
-- MIGRATION v16: Sincronização da Tabela Noticias
-- Data: 2026-04-23
-- ================================================

-- 1. Adicionar categoria_id para suporte a categorias dinâmicas
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL;

-- 2. Adicionar ad_id para suporte a anúncios vinculados
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS ad_id UUID REFERENCES ad_slots(id) ON DELETE SET NULL;

-- 3. Adicionar galeria_urls para suporte a álbum de fotos
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS galeria_urls TEXT[] DEFAULT '{}';

-- 4. Adicionar configurações de tipografia customizada
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS titulo_config JSONB DEFAULT '{"font": "var(--font-inter)", "weight": "900", "color": "default"}';
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS subtitulo_config JSONB DEFAULT '{"font": "var(--font-inter)", "weight": "400", "color": "default"}';

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_noticias_categoria_id ON noticias(categoria_id);
CREATE INDEX IF NOT EXISTS idx_noticias_ad_id ON noticias(ad_id);

-- 6. Tentar popular categoria_id baseado no campo 'categoria' antigo (opcional)
UPDATE noticias n
SET categoria_id = c.id
FROM categorias c
WHERE n.categoria = c.slug
AND n.categoria_id IS NULL;

-- Comentário: Esta migration resolve o erro de coluna ausente ao publicar matérias.
