-- Migration: Plantão Policial Industrial
-- Target: Supabase SQL Editor

CREATE TABLE IF NOT EXISTS plantao_policial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conteudo TEXT NOT NULL,
    urgencia VARCHAR(20) DEFAULT 'media', -- 'baixa', 'media', 'urgente'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ativo BOOLEAN DEFAULT TRUE
);

-- Habilitar RLS
ALTER TABLE plantao_policial ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
DROP POLICY IF EXISTS "Permitir leitura pública do plantão policial" ON plantao_policial;
CREATE POLICY "Permitir leitura pública do plantão policial" ON plantao_policial 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir escrita apenas para autenticados no plantão" ON plantao_policial;
CREATE POLICY "Permitir escrita apenas para autenticados no plantão" ON plantao_policial 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Permitir update para autenticados no plantão" ON plantao_policial;
CREATE POLICY "Permitir update para autenticados no plantão" ON plantao_policial 
FOR UPDATE USING (auth.role() = 'authenticated');

-- Inserir dado inicial de teste
INSERT INTO plantao_policial (conteudo, urgencia) 
VALUES ('🚨 Plantão Policial: Grave acidente na BR-369 agora à tarde. Equipes de resgate no local.', 'urgente');
