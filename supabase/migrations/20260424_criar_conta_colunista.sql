-- ============================================================
-- PATCH: Adiciona 'colunista' e 'editor' à constraint de roles
-- Execute no Supabase Dashboard → SQL Editor
-- Data: 2026-04-24
-- ============================================================

-- 1. Remove a constraint restritiva existente
ALTER TABLE public.user_roles
  DROP CONSTRAINT IF EXISTS user_roles_role_check;

-- 2. Recria a constraint incluindo todos os roles válidos
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('admin', 'editor', 'revisor', 'autor', 'colunista'));

-- 3. Agora insere/atualiza o colunista (e-mail criado pelo Supabase Auth)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'colunista@gmail.com';

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'colunista')
    ON CONFLICT (user_id) DO UPDATE SET role = 'colunista';
    RAISE NOTICE 'Role colunista atribuído com sucesso (ID: %)', v_user_id;
  ELSE
    RAISE NOTICE 'Usuário colunista@gmail.com não encontrado — crie-o pelo Authentication > Users primeiro.';
  END IF;
END;
$$;

-- 4. Garante que o admin tem role 'admin'
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id FROM auth.users WHERE email = 'fosfosilvio@gmail.com';

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
    RAISE NOTICE 'Role admin garantido para fosfosilvio@gmail.com';
  END IF;
END;
$$;

-- 5. Verificação final
SELECT u.email, r.role
FROM auth.users u
LEFT JOIN public.user_roles r ON r.user_id = u.id
WHERE u.email IN ('colunista@gmail.com', 'fosfosilvio@gmail.com')
ORDER BY u.email;
