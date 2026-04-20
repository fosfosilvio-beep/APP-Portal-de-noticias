-- Migration: Fix Media RLS Permissions
-- Description: Garante que o bucket 'media' exista, seja público e tenha as políticas de RLS corretas para upload.

-- 1. Garantir que o bucket existe e é público
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Remover políticas antigas para evitar conflitos (opcional, mas recomendado)
DROP POLICY IF EXISTS "Allow Select Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow Insert Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update Media" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete Media" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;

-- 3. Criar novas políticas abrangentes para o bucket 'media'

-- Permissão de Leitura (Público)
CREATE POLICY "Allow Select Media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- Permissão de Inserção (Upload)
CREATE POLICY "Allow Insert Media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

-- Permissão de Atualização (Sobrescrita)
CREATE POLICY "Allow Update Media"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'media');

-- Permissão de Deleção
CREATE POLICY "Allow Delete Media"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'media');
