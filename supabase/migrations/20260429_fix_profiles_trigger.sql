-- ====================================================================
-- MIGRAÇÃO: Garantia de Perfis e Trigger de Sincronização
-- Data: 2026-04-29
-- Objetivo: Resolver o erro de Foreign Key no Chat Nativo
-- ====================================================================

-- 1. Garantir que a tabela profiles existe e tem os campos corretos
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_completo TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Habilitar RLS e criar políticas de acesso
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can upsert their own profile." ON public.profiles;
CREATE POLICY "Users can upsert their own profile." ON public.profiles FOR ALL USING (auth.uid() = id);

-- 3. Função de Sincronização (Handle New User)
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

-- 4. Re-criar o Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. BACKFILL: Criar perfis para usuários que já existem mas não têm perfil
INSERT INTO public.profiles (id, nome_completo, avatar_url, email)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Usuário'), 
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'), 
  email
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 6. Recarregar Schema
NOTIFY pgrst, 'reload schema';
