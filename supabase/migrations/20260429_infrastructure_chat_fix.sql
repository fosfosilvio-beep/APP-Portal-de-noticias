-- ====================================================================
-- MIGRAÇÃO FINAL: Infraestrutura, RLS e Sincronização de Chat
-- Data: 2026-04-29
-- ====================================================================

-- 1. Garantir que a tabela live_messages tem RLS correto
ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public pode ler msgs" ON public.live_messages;
CREATE POLICY "Public pode ler msgs" 
  ON public.live_messages FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users inserem sua msg" ON public.live_messages;
CREATE POLICY "Users inserem sua msg" 
  ON public.live_messages FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = profile_id);

-- 2. Garantir que a tabela profiles permite UPSERT do frontend
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Enable upsert for owners" ON public.profiles;
CREATE POLICY "Enable upsert for owners" 
  ON public.profiles FOR ALL 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Função e Trigger de Sincronização Automática (BACKEND)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, avatar_url, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário'), 
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'), 
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    nome_completo = EXCLUDED.nome_completo,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Backfill: Sincronizar usuários órfãos
INSERT INTO public.profiles (id, nome_completo, avatar_url, email)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Usuário'), 
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'), 
  email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Recarregar Cache do Schema
NOTIFY pgrst, 'reload schema';
