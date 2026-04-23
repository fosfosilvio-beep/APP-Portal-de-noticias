-- ==========================================
-- MÓDULOS DE COMUNIDADE (Enquetes, Você no Portal, Comentários)
-- ==========================================

-- 1. Tabela ENQUETES
CREATE TABLE IF NOT EXISTS public.enquetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pergunta TEXT NOT NULL,
    opcoes JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array de objetos: [{ id: "1", texto: "Opção A", votos: 0 }]
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active enquetes" ON public.enquetes;
CREATE POLICY "Public can view active enquetes" ON public.enquetes FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Public can vote in enquetes" ON public.enquetes;
CREATE POLICY "Public can vote in enquetes" ON public.enquetes FOR UPDATE USING (status = 'active'); -- Voto anonimo via RPC seria ideal, mas permitir update no jsonb para MVP
DROP POLICY IF EXISTS "Admins can manage enquetes" ON public.enquetes;
CREATE POLICY "Admins can manage enquetes" ON public.enquetes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Tabela VOCÊ NO PORTAL (Sugestões/Denúncias)
CREATE TABLE IF NOT EXISTS public.vocenoportal_sugestoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    relato TEXT NOT NULL,
    localizacao TEXT,
    midia_urls TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'transformed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vocenoportal_sugestoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert sugestoes" ON public.vocenoportal_sugestoes;
CREATE POLICY "Public can insert sugestoes" ON public.vocenoportal_sugestoes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can manage sugestoes" ON public.vocenoportal_sugestoes;
CREATE POLICY "Admins can manage sugestoes" ON public.vocenoportal_sugestoes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Tabela COMENTÁRIOS (Moderação)
CREATE TABLE IF NOT EXISTS public.comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    noticia_id UUID REFERENCES public.noticias(id) ON DELETE CASCADE,
    nome_usuario TEXT NOT NULL,
    comentario TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view approved comentarios" ON public.comentarios;
CREATE POLICY "Public can view approved comentarios" ON public.comentarios FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS "Public can insert comentarios" ON public.comentarios;
CREATE POLICY "Public can insert comentarios" ON public.comentarios FOR INSERT WITH CHECK (status = 'pending');
DROP POLICY IF EXISTS "Admins can manage comentarios" ON public.comentarios;
CREATE POLICY "Admins can manage comentarios" ON public.comentarios FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Nota: Para "Você no Portal", você precisa criar o Bucket 'colaboracao' no painel Supabase:
-- 1. Vá em Storage -> New Bucket -> Name: colaboracao (Deixe "Public" marcado)
-- 2. Permita acesso de leitura/gravação ao bucket nas políticas do Storage.
