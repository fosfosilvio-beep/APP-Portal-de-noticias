-- Assegura que as colunas necessárias existam em configuracao_portal
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='configuracao_portal' AND column_name='logo_url') THEN
        ALTER TABLE public.configuracao_portal ADD COLUMN logo_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='configuracao_portal' AND column_name='facebook_page_url') THEN
        ALTER TABLE public.configuracao_portal ADD COLUMN facebook_page_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='configuracao_portal' AND column_name='youtube_channel_url') THEN
        ALTER TABLE public.configuracao_portal ADD COLUMN youtube_channel_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='configuracao_portal' AND column_name='openrouter_api_key') THEN
        ALTER TABLE public.configuracao_portal ADD COLUMN openrouter_api_key TEXT;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
