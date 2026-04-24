-- Migração: Módulo Definitivo de Publicidade
-- Tabela e políticas para banners publicitários

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

-- Ativar RLS
ALTER TABLE public.publicidade_banners ENABLE ROW LEVEL SECURITY;

-- Visitantes podem VER os banners ativos
DROP POLICY IF EXISTS "Visitantes podem ver banners ativos" ON public.publicidade_banners;
CREATE POLICY "Visitantes podem ver banners ativos" 
ON public.publicidade_banners FOR SELECT 
USING (status = true);

-- Administradores podem gerenciar TUDO
DROP POLICY IF EXISTS "Admins gerenciam banners" ON public.publicidade_banners;
CREATE POLICY "Admins gerenciam banners" 
ON public.publicidade_banners FOR ALL 
TO authenticated 
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Funções RPC para incremento seguro (Bypass RLS para visitantes)
CREATE OR REPLACE FUNCTION incrementar_visualizacao_banner(banner_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.publicidade_banners 
  SET visualizacoes = visualizacoes + 1 
  WHERE id = banner_id;
$$;

CREATE OR REPLACE FUNCTION incrementar_clique_banner(banner_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.publicidade_banners 
  SET cliques = cliques + 1 
  WHERE id = banner_id;
$$;

-- Configuração do Bucket 'publicidade'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('publicidade', 'publicidade', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Permitir leitura pública dos arquivos do bucket
DROP POLICY IF EXISTS "Leitura publica no bucket publicidade" ON storage.objects;
CREATE POLICY "Leitura publica no bucket publicidade"
ON storage.objects FOR SELECT
USING (bucket_id = 'publicidade');

-- Permitir upload e gerenciamento apenas para admins no bucket
DROP POLICY IF EXISTS "Admins podem alterar bucket publicidade" ON storage.objects;
CREATE POLICY "Admins podem alterar bucket publicidade"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'publicidade' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
