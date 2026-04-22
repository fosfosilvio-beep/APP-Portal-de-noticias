-- Categorias dinâmicas (substitui hardcoded)
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT,
  ordem INT DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO categorias (slug, nome, ordem) VALUES
  ('geral','Geral',0), ('arapongas','Arapongas',1), ('esportes','Esportes',2),
  ('policia','Polícia',3), ('politica','Política',4), ('entretenimento','Entretenimento',5)
ON CONFLICT (slug) DO NOTHING;

-- FK opcional em noticias/biblioteca_webtv
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id);
ALTER TABLE biblioteca_webtv ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias(id);
-- backfill por slug; manter coluna `categoria` texto como fallback por 1 release.
UPDATE noticias SET categoria_id = (SELECT id FROM categorias WHERE categorias.slug = noticias.categoria) WHERE categoria_id IS NULL;

-- Auto-save em nuvem (substitui localStorage)
CREATE TABLE IF NOT EXISTS news_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sanitização HTML (Fase 3 expande; já entra aqui o flag)
ALTER TABLE ad_slots ADD COLUMN IF NOT EXISTS sanitized BOOLEAN DEFAULT false;
