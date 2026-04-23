-- Migration: Engagement - Comments System
-- Description: Creating comments table and security policies

-- 1. Tabela de Comentários
CREATE TABLE IF NOT EXISTS public.comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    noticia_id UUID NOT NULL REFERENCES public.noticias(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome_usuario TEXT NOT NULL,
    comentario TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- 3. Políticas de Acesso
-- 3.1. Leitura: Qualquer pessoa pode ver comentários aprovados
CREATE POLICY "Anyone can read approved comments" 
ON public.comentarios FOR SELECT 
USING (status = 'approved');

-- 3.2. Inserção: Qualquer pessoa (anônima ou logada) pode postar (será pendente por padrão)
CREATE POLICY "Anyone can post comments" 
ON public.comentarios FOR INSERT 
WITH CHECK (true);

-- 3.3. Gestão: Administradores podem gerenciar todos os comentários
CREATE POLICY "Admins can manage comments" 
ON public.comentarios FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'editor')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'editor')
    )
);

-- 4. Índice para performance
CREATE INDEX IF NOT EXISTS idx_comentarios_noticia ON public.comentarios(noticia_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_status ON public.comentarios(status);
