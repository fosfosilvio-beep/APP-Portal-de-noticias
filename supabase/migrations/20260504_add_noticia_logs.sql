-- Migration: Advanced News Audit Logs
-- Date: 2026-05-04
-- Description: Creates noticia_logs table for granular tracking of views including geolocation and user identity.

CREATE TABLE IF NOT EXISTS public.noticia_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    noticia_id UUID NOT NULL REFERENCES public.noticias(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    nome_usuario TEXT,
    email_usuario TEXT,
    cidade TEXT,
    estado TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.noticia_logs ENABLE ROW LEVEL SECURITY;

-- Políticas
-- 1. Inserção: Qualquer pessoa pode inserir (anônimo ou logado)
CREATE POLICY "Anyone can insert logs" ON public.noticia_logs FOR INSERT WITH CHECK (true);

-- 2. Leitura: Apenas Admins podem ver os logs
CREATE POLICY "Admins can view logs" ON public.noticia_logs FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND (role = 'admin' OR role = 'editor')
    )
);

-- Índices para performance em relatórios
CREATE INDEX IF NOT EXISTS idx_noticia_logs_noticia ON public.noticia_logs(noticia_id);
CREATE INDEX IF NOT EXISTS idx_noticia_logs_cidade ON public.noticia_logs(cidade);
CREATE INDEX IF NOT EXISTS idx_noticia_logs_created_at ON public.noticia_logs(created_at);

-- Função para buscar Top Cidades
CREATE OR REPLACE FUNCTION get_top_cities(limit_count INT DEFAULT 5)
RETURNS TABLE (cidade TEXT, total BIGINT) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT nl.cidade, count(*)::BIGINT as total
    FROM noticia_logs nl
    WHERE nl.cidade IS NOT NULL AND nl.cidade != 'Desconhecido'
    GROUP BY nl.cidade
    ORDER BY total DESC
    LIMIT limit_count;
END;
$$;

-- Função para buscar Horários de Pico (últimas 24h)
CREATE OR REPLACE FUNCTION get_peak_hours()
RETURNS TABLE (hora TEXT, total BIGINT) 
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_char(date_trunc('hour', nl.created_at), 'HH24:00') as hora, 
        count(*)::BIGINT as total
    FROM noticia_logs nl
    WHERE nl.created_at > now() - interval '24 hours'
    GROUP BY date_trunc('hour', nl.created_at)
    ORDER BY date_trunc('hour', nl.created_at) ASC;
END;
$$;

-- Função para atualizar contador via RPC
-- IMPORTANTE: Usa views_reais para consistência com o portal
CREATE OR REPLACE FUNCTION update_news_view_count(p_noticia_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE noticias
  SET views_reais = (SELECT count(*) FROM noticia_logs WHERE noticia_id = p_noticia_id)
  WHERE id = p_noticia_id;
END;
$$;
