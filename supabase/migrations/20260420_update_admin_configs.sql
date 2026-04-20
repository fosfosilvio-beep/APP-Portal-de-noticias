-- Migration: Update configuracao_portal for Enterprise Admin
-- Description: Adds columns for IA, Social Hub, and Live/Bifurcation control.

ALTER TABLE configuracao_portal 
ADD COLUMN IF NOT EXISTS openrouter_api_key TEXT,
ADD COLUMN IF NOT EXISTS facebook_page_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_channel_url TEXT,
ADD COLUMN IF NOT EXISTS url_live_youtube TEXT,
ADD COLUMN IF NOT EXISTS mostrar_live_facebook BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS alerta_urgente_texto TEXT,
ADD COLUMN IF NOT EXISTS alerta_urgente_ativo BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS modo_manutencao BOOLEAN DEFAULT FALSE;

-- Documentation comments
COMMENT ON COLUMN configuracao_portal.openrouter_api_key IS 'Chave de API do OpenRouter para o Copiloto IA';
COMMENT ON COLUMN configuracao_portal.facebook_page_url IS 'URL da página do Facebook para o widget da Home';
COMMENT ON COLUMN configuracao_portal.youtube_channel_url IS 'URL do canal/playlist para a seção Biblioteca';
COMMENT ON COLUMN configuracao_portal.url_live_youtube IS 'URL específica da live no YouTube';
COMMENT ON COLUMN configuracao_portal.mostrar_live_facebook IS 'Flag para priorizar player do Facebook no modo Live';
COMMENT ON COLUMN configuracao_portal.alerta_urgente_texto IS 'Texto que aparecerá na barra de Breaking News';
COMMENT ON COLUMN configuracao_portal.alerta_urgente_ativo IS 'Define se o alerta urgente deve ser exibido';
COMMENT ON COLUMN configuracao_portal.modo_manutencao IS 'Define se o site deve entrar em modo de manutenção';
