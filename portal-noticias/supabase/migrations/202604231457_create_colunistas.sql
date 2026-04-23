-- Migration: Create Colunistas Table
-- Description: Table for managing portal columnists

CREATE TABLE IF NOT EXISTS public.colunistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cargo_descricao TEXT,
    foto_perfil TEXT,
    slug TEXT UNIQUE NOT NULL,
    biografia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adicionar colunista_id na tabela noticias se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='noticias' AND COLUMN_NAME='colunista_id') THEN
        ALTER TABLE public.noticias ADD COLUMN colunista_id UUID REFERENCES public.colunistas(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE public.colunistas ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Colunistas are viewable by everyone" 
ON public.colunistas FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage colunistas" 
ON public.colunistas FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);
