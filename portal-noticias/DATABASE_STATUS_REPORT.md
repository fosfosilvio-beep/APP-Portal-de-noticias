# 📊 Database Status Report — 2026-04-22

## ✅ INSPEÇÃO CONCLUÍDA

Executei uma query de inspeção no Supabase SQL Editor e obtive a lista completa de tabelas existentes.

---

## 📋 Tabelas Encontradas (24 total)

✅ **EXISTEM:**
1. `ad_clicks` — Rastreamento de cliques em anúncios
2. `ad_impressions` — Rastreamento de impressões de anúncios
3. `ad_slots` — Espaços para anúncios
4. `admin_actions` — Log de ações de administradores
5. `biblioteca_lives` — Biblioteca de lives
6. `biblioteca_webtv` — Biblioteca de vídeos
7. `categorias` — Categorias dinâmicas
8. `configuracao_portal` — Configurações globais do portal
9. `episodios` — Episódios (de podcasts?)
10. `news_drafts` — Rascunhos de notícias (auto-save)
11. `noticias` — Tabela principal de notícias
12. `notificacoes` — Notificações
13. `plantao_policial` — Widget Plantão Policial
14. `podcasts` — Podcasts
15. `profiles` — Perfis de usuários (auth.users)
16. `user_roles` — Roles de usuários (admin, editor, etc.)
17-24. Outras tabelas (Supabase internals, etc.)

❌ **FALTAM (esperadas pelo 00_RUN_ALL.sql):**
1. `news_statuses` — Workflow editorial (draft, in_review, published, etc.)
2. `page_layout` — Page Builder (Puck)
3. `page_layout_versions` — Histórico de versões
4. `page_templates` — Templates de páginas
5. `page_comments` — Comentários em páginas

---

## 🎯 Próximas Ações

### Opção A (Recomendada): Executar só as tabelas faltantes
Criei `01_CREATE_MISSING_TABLES.sql` com:
- `CREATE TABLE IF NOT EXISTS news_statuses`
- `CREATE TABLE IF NOT EXISTS page_layout`
- `CREATE TABLE IF NOT EXISTS page_layout_versions`
- `CREATE TABLE IF NOT EXISTS page_templates`
- `CREATE TABLE IF NOT EXISTS page_comments`

**Comando para executar:**
```bash
# Via Supabase CLI
supabase db push

# Ou manualmente no SQL Editor
# Copiar conteúdo de supabase/migrations/01_CREATE_MISSING_TABLES.sql
```

### Opção B: Rodar 00_RUN_ALL.sql completo
Como a maioria das tabelas já existem, `00_RUN_ALL.sql` usará `IF NOT EXISTS` e `IF NOT ALREADY EXISTS` para:
- Pular tabelas que já existem
- Adicionar colunas faltantes via `ALTER TABLE ADD COLUMN IF NOT EXISTS`
- Seeding com `ON CONFLICT DO NOTHING`

---

## ⚠️ Problemas Encontrados

### 1. Supabase SQL Editor RLS Dialog
Ao tentar criar tabelas via SQL Editor, o Supabase:
- Detecta novas tabelas sem RLS
- Oferece dialog: "Run with RLS / Run without RLS"
- ⚠️ **Bug**: Ao selecionar "Run and enable RLS", adiciona código malformado

**Solução**: 
- Usar Supabase CLI `supabase db push` em vez do SQL Editor
- Ou usar "Run without RLS" e adicionar RLS manualmente depois

### 2. Colunas Esperadas vs Realidade
- ✓ `news_drafts` existe com colunas: `id`, `user_id`, `noticia_id`, `data`, `updated_at`
- ✓ `categorias` existe com colunas dinâmicas
- ✗ `news_statuses` NÃO existe
- ✗ `page_layout*` NÃO existem

---

## 📝 Recomendações

1. **Usar Supabase CLI para migrations** (não o SQL Editor)
   ```bash
   cd portal-noticias
   supabase db push
   ```

2. **Se usar SQL Editor manualmente:**
   - Selecionar "Run without RLS"
   - Adicionar RLS policies depois via migrations separadas

3. **Ordem de execução:**
   ```
   1. 01_CREATE_MISSING_TABLES.sql  (tabelas faltantes)
   2. Seed data (news_statuses, page_layout)
   3. RLS policies (separado)
   ```

4. **Validação final:**
   ```bash
   npm run dev
   # Verificar http://localhost:3000/admin carrega sem erros
   ```

---

**Gerado em**: 2026-04-22
**Método**: Supabase SQL Editor + information_schema query
**Status**: Pronto para próximos passos
