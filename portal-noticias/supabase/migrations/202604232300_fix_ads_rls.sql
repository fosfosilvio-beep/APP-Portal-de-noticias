-- Destravar leitura pública para exibir banners na Home
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active ad_slots" ON public.ad_slots;
CREATE POLICY "Public can view active ad_slots" ON public.ad_slots
FOR SELECT USING (status_ativo = true);

-- Destravar inserção anônima para contabilizar impressões e cliques 
-- (Sem isso, o visitante não consegue somar cliques no banco)
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert ad impressions" ON public.ad_impressions;
CREATE POLICY "Anyone can insert ad impressions" ON public.ad_impressions
FOR INSERT WITH CHECK (true);

-- Política de Gerenciamento para Admins já deve existir, mas reforçando:
DROP POLICY IF EXISTS "Admins can manage ad_slots" ON public.ad_slots;
CREATE POLICY "Admins can manage ad_slots" ON public.ad_slots 
FOR ALL TO authenticated USING (true) WITH CHECK (true);
