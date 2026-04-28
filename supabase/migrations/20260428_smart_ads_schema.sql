-- ============================================================
-- SMART ADS MANAGER: Schema de Banco de Dados (v1.0)
-- Descrição: Estrutura profissional para gestão de anunciantes,
--            campanhas e vinculação dinâmica de banners em múltiplos slots.
-- ============================================================

-- 1. Tabela de Anunciantes (Clientes)
CREATE TABLE IF NOT EXISTS public.anunciantes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        TEXT NOT NULL,
  email       TEXT,
  whatsapp    TEXT,
  status      TEXT DEFAULT 'ativo', -- ativo, inativo
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Campanhas (Agrupadores de Banners)
CREATE TABLE IF NOT EXISTS public.campanhas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anunciante_id  UUID REFERENCES public.anunciantes(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  data_inicio    DATE NOT NULL,
  data_fim       DATE,
  objetivo       TEXT, -- branding, clicks, etc
  status         TEXT DEFAULT 'rascunho', -- rascunho, ativa, pausada, finalizada
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Slots Publicitários (Espaços no Portal)
CREATE TABLE IF NOT EXISTS public.slots_publicitarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL, -- ex: 'home__header_top'
  largura_padrao INTEGER,
  altura_padrao  INTEGER,
  page_context   TEXT DEFAULT 'global', -- home, article, global
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Banners (Criativos)
CREATE TABLE IF NOT EXISTS public.banners (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campanha_id    UUID REFERENCES public.campanhas(id) ON DELETE CASCADE,
  nome           TEXT NOT NULL,
  tipo           TEXT DEFAULT 'imagem', -- imagem, html
  url_imagem     TEXT,
  url_destino    TEXT,
  codigo_html    TEXT,
  total_cliques  INTEGER DEFAULT 0,
  total_views    INTEGER DEFAULT 0,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Vinculação (Banners <-> Slots) - O "Um para Muitos" real
CREATE TABLE IF NOT EXISTS public.banners_slots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id   UUID REFERENCES public.banners(id) ON DELETE CASCADE,
  slot_id     UUID REFERENCES public.slots_publicitarios(id) ON DELETE CASCADE,
  peso        INTEGER DEFAULT 1, -- Para rotação (maior peso = mais chance de aparecer)
  ativo       BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(banner_id, slot_id)
);

-- 6. Tabela de Logs (Métricas brutas)
CREATE TABLE IF NOT EXISTS public.logs_publicidade (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id   UUID REFERENCES public.banners(id) ON DELETE SET NULL,
  slot_id     UUID REFERENCES public.slots_publicitarios(id) ON DELETE SET NULL,
  evento      TEXT NOT NULL, -- impression, click
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Função para Incremento de Métricas (Performance)
DROP FUNCTION IF EXISTS public.incrementar_clique_banner(uuid);
CREATE OR REPLACE FUNCTION public.incrementar_clique_banner(banner_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.banners
  SET total_cliques = total_cliques + 1
  WHERE id = banner_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Habilitar RLS (Segurança)
ALTER TABLE public.anunciantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots_publicitarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_publicidade ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (Acesso total para autenticados do admin)
CREATE POLICY "Acesso Total Admin" ON public.anunciantes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso Total Admin" ON public.campanhas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso Total Admin" ON public.slots_publicitarios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso Total Admin" ON public.banners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso Total Admin" ON public.banners_slots FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso Total Admin" ON public.logs_publicidade FOR ALL USING (auth.role() = 'authenticated');
