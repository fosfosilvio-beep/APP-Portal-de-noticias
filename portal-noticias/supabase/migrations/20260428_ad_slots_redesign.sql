-- Adicionar colunas para suporte a contextos granulares no Ad Editor
ALTER TABLE ad_slots 
ADD COLUMN IF NOT EXISTS page_context TEXT DEFAULT 'global' CHECK (page_context IN ('global', 'home', 'article')),
ADD COLUMN IF NOT EXISTS css_overrides JSONB DEFAULT '{}'::jsonb;

-- Criar índice para performance em filtros de contexto
CREATE INDEX IF NOT EXISTS idx_ad_slots_page_context ON ad_slots(page_context);
CREATE INDEX IF NOT EXISTS idx_ad_slots_noticia_id ON ad_slots(noticia_id);

-- Atualizar comentários para documentação no Supabase
COMMENT ON COLUMN ad_slots.page_context IS 'Contexto de exibição: global, home (apenas início) ou article (páginas de notícia)';
COMMENT ON COLUMN ad_slots.css_overrides IS 'Ajustes de estilo específicos (margens, paddings, etc)';
