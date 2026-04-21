-- MIGRATION: PODCASTS V7 - SISTEMA DE RECORTE E STORAGE
-- Descrição: Adiciona colunas de tempo (trimming) e cria bucket para thumbnails de podcasts.

-- 1. Evolução da Tabela de Episódios
ALTER TABLE public.episodios 
ADD COLUMN IF NOT EXISTS start_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS end_time INTEGER;

-- 2. Criação do Bucket de Storage (via extensões do Supabase)
-- Nota: Caso o bucket já exista no painel, o Supabase ignorará.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('podcast-covers', 'podcast-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de Segurança (RLS) para o Bucket
-- Permite leitura pública
CREATE POLICY "Leitura Pública de Capas" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'podcast-covers');

-- Permite upload para usuários autenticados (Admin)
CREATE POLICY "Admin Upload de Capas" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'podcast-covers');

CREATE POLICY "Admin Delete de Capas" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'podcast-covers');

-- 4. Comentários para Auditoria
COMMENT ON COLUMN public.episodios.start_time IS 'Tempo inicial de reprodução em segundos (Skip Intro)';
COMMENT ON COLUMN public.episodios.end_time IS 'Tempo final de reprodução em segundos (Opcional)';
