-- Tabela para o VOD (Video on Demand)
CREATE TABLE IF NOT EXISTS public.videos_vod (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_destaque BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela para Edições Digitais (FlipBook)
CREATE TABLE IF NOT EXISTS public.edicoes_digitais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    capa_url TEXT NOT NULL,
    is_destaque BOOLEAN DEFAULT false,
    data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.videos_vod ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edicoes_digitais ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública
DROP POLICY IF EXISTS "Public can view published videos" ON public.videos_vod;
CREATE POLICY "Public can view published videos" ON public.videos_vod FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public can view digital editions" ON public.edicoes_digitais;
CREATE POLICY "Public can view digital editions" ON public.edicoes_digitais FOR SELECT USING (true);

-- Políticas de Gerenciamento Admin
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos_vod;
CREATE POLICY "Admins can manage videos" ON public.videos_vod FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage editions" ON public.edicoes_digitais;
CREATE POLICY "Admins can manage editions" ON public.edicoes_digitais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Criar buckets se não existirem (usando SQL para buckets é mais complexo, mas o Supabase permite criação via painel. O Storage API do Supabase cuida disso).
-- Vamos criar as policies para o bucket 'edicoes' assumindo que ele será criado manualmente ou já existe.
-- INSERT INTO storage.buckets (id, name, public) VALUES ('edicoes', 'edicoes', true) ON CONFLICT DO NOTHING;
-- E para o bucket 'videos'
-- INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true) ON CONFLICT DO NOTHING;

-- Configurar Storage Policies para 'edicoes'
-- CREATE POLICY "Public Access to Edicoes" ON storage.objects FOR SELECT USING (bucket_id = 'edicoes');
-- CREATE POLICY "Admin Upload to Edicoes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'edicoes');
-- CREATE POLICY "Admin Update to Edicoes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'edicoes');
-- CREATE POLICY "Admin Delete from Edicoes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'edicoes');

-- Configurar Storage Policies para 'videos'
-- CREATE POLICY "Public Access to Videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
-- CREATE POLICY "Admin Upload to Videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'videos');
-- CREATE POLICY "Admin Update to Videos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'videos');
-- CREATE POLICY "Admin Delete from Videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'videos');
