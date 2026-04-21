-- MIGRATION: PODCASTS V8 - SISTEMA DE ENGAJAMENTO E AUDIÊNCIA
-- Descrição: Adiciona convidados, tracking de views e sistema de comentários/reações globais.

-- 1. Evolução da Tabela de Episódios
ALTER TABLE public.episodios 
ADD COLUMN IF NOT EXISTS convidados TEXT,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 2. Tabela de Comentários
CREATE TABLE IF NOT EXISTS public.comentarios_podcast (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episodio_id UUID REFERENCES public.episodios(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Reações Globais (Contador por Emoji)
CREATE TABLE IF NOT EXISTS public.episodio_reacoes (
  episodio_id UUID REFERENCES public.episodios(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  count INTEGER DEFAULT 0,
  PRIMARY KEY (episodio_id, emoji)
);

-- 4. Funções RPC para Incremento Atômico
-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_view_count(target_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.episodios 
  SET view_count = view_count + 1 
  WHERE id = target_id;
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar reação global
CREATE OR REPLACE FUNCTION increment_reaction_count(target_id UUID, emoji_val TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO public.episodio_reacoes (episodio_id, emoji, count)
  VALUES (target_id, emoji_val, 1)
  ON CONFLICT (episodio_id, emoji)
  DO UPDATE SET count = episodio_reacoes.count + 1;
END;
$$ LANGUAGE plpgsql;

-- 5. Políticas de RLS
ALTER TABLE public.comentarios_podcast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodio_reacoes ENABLE ROW LEVEL SECURITY;

-- Permitir leitura e inserção pública (Anônima)
CREATE POLICY "Leitura de Comentários" ON public.comentarios_podcast FOR SELECT TO public USING (true);
CREATE POLICY "Inserção de Comentários" ON public.comentarios_podcast FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Leitura de Reações" ON public.episodio_reacoes FOR SELECT TO public USING (true);
CREATE POLICY "Inserção de Reações" ON public.episodio_reacoes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Update de Reações" ON public.episodio_reacoes FOR UPDATE TO public USING (true);

-- 6. Auditoria
COMMENT ON TABLE public.comentarios_podcast IS 'Armazena comentários dos ouvintes nos episódios';
COMMENT ON TABLE public.episodio_reacoes IS 'Contadores globais de reações emoji por episódio';
