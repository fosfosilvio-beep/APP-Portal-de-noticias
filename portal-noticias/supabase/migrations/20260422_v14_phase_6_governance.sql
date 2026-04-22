CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','autor','revisor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- We might already have a 'status' column in 'noticias'. Let's check its existence.
-- We use a DO block to avoid errors if it exists.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noticias' AND column_name='status') THEN
    ALTER TABLE noticias ADD COLUMN status TEXT DEFAULT 'draft' CHECK (status IN ('draft','in_review','scheduled','published','archived'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noticias' AND column_name='publish_at') THEN
    ALTER TABLE noticias ADD COLUMN publish_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noticias' AND column_name='approved_by') THEN
    ALTER TABLE noticias ADD COLUMN approved_by UUID REFERENCES auth.users(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='noticias' AND column_name='approved_at') THEN
    ALTER TABLE noticias ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

CREATE TABLE admin_actions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
