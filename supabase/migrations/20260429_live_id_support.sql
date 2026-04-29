-- ====================================================================
-- MIGRAÇÃO: Suporte a Live ID e Compartilhamento
-- Data: 2026-04-29
-- ====================================================================

-- 1. Adicionar live_id na tabela de mensagens para isolar o chat por live
ALTER TABLE public.live_messages ADD COLUMN IF NOT EXISTS live_id TEXT;

-- 2. Adicionar live_id na configuração global para rastrear a live ativa
ALTER TABLE public.configuracao_portal ADD COLUMN IF NOT EXISTS live_id TEXT;
ALTER TABLE public.portal_live_status ADD COLUMN IF NOT EXISTS live_id TEXT;

-- 3. Função para resetar o chat quando uma nova live for iniciada (Opcional, mas útil)
-- Aqui vamos apenas garantir que os campos existem. A lógica de "ID único" será feita no Admin/Front.

-- 4. Notificar cache
NOTIFY pgrst, 'reload schema';
