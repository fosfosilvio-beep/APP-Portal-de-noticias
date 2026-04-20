-- 20260420_add_ui_settings.sql
-- Adiciona a coluna ui_settings JSONB na tabela configuracao_portal para armazenar metadados do Design System e Branding.

ALTER TABLE public.configuracao_portal 
ADD COLUMN IF NOT EXISTS ui_settings JSONB DEFAULT '{
  "logo_mode": "text",
  "logo_url": "",
  "brand_name": "NOSSA WEB TV",
  "font_family": "Inter",
  "font_weight": "font-black",
  "primary_color": "#00AEE0",
  "blur_level": 8,
  "widgets_visibility": {
    "weather": true,
    "giro24h": true,
    "plantao": true
  },
  "breaking_news_alert": {
    "text": "",
    "speed": "normal",
    "color": "red"
  }
}'::jsonb;

-- Atualizar o comentário da tabela para refletir a nova coluna
COMMENT ON COLUMN public.configuracao_portal.ui_settings IS 'Armazena configurações globais de UI e Branding (Logo, cores, alertas)';
