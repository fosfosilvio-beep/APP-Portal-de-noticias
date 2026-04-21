-- ==========================================
-- SISTEMA DE PODCASTS & BIBLIOTECA V6
-- ==========================================

-- 1. Tabela de Podcasts (Master)
CREATE TABLE IF NOT EXISTS public.podcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    apresentador_nome TEXT,
    apresentador_foto_url TEXT,
    horario_exibicao TEXT,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Episódios (Detalhes)
CREATE TABLE IF NOT EXISTS public.episodios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodios ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Leitura Pública
CREATE POLICY "Leitura pública de podcasts" ON public.podcasts
    FOR SELECT USING (true);

CREATE POLICY "Leitura pública de episódios" ON public.episodios
    FOR SELECT USING (true);

-- 5. Políticas de Escrita (Apenas Admin Autenticado)
CREATE POLICY "Admin pode gerenciar podcasts" ON public.podcasts
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin pode gerenciar episódios" ON public.episodios
    FOR ALL USING (auth.role() = 'authenticated');

-- 6. Tabelas sugeridas para Indexação
CREATE INDEX IF NOT EXISTS idx_episodios_podcast_id ON public.episodios(podcast_id);
CREATE INDEX IF NOT EXISTS idx_episodios_data ON public.episodios(data_publicacao DESC);
