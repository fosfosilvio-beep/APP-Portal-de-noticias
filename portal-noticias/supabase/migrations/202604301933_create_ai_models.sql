-- 📐 Tabela de Gestão de Modelos de IA
-- Objetivo: Centralizar versões (v1/v1beta) e modelos ativos

CREATE TABLE IF NOT EXISTS public.ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- ex: 'gemini-1.5-pro-latest'
    api_version TEXT NOT NULL DEFAULT 'v1', -- ex: 'v1' ou 'v1beta'
    provider TEXT NOT NULL DEFAULT 'gemini', -- ex: 'gemini', 'twelve-labs'
    is_active BOOLEAN DEFAULT true,
    capabilities JSONB DEFAULT '[]', -- ex: ['video', 'text', 'image']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Inicial conforme diagnóstico
INSERT INTO public.ai_models (name, api_version, provider, capabilities)
VALUES 
('gemini-1.5-pro-latest', 'v1', 'gemini', '["text", "video", "image"]'),
('gemini-1.5-flash', 'v1', 'gemini', '["text", "video"]'),
('pegasus1', 'v1.2', 'twelve-labs', '["video"]')
ON CONFLICT (name) DO UPDATE 
SET api_version = EXCLUDED.api_version,
    capabilities = EXCLUDED.capabilities;

-- Habilitar RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler (SELECT), apenas Admins podem escrever
CREATE POLICY "Public Read ai_models" ON public.ai_models FOR SELECT USING (true);
CREATE POLICY "Admin Write ai_models" ON public.ai_models ALL 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
