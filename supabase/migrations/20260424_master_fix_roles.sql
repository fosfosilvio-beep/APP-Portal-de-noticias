-- ============================================================
-- SCRIPT DEFINITIVO: Resolve RLS 500, Cria Colunista e Ajusta Roles
-- Execute no Supabase Dashboard → SQL Editor
-- Data: 2026-04-24
-- ============================================================

-- 1. EMERGÊNCIA: Remove TODAS as políticas de RLS que estão causando erro 500
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
  END LOOP;
END;
$$;

-- 2. Recria a constraint incluindo todos os roles válidos
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin', 'editor', 'revisor', 'autor', 'colunista'));

-- 3. Reabilita RLS com políticas SIMPLES (Garante que o erro 500 acabe)
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "service_manage_roles"
  ON public.user_roles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 4. Criação do usuário colunista (se não existir)
DO $$
DECLARE
  v_col_id UUID;
  v_admin_id UUID;
BEGIN
  -- Tenta achar o colunista
  SELECT id INTO v_col_id FROM auth.users WHERE email = 'colunista@gmail.com';
  
  -- Se não achar, cria!
  IF v_col_id IS NULL THEN
    INSERT INTO auth.users (
      id, email, encrypted_password, email_confirmed_at, role, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud
    ) VALUES (
      gen_random_uuid(), 'colunista@gmail.com', crypt('admin', gen_salt('bf')), NOW(), 
      'authenticated', '{"provider":"email","providers":["email"]}', '{"full_name":"Colunista Portal"}', NOW(), NOW(), 'authenticated'
    ) RETURNING id INTO v_col_id;
  END IF;

  -- Garante o role 'colunista'
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_col_id, 'colunista')
  ON CONFLICT (user_id) DO UPDATE SET role = 'colunista';

  -- Garante role admin para o dono
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'fosfosilvio@gmail.com';
  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
END;
$$;

-- 5. Verificação Final: Deve aparecer fosfosilvio@gmail.com (admin) E colunista@gmail.com (colunista)
SELECT u.email, r.role
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email IN ('colunista@gmail.com', 'fosfosilvio@gmail.com')
ORDER BY r.role;

NOTIFY pgrst, 'reload schema';
