-- Tabela para gerenciar os Feeds RSS (FeedNews)
CREATE TABLE IF NOT EXISTS public.rss_feeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    categoria_padrao TEXT DEFAULT 'Geral',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    last_fetched TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;

-- Políticas de Gerenciamento Admin (somente admins podem ver/editar os feeds)
DROP POLICY IF EXISTS "Admins can manage rss feeds" ON public.rss_feeds;
CREATE POLICY "Admins can manage rss feeds" ON public.rss_feeds FOR ALL TO authenticated USING (true) WITH CHECK (true);
