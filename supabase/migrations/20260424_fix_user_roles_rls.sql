-- ============================================================
-- EMERGÊNCIA: Reset total da RLS em user_roles
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Remove TODAS as políticas existentes (elimina conflitos)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'user_roles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_roles', pol.policyname);
    RAISE NOTICE 'Removida policy: %', pol.policyname;
  END LOOP;
END;
$$;

-- 2. Desabilita RLS temporariamente para limpar
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 3. Corrige a constraint de roles (remove e recria)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin', 'editor', 'revisor', 'autor', 'colunista'));

-- 4. Reabilita RLS com políticas limpas e simples
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política única: qualquer autenticado pode ler qualquer role
-- (simples, sem função, sem risco de loop ou 500)
CREATE POLICY "authenticated_read_roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (true);

-- Service role pode fazer tudo (para inserts do SQL Editor)
CREATE POLICY "service_manage_roles"
  ON public.user_roles FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5. Garante role admin para o dono do sistema
DO $$
DECLARE
  v_id UUID;
BEGIN
  -- Admin principal
  SELECT id INTO v_id FROM auth.users WHERE email = 'fosfosilvio@gmail.com';
  IF v_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    RAISE NOTICE 'Admin: fosfosilvio@gmail.com (%)' , v_id;
  END IF;

  -- Colunista
  SELECT id INTO v_id FROM auth.users WHERE email = 'colunista@gmail.com';
  IF v_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_id, 'colunista')
    ON CONFLICT (user_id) DO UPDATE SET role = 'colunista';
    RAISE NOTICE 'Colunista: colunista@gmail.com (%)' , v_id;
  END IF;
END;
$$;

-- 6. Verificação
SELECT u.email, r.role
FROM auth.users u
JOIN public.user_roles r ON r.user_id = u.id
ORDER BY r.role;

NOTIFY pgrst, 'reload schema';
