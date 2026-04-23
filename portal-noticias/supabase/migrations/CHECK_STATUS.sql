-- ============================================================================
-- CHECK DATABASE STATUS — Inspecionar estado atual do banco
-- Execute no Supabase Dashboard → SQL Editor → New query
-- Versão simplificada usando apenas information_schema (mais portável)
-- ============================================================================

-- 1. LISTAR TODAS AS TABELAS E COLUNAS PÚBLICAS (mais confiável)
SELECT
  '📋 TABELAS E COLUNAS' as section,
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'news_statuses', 'categorias', 'news_drafts',
    'ad_impressions', 'ad_clicks', 'page_layout',
    'page_layout_versions', 'page_templates', 'page_comments',
    'user_roles', 'admin_actions', 'ad_slots', 'biblioteca_lives', 'noticias'
  )
ORDER BY table_name, ordinal_position;
