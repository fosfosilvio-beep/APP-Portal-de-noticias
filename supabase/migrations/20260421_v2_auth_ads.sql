-- ====================================================================
-- MIGRAÇÃO V2: Auth, Profiles e Ads Engine
-- ====================================================================

-- 1. Criação da Tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome_completo TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Visibilidade pública (necessário para ver nomes no chat), mas apenas o próprio usuário pode editar.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Função e Trigger para inserir profile automaticamente ao registrar no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, avatar_url, email)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 3. Criação da Tabela ad_slots (Motor de Publicidade Dinâmica)
CREATE TABLE IF NOT EXISTS public.ad_slots (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_slot    TEXT NOT NULL,
  posicao_html TEXT NOT NULL,          -- Ex: "footer_top", "sidebar_right", "header"
  dimensoes    TEXT,                   -- Ex: "728x90", "300x250"
  codigo_html_ou_imagem TEXT,          -- Pode conter a URL de uma imagem ou snippet HTML
  status_ativo BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir os slots padrões de fábrica
INSERT INTO public.ad_slots (nome_slot, posicao_html, dimensoes)
VALUES 
  ('Header / Topo', 'header_top', '728x90'),
  ('Sidebar / Lateral 1', 'sidebar_right_1', '300x250'),
  ('Sidebar / Lateral 2', 'sidebar_right_2', '300x400'),
  ('Rodapé / FooterBanner', 'footer_top', '728x90')
ON CONFLICT DO NOTHING;

-- RLS para ad_slots (Somente SELECT público)
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon Select AdSlots" ON public.ad_slots;
CREATE POLICY "Anon Select AdSlots" ON public.ad_slots FOR SELECT USING (true);


-- 4. Tabela de mensagens do chat ao vivo (Custom Supabase Chat)
CREATE TABLE IF NOT EXISTS public.live_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  conteudo TEXT NOT NULL CHECK (char_length(conteudo) > 0),
  is_admin_msg BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.live_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public pode ler msgs" ON public.live_messages;
CREATE POLICY "Public pode ler msgs" ON public.live_messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users inserem sua msg" ON public.live_messages;
CREATE POLICY "Users inserem sua msg" ON public.live_messages FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Notificar a plataforma
NOTIFY pgrst, 'reload schema';