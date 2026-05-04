-- Migration: Fix Comments Auth & Profile
-- Date: 2026-05-04
-- Description: Adds user identification and profile image support to the comments table

ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS usuario_email TEXT,
ADD COLUMN IF NOT EXISTS usuario_imagem TEXT;

-- Update RLS if needed (Allow insert if authenticated)
DROP POLICY IF EXISTS "Anyone can post comments" ON public.comentarios;
CREATE POLICY "Anyone can post comments" 
ON public.comentarios FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Ensure public can read the new columns
-- (Usually select * is already allowed for public)

COMMENT ON COLUMN public.comentarios.usuario_id IS 'ID do usuário no Supabase Auth';
COMMENT ON COLUMN public.comentarios.usuario_email IS 'Email do usuário para auditoria';
COMMENT ON COLUMN public.comentarios.usuario_imagem IS 'URL da foto de perfil (Google/Facebook)';
