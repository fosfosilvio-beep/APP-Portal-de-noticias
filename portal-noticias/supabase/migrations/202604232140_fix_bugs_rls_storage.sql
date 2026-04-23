-- Correção de Bug 2: Políticas RLS para a tabela user_roles
-- Permite que os usuários leiam apenas as próprias roles ou que administradores leiam todas
ALTER TABLE IF EXISTS user_roles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Users can read own roles'
  ) THEN
    CREATE POLICY "Users can read own roles"
    ON user_roles FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'Admins can read all roles'
  ) THEN
    CREATE POLICY "Admins can read all roles"
    ON user_roles FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
      )
    );
  END IF;
END $$;


-- Correção de Bug 3: Criação e configuração pública do bucket 'colunistas'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('colunistas', 'colunistas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public read access to colunistas bucket'
  ) THEN
    CREATE POLICY "Public read access to colunistas bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'colunistas');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload to colunistas'
  ) THEN
    CREATE POLICY "Authenticated users can upload to colunistas"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'colunistas' AND auth.role() = 'authenticated');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can update to colunistas'
  ) THEN
    CREATE POLICY "Authenticated users can update to colunistas"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'colunistas' AND auth.role() = 'authenticated');
  END IF;
END $$;
