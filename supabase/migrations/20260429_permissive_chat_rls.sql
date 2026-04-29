-- ====================================================================
-- MIGRAÇÃO: RLS Permissivo para Chat Nativo
-- Data: 2026-04-29
-- ====================================================================

-- 1. Tabela live_messages
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public pode ler msgs" ON public.live_messages;
CREATE POLICY "Public pode ler msgs" 
  ON public.live_messages FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users inserem sua msg" ON public.live_messages;
CREATE POLICY "Users inserem sua msg" 
  ON public.live_messages FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- 2. Tabela profiles (Necessária para o join no SELECT do chat)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

-- 3. Garantir permissões de uso do schema public para autenticados
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE public.live_messages TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 4. Notificar Platform
NOTIFY pgrst, 'reload schema';
