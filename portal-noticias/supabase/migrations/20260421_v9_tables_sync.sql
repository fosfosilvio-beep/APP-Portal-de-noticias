-- 1. Garante que a tabela configuracao_portal tenha as colunas necessárias (Resolve o erro 400)
ALTER TABLE public.configuracao_portal ADD COLUMN IF NOT EXISTS ui_settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.configuracao_portal ADD COLUMN IF NOT EXISTS nome_plataforma TEXT DEFAULT 'Portal de Notícias';
ALTER TABLE public.configuracao_portal ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Cria a tabela de comentários se não existir (Resolve o erro 404)
CREATE TABLE IF NOT EXISTS public.comentarios_noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  noticia_id UUID REFERENCES public.noticias(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id),
  conteudo TEXT NOT NULL,
  aprovado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilita RLS para comentários
ALTER TABLE public.comentarios_noticias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura pública de comentários" ON public.comentarios_noticias;
CREATE POLICY "Leitura pública de comentários" ON public.comentarios_noticias FOR SELECT USING (true);
DROP POLICY IF EXISTS "Inserção por usuários logados" ON public.comentarios_noticias;
CREATE POLICY "Inserção por usuários logados" ON public.comentarios_noticias FOR INSERT TO authenticated WITH CHECK (true);

-- 4. FORÇA RELOAD TOTAL DO POSTGREST (Resolve os erros 406 nos anúncios)
NOTIFY pgrst, 'reload schema';
