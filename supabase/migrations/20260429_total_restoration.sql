-- ====================================================================
-- MIGRAÇÃO: RESTAURAÇÃO TOTAL DO CHAT (SQL TRIGGER + RLS)
-- Data: 2026-04-29
-- ====================================================================

-- 1. Garantir Tabela de Perfis e RLS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_completo TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert/update for owners" ON public.profiles;
CREATE POLICY "Enable insert/update for owners" ON public.profiles FOR ALL USING (auth.uid() = id);

-- 2. Garantir Tabela de Mensagens e RLS
CREATE TABLE IF NOT EXISTS public.live_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL,
  is_admin_msg BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read for all" ON public.live_messages;
CREATE POLICY "Enable read for all" ON public.live_messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.live_messages;
CREATE POLICY "Enable insert for authenticated users" ON public.live_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);

-- 3. TRIGGER: Sincronização Automática Auth -> Profiles (A solução definitiva)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, avatar_url, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Espectador'), 
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

-- 4. BACKFILL: Criar perfis para usuários existentes sem perfil
INSERT INTO public.profiles (id, nome_completo, avatar_url, email)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Espectador'), 
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'), 
  email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 5. Recarregar Cache
NOTIFY pgrst, 'reload schema';
