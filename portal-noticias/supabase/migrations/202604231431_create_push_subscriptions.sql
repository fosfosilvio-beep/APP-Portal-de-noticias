-- Migration: Create Push Subscriptions Table
-- Description: Store browser push endpoints for real-time notifications

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso

-- 1. Qualquer pessoa (anônima ou logada) pode se inscrever
CREATE POLICY "Enable insert for everyone" 
ON public.push_subscriptions FOR INSERT 
WITH CHECK (true);

-- 2. Administradores podem visualizar e gerenciar todas as inscrições
CREATE POLICY "Admins can manage push subscriptions" 
ON public.push_subscriptions FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
);
