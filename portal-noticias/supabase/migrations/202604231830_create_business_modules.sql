-- Modificação na tabela de anúncios para suporte à Central do Anunciante
ALTER TABLE public.ad_slots 
ADD COLUMN IF NOT EXISTS cliente_nome TEXT,
ADD COLUMN IF NOT EXISTS link_destino TEXT,
ADD COLUMN IF NOT EXISTS validade_ate TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cliques INTEGER DEFAULT 0;

-- Tabela para gerenciar os Classificados
CREATE TABLE IF NOT EXISTS public.classificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL CHECK (tipo IN ('Imóvel', 'Veículo', 'Emprego', 'Serviços', 'Outros')),
    titulo TEXT NOT NULL,
    descricao TEXT,
    preco NUMERIC,
    fotos TEXT[] DEFAULT '{}',
    contato_whatsapp TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.classificados ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (Público)
DROP POLICY IF EXISTS "Public can view active classificados" ON public.classificados;
CREATE POLICY "Public can view active classificados" ON public.classificados 
FOR SELECT USING (status = 'active');

-- Políticas de Gerenciamento Admin
DROP POLICY IF EXISTS "Admins can manage classificados" ON public.classificados;
CREATE POLICY "Admins can manage classificados" ON public.classificados 
FOR ALL TO authenticated USING (true) WITH CHECK (true);
