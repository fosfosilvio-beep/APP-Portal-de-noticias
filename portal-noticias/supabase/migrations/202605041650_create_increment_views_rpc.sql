-- Migração: Função RPC para incremento de visualizações de notícias
-- Descrição: Incrementa o contador de view_count na tabela noticias de forma atômica

CREATE OR REPLACE FUNCTION public.increment_views(noticia_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.noticias
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = noticia_id;
END;
$$;

-- Permissões para que qualquer visitante possa disparar o contador (via RPC)
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;
