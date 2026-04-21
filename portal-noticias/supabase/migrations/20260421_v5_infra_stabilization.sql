-- Migração V5: Estabilização de Infraestrutura e Tabelas Base

-- 1. Garantir registro inicial na tabela configuracao_portal
-- Se o registro ID=1 não existe, as consultas de branding falham com 400.
INSERT INTO configuracao_portal (id, is_live, fake_viewers_boost)
VALUES (1, false, 0)
ON CONFLICT (id) DO NOTHING;

-- 2. Habilitar Leitura Pública para Tabelas de Configuração
-- Isso resolve erros de permissão no frontend
ALTER TABLE configuracao_portal ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de configurações" ON configuracao_portal;
CREATE POLICY "Leitura pública de configurações" ON configuracao_portal FOR SELECT USING (true);

-- 3. Habilitar Leitura Pública para Notícias (caso não esteja)
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de notícias" ON noticias;
CREATE POLICY "Leitura pública de notícias" ON noticias FOR SELECT USING (true);

-- 4. Criar tabela plantao_policial se não existir (visto anteriormente)
CREATE TABLE IF NOT EXISTS plantao_policial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conteudo TEXT NOT NULL,
    urgencia VARCHAR(20) DEFAULT 'media',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE
);

ALTER TABLE plantao_policial ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública do plantão" ON plantao_policial;
CREATE POLICY "Leitura pública do plantão" ON plantao_policial FOR SELECT USING (true);
