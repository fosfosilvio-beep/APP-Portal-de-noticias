-- ==========================================
-- AUDITORIA DE SEGURANÇA FINAL (RLS)
-- GARANTINDO QUE APENAS LEITURA SEJA PÚBLICA
-- E OPERAÇÕES CRÍTICAS (INSERT/UPDATE/DELETE) SEJAM EXCLUSIVAS DE AUTHENTICATED
-- ==========================================

-- 1. NOTÍCIAS
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view published articles" ON public.noticias;
CREATE POLICY "Public can view published articles" ON public.noticias FOR SELECT USING (status = 'published');
DROP POLICY IF EXISTS "Authenticated users can manage articles" ON public.noticias;
CREATE POLICY "Authenticated users can manage articles" ON public.noticias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. AD_SLOTS
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active ad slots" ON public.ad_slots;
CREATE POLICY "Public can view active ad slots" ON public.ad_slots FOR SELECT USING (status_ativo = true);
DROP POLICY IF EXISTS "Admins can manage ad slots" ON public.ad_slots;
CREATE POLICY "Admins can manage ad slots" ON public.ad_slots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. CLASSIFICADOS
ALTER TABLE public.classificados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active classificados" ON public.classificados;
CREATE POLICY "Public can view active classificados" ON public.classificados FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admins can manage classificados" ON public.classificados;
CREATE POLICY "Admins can manage classificados" ON public.classificados FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. VIDEOS VOD
ALTER TABLE public.videos_vod ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active videos" ON public.videos_vod;
CREATE POLICY "Public can view active videos" ON public.videos_vod FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos_vod;
CREATE POLICY "Admins can manage videos" ON public.videos_vod FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. EDICOES DIGITAIS
ALTER TABLE public.edicoes_digitais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active edicoes" ON public.edicoes_digitais;
CREATE POLICY "Public can view active edicoes" ON public.edicoes_digitais FOR SELECT USING (status = 'active');
DROP POLICY IF EXISTS "Admins can manage edicoes" ON public.edicoes_digitais;
CREATE POLICY "Admins can manage edicoes" ON public.edicoes_digitais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. RSS FEEDS
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage rss feeds" ON public.rss_feeds;
CREATE POLICY "Admins can manage rss feeds" ON public.rss_feeds FOR ALL TO authenticated USING (true) WITH CHECK (true);
