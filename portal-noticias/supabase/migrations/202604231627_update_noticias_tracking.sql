-- Migration: Metrics and Audience Tracking
-- Description: Adding view_count to noticias and creating page_views log table

-- 1. Adicionar view_count na tabela noticias
ALTER TABLE public.noticias 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Criar tabela de logs de visualizações para métricas temporais
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    noticia_id UUID REFERENCES public.noticias(id) ON DELETE CASCADE,
    story_id UUID REFERENCES public.web_stories(id) ON DELETE CASCADE,
    user_id UUID, -- Opcional: para identificar sessões únicas se logado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS na page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acesso para page_views
CREATE POLICY "Anyone can insert page views" 
ON public.page_views FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view page views" 
ON public.page_views FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'editor')
    )
);

-- 5. Garantir que web_stories tem a coluna vistas (já deve ter, mas por precaução)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='web_stories' AND COLUMN_NAME='vistas') THEN
        ALTER TABLE public.web_stories ADD COLUMN vistas INTEGER DEFAULT 0;
    END IF;
END $$;
