-- ============================================================
-- MIGRAÇÃO: Reengenharia do Portal - 2026-04-21
-- Inclui: ui_settings, ads (is_sponsored/sponsor_id),
--         real_views, tabela notificacoes + trigger
-- ============================================================

-- 1.1 FIX: Garantir coluna ui_settings na configuracao_portal
ALTER TABLE configuracao_portal
  ADD COLUMN IF NOT EXISTS ui_settings JSONB DEFAULT '{}'::jsonb;

-- 1.2 ADS: Colunas de patrocínio na tabela noticias
ALTER TABLE noticias
  ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE;

ALTER TABLE noticias
  ADD COLUMN IF NOT EXISTS sponsor_id UUID NULL;

-- 1.3 VIEWS: Coluna de visualizações reais
ALTER TABLE noticias
  ADD COLUMN IF NOT EXISTS real_views INTEGER DEFAULT 0;

-- ============================================================
-- TABELA: notificacoes (In-App Notifications)
-- ============================================================
CREATE TABLE IF NOT EXISTS notificacoes (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  noticia_id  UUID    REFERENCES noticias(id) ON DELETE CASCADE,
  titulo      TEXT    NOT NULL,
  lido_por    UUID[]  DEFAULT '{}',          -- array de auth.uid que já leram
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Qualquer autenticado pode SELECT; nenhum usuário faz INSERT diretamente (trigger faz)
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notificacoes" ON notificacoes;
CREATE POLICY "anon_select_notificacoes"
  ON notificacoes FOR SELECT
  USING (true);

-- ============================================================
-- FUNÇÃO + TRIGGER: Disparar notificação ao inserir notícia
-- ============================================================
CREATE OR REPLACE FUNCTION fn_notificar_nova_noticia()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO notificacoes (noticia_id, titulo)
  VALUES (NEW.id, NEW.titulo);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_nova_noticia ON noticias;
CREATE TRIGGER trg_nova_noticia
  AFTER INSERT ON noticias
  FOR EACH ROW
  EXECUTE FUNCTION fn_notificar_nova_noticia();

-- ============================================================
-- FORCE SCHEMA CACHE RELOAD (Supabase)
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- RPC: Incrementar real_views de forma atômica (+1)
-- Chamada pelo endpoint: /api/track-view
-- ============================================================
CREATE OR REPLACE FUNCTION incrementar_views(p_noticia_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE noticias
    SET real_views = COALESCE(real_views, 0) + 1
    WHERE id = p_noticia_id;
END;
$$;

-- Garante que a função é pública (chamável via anon key)
GRANT EXECUTE ON FUNCTION incrementar_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION incrementar_views(UUID) TO authenticated;
