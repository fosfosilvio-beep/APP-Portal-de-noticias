-- Migration: Create Web Stories Table
-- Description: Table for managing Instagram-style stories

CREATE TABLE IF NOT EXISTS public.web_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    imagem_capa TEXT NOT NULL,
    link_destino TEXT,
    vistas INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.web_stories ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso

-- 1. Qualquer pessoa pode visualizar as stories
CREATE POLICY "Stories are viewable by everyone" 
ON public.web_stories FOR SELECT 
USING (true);

-- 2. Apenas administradores podem inserir/atualizar/deletar
CREATE POLICY "Admins can manage stories" 
ON public.web_stories FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);

-- Observação: Certifique-se de criar o bucket 'stories' no Storage
-- e configurar o acesso público a ele.
