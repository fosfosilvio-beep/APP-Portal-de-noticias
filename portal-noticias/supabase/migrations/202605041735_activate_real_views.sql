-- Migração: Ativação de Rastreador de Cliques e Views Reais
-- Descrição: Adiciona a coluna views_reais e cria a função RPC de incremento atômico

-- 1. Adicionar a coluna se ela não existir
ALTER TABLE public.noticias 
ADD COLUMN IF NOT EXISTS views_reais INTEGER DEFAULT 0;

-- 2. Criar a função RPC para incremento atômico (evita concorrência)
CREATE OR REPLACE FUNCTION public.increment_views(noticia_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.noticias
  SET views_reais = COALESCE(views_reais, 0) + 1
  WHERE id = noticia_id;
END;
$$;

-- 3. Garantir permissões de execução para o cliente (anon e authenticated)
GRANT EXECUTE ON FUNCTION public.increment_views(UUID) TO anon, authenticated;
