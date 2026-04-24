-- ============================================================
-- SCRIPT: Criar conta colunista e corrigir roles de admin
-- Execute no Supabase Dashboard → SQL Editor
-- Data: 2026-04-24
-- ============================================================
-- ATENÇÃO: Este script usa a função auth.users — execute como
-- service_role (o SQL Editor do Supabase já tem acesso).
-- ============================================================

-- ============================================================
-- PASSO 1: Garantir que a tabela user_roles existe com RLS correto
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'autor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Permite que usuário autenticado leia seu próprio role (necessário para o login/page.tsx)
DROP POLICY IF EXISTS "User reads own role" ON public.user_roles;
CREATE POLICY "User reads own role"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin pode gerenciar todos os roles (ajuste o e-mail conforme necessário)
DROP POLICY IF EXISTS "Admin manages roles" ON public.user_roles;
CREATE POLICY "Admin manages roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ============================================================
-- PASSO 2: Criar conta do colunista via auth.users
-- (Supabase cria o usuário sem precisar de e-mail de confirmação)
-- ============================================================
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verifica se o usuário já existe
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'colunista@gmail.com';

  IF v_user_id IS NULL THEN
    -- Cria o usuário com senha definida
    INSERT INTO auth.users (
      id,
      email,
      encrypted_password,
      email_confirmed_at,
      role,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      aud
    ) VALUES (
      gen_random_uuid(),
      'colunista@gmail.com',
      crypt('admin', gen_salt('bf')),  -- senha: admin
      NOW(),                           -- e-mail já confirmado
      'authenticated',
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Colunista Portal"}',
      NOW(),
      NOW(),
      'authenticated'
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE 'Usuário colunista criado com ID: %', v_user_id;
  ELSE
    -- Atualiza a senha caso já exista
    UPDATE auth.users
    SET encrypted_password = crypt('admin', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
        updated_at = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE 'Usuário colunista já existia (ID: %) — senha atualizada.', v_user_id;
  END IF;

  -- ============================================================
  -- PASSO 3: Inserir/atualizar role como 'colunista'
  -- ============================================================
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'colunista')
  ON CONFLICT (user_id) DO UPDATE SET role = 'colunista';

  RAISE NOTICE 'Role "colunista" atribuído ao usuário.';
END;
$$;

-- ============================================================
-- PASSO 4: Garantir que o admin tem role 'admin' na tabela
-- (Substitua pelo e-mail real do admin)
-- ============================================================
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'fosfosilvio@gmail.com';  -- ← e-mail do admin real

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

    RAISE NOTICE 'Role "admin" garantido para fosfosilvio@gmail.com';
  ELSE
    RAISE NOTICE 'Admin não encontrado — faça login uma vez antes de rodar este script.';
  END IF;
END;
$$;

-- ============================================================
-- PASSO 5: Verificar resultado
-- ============================================================
SELECT
  u.email,
  r.role,
  u.email_confirmed_at IS NOT NULL AS email_confirmado
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email IN ('colunista@gmail.com', 'fosfosilvio@gmail.com')
ORDER BY u.email;

NOTIFY pgrst, 'reload schema';
