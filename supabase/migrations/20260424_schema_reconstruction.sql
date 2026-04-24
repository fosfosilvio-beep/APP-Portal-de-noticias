-- ============================================================
-- MIGRAÇÃO: Reconstrução Total do Esquema (V2)
-- Data: 2026-04-24
-- Objetivo: Criar todas as tabelas ausentes identificadas
-- ============================================================

-- 1. Categorias
CREATE TABLE IF NOT EXISTS categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  cor TEXT,
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Notícias (Coração do Portal)
CREATE TABLE IF NOT EXISTS noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  conteudo TEXT,
  slug TEXT UNIQUE,
  imagem_capa_url TEXT,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  ordem_prioridade INTEGER DEFAULT 0,
  is_sponsored BOOLEAN DEFAULT FALSE,
  sponsor_id UUID,
  real_views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'published',
  publish_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  video_url TEXT,
  audio_url TEXT,
  tipo_midia TEXT DEFAULT 'image'
);

-- 3. Biblioteca WebTV
CREATE TABLE IF NOT EXISTS biblioteca_webtv (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  url_video TEXT NOT NULL,
  capa_video TEXT,
  categoria TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Plantão Policial
CREATE TABLE IF NOT EXISTS plantao_policial (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conteudo TEXT NOT NULL,
  urgencia TEXT DEFAULT 'normal',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Colunistas
CREATE TABLE IF NOT EXISTS colunistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  slug TEXT UNIQUE,
  cargo_descricao TEXT,
  foto_perfil TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enquetes
CREATE TABLE IF NOT EXISTS enquetes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pergunta TEXT NOT NULL,
  opcoes JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Publicidade Banners
CREATE TABLE IF NOT EXISTS publicidade_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT,
  imagem_url TEXT NOT NULL,
  link_destino TEXT,
  posicao TEXT, -- home_topo, home_meio, etc
  status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Habilitar RLS
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE biblioteca_webtv ENABLE ROW LEVEL SECURITY;
ALTER TABLE plantao_policial ENABLE ROW LEVEL SECURITY;
ALTER TABLE colunistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE publicidade_banners ENABLE ROW LEVEL SECURITY;

-- 9. Políticas de Leitura Pública
CREATE POLICY "Anon Select Categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Anon Select Noticias" ON noticias FOR SELECT USING (true);
CREATE POLICY "Anon Select WebTV" ON biblioteca_webtv FOR SELECT USING (true);
CREATE POLICY "Anon Select Plantao" ON plantao_policial FOR SELECT USING (true);
CREATE POLICY "Anon Select Colunistas" ON colunistas FOR SELECT USING (true);
CREATE POLICY "Anon Select Enquetes" ON enquetes FOR SELECT USING (true);
CREATE POLICY "Anon Select Banners" ON publicidade_banners FOR SELECT USING (true);

-- 10. Seeds de exemplo para Categorias
INSERT INTO categorias (nome, slug, ordem) VALUES 
('Geral', 'geral', 1),
('Política', 'politica', 2),
('Esportes', 'esportes', 3)
ON CONFLICT (slug) DO NOTHING;
