-- ============================================================================
-- CHECK DATABASE STATUS — Inspecionar estado atual do banco
-- Execute no Supabase Dashboard → SQL Editor → New query
-- ============================================================================

-- 1. LISTAR TODAS AS TABELAS E COLUNAS PÚBLICAS
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
    'user_roles', 'admin_actions', 'ad_slots', 'biblioteca_lives'
  )
ORDER BY table_name, ordinal_position;

-- 2. LISTAR TODAS AS TABELAS CRIADAS
SELECT
  '📊 TABELAS' as section,
  tablename as table_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.tablename AND c.table_schema = 'public') as column_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. VERIFICAR RLS (Row Level Security)
SELECT
  '🔐 RLS POLICIES' as section,
  tablename,
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. VERIFICAR ÍNDICES
SELECT
  '🔍 ÍNDICES' as section,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 5. CONTAR LINHAS EM TABELAS PRINCIPAIS
SELECT
  '📈 CONTAGEM DE LINHAS' as section,
  schemaname,
  tablename,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- 6. RESUMO FINAL
SELECT
  '✅ RESUMO' as check_type,
  'Tabelas criadas' as metric,
  (SELECT count(*) FROM information_schema.tables WHERE table_schema='public')::text as value
UNION ALL
SELECT
  '✅ RESUMO',
  'Colunas total',
  (SELECT count(*) FROM information_schema.columns WHERE table_schema='public')::text
UNION ALL
SELECT
  '✅ RESUMO',
  'Policies (RLS)',
  (SELECT count(*) FROM pg_policies WHERE schemaname='public')::text
UNION ALL
SELECT
  '✅ RESUMO',
  'Índices',
  (SELECT count(*) FROM pg_indexes WHERE schemaname='public')::text;
