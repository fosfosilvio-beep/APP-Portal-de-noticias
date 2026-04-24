-- ==========================================
-- SCRIPT DE REPARAÇÃO DO BANCO DE DADOS
-- Execute no Supabase Dashboard → SQL Editor
-- ==========================================

-- 1. Tabela de Roles (Governança)
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'autor', 'revisor')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.1 Tabela de Perfis (Necessária para Auditoria)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT,
    email TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Auditoria
CREATE TABLE IF NOT EXISTS public.admin_actions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    diff JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabela ENQUETES
CREATE TABLE IF NOT EXISTS public.enquetes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pergunta TEXT NOT NULL,
    opcoes JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela PUBLICIDADE BANNERS
CREATE TABLE IF NOT EXISTS public.publicidade_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    imagem_url TEXT NOT NULL,
    link_destino TEXT,
    posicao TEXT NOT NULL CHECK (posicao IN ('home_topo', 'home_meio', 'noticia_lateral', 'noticia_meio')),
    dimensoes TEXT NOT NULL,
    status BOOLEAN NOT NULL DEFAULT true,
    cliques INTEGER NOT NULL DEFAULT 0,
    visualizacoes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela COMENTÁRIOS
CREATE TABLE IF NOT EXISTS public.comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    noticia_id UUID REFERENCES public.noticias(id) ON DELETE CASCADE,
    nome_usuario TEXT NOT NULL,
    comentario TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela VOCÊ NO PORTAL
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

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquetes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publicidade_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocenoportal_sugestoes ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Admin Manage All)
-- Nota: Assume-se que o usuário logado no portal admin é fosfosilvio@gmail.com
-- Para garantir acesso inicial, você pode rodar:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('ID_DO_USUARIO', 'admin') ON CONFLICT DO NOTHING;

DO $$ 
BEGIN
    -- Políticas para Enquetes
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins manage enquetes') THEN
        CREATE POLICY "Admins manage enquetes" ON public.enquetes FOR ALL TO authenticated USING (true);
    END IF;
    
    -- Políticas para Publicidade
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins manage banners') THEN
        CREATE POLICY "Admins manage banners" ON public.publicidade_banners FOR ALL TO authenticated USING (true);
    END IF;

    -- Políticas para Auditoria
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admins view audit') THEN
        CREATE POLICY "Admins view audit" ON public.admin_actions FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Permitir leitura pública para Enquetes e Banners
DROP POLICY IF EXISTS "Public view enquetes" ON public.enquetes;
CREATE POLICY "Public view enquetes" ON public.enquetes FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public view banners" ON public.publicidade_banners;
CREATE POLICY "Public view banners" ON public.publicidade_banners FOR SELECT USING (status = true);

-- Bucket de Storage para Publicidade
INSERT INTO storage.buckets (id, name, public) 
VALUES ('publicidade', 'publicidade', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bucket de Storage para Colunistas
INSERT INTO storage.buckets (id, name, public) 
VALUES ('colunistas', 'colunistas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public access to publicidade" ON storage.objects;
CREATE POLICY "Public access to publicidade" ON storage.objects FOR SELECT USING (bucket_id = 'publicidade');

DROP POLICY IF EXISTS "Public access to colunistas" ON storage.objects;
CREATE POLICY "Public access to colunistas" ON storage.objects FOR SELECT USING (bucket_id = 'colunistas');

DROP POLICY IF EXISTS "Admin manage publicidade" ON storage.objects;
CREATE POLICY "Admin manage publicidade" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'publicidade');

DROP POLICY IF EXISTS "Admin manage colunistas" ON storage.objects;
CREATE POLICY "Admin manage colunistas" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'colunistas');
