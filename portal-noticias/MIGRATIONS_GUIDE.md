# 🚀 Guia Prático — Aplicar Migrations Supabase

## 📋 Migrations Pendentes

Você tem **15 migrations** prontas em `supabase/migrations/` (v5 a v15). A **v15 é a última** e consolidada com todas as Fases 0–6.

### Lista de Migrations
```
✓ 20260421_plantao_policial.sql           (TTS base)
✓ 20260421_v5_infra_stabilization.sql    (Infra)
✓ 20260421_v6_podcasts_system.sql        (Podcasts)
✓ 20260421_v7_podcast_trimming.sql       (Podcast cleanup)
✓ 20260421_v8_podcast_engagement.sql     (Engagement)
✓ 20260421_v9_tables_sync.sql            (Sync)
✓ 20260422_v10_phase_2b_tables.sql       (Fase 2B)
✓ 20260422_v11_phase_3_ads.sql           (Fase 3)
✓ 20260422_v12_phase_4_analytics.sql     (Fase 4)
✓ 20260422_v13_phase_5_puck.sql          (Fase 5)
✓ 20260422_v14_phase_6_governance.sql    (Fase 6)
✓ 20260422_v15_categorias_drafts_flags.sql (Consolidação final)
```

---

## ✅ Opção 1: Dashboard Supabase (Recomendado — 5 minutos)

### Passo a passo

1. **Abra o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/projects
   - Selecione seu project ("Nossa Web TV")

2. **Vá para SQL Editor**
   - Left sidebar → **SQL Editor**
   - Clique em **+ New query**

3. **Copie a migration**
   - Abra arquivo `supabase/migrations/20260422_v15_categorias_drafts_flags.sql`
   - Copie **TODO** o conteúdo

4. **Cole e execute**
   - Cole no SQL Editor do Supabase
   - Clique em botão azul **Run** (ou `Ctrl+Enter`)

5. **Repita** para cada migration (opcional — as maiores já estão em v15)

### ⚡ Atalho — Executar tudo de uma vez

Se quiser rodar tudo em um query único:

1. Crie um novo query no SQL Editor
2. Cole TUDO isso:

```sql
-- Migrations consolidadas v5-v15
-- Execute tudo de uma vez

-- ============================================================================
-- v10: Phase 2B Tables (admin modules)
-- ============================================================================
-- [Cole conteúdo de 20260422_v10_phase_2b_tables.sql aqui]

-- ============================================================================
-- v11: Phase 3 Ads (Ad Manager)
-- ============================================================================
-- [Cole conteúdo de 20260422_v11_phase_3_ads.sql aqui]

-- ============================================================================
-- v12: Phase 4 Analytics (Ad tracking)
-- ============================================================================
-- [Cole conteúdo de 20260422_v12_phase_4_analytics.sql aqui]

-- ============================================================================
-- v13: Phase 5 Puck (Page Builder)
-- ============================================================================
-- [Cole conteúdo de 20260422_v13_phase_5_puck.sql aqui]

-- ============================================================================
-- v14: Phase 6 Governance (Auth + Roles)
-- ============================================================================
-- [Cole conteúdo de 20260422_v14_phase_6_governance.sql aqui]

-- ============================================================================
-- v15: Categorias + News Drafts + Flags (Final Consolidation)
-- ============================================================================
-- [Cole conteúdo de 20260422_v15_categorias_drafts_flags.sql aqui]
```

3. Clique **Run**

### ⚠️ Erros comuns

| Erro | Solução |
|---|---|
| `Permission denied` | Verifique se está usando **Service Role Key** (não Anon Key) |
| `Table already exists` | Tabela já foi criada. Ignora ou use `CREATE TABLE IF NOT EXISTS` |
| `Foreign key constraint failed` | Execute migrations em ordem (v10 → v15) |

---

## ✅ Opção 2: Supabase CLI (Automático)

Se você tem **supabase-cli** instalado:

```bash
# 1. Instalar (se não tiver)
npm install -g supabase

# 2. Conectar ao seu project
supabase link --project-ref ywsvdgzfmvecaoejtlxo

# 3. Rodar migrations
supabase db push

# 4. Verificar status
supabase db migrations list
```

**Vantagem**: Automático e rastreável
**Desvantagem**: Requer CLI instalado

---

## ✅ Opção 3: psql (PostgreSQL Client)

Se você tem **psql** instalado (macOS/Linux/Windows WSL):

```bash
# 1. Extrair connection string
# Vá em Supabase Dashboard → Settings → Database → Connection string
# Use "Session" (não Pooler para migrations)

# 2. Conectar e rodar
psql "postgresql://postgres:[PASSWORD]@ywsvdgzfmvecaoejtlxo.supabase.co:5432/postgres" \
  < supabase/migrations/20260422_v15_categorias_drafts_flags.sql

# 3. Ou rodar todas de uma vez
cd supabase/migrations
for file in $(ls -1 *.sql | sort); do
  echo "Executando $file..."
  psql "postgresql://..." < "$file"
done
```

**Vantagem**: Mais rápido, rodas localmente
**Desvantagem**: Requer PostgreSQL client + senha

---

## ✅ Opção 4: Node.js Script (Não recomendado)

Preparei scripts em `scripts/`:

```bash
node scripts/run-migrations.js
# ou
bash scripts/apply-migrations.sh
```

⚠️ **Limitação**: Supabase JS SDK não suporta execução de SQL direto. Use Opções 1–3.

---

## 🔧 Pós-Execução

Após rodar as migrations:

### 1️⃣ Seed Admin Role (obrigatório)

```sql
-- Execute no SQL Editor do Supabase
INSERT INTO public.user_roles (user_id, role)
VALUES (
  '[SUBSTITUA_COM_SEU_USER_ID]',  -- Do auth.users
  'admin'
)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

**Como achar seu USER_ID**:
- Supabase Dashboard → **Authentication** → **Users**
- Copie a coluna "ID" do seu usuário

### 2️⃣ Ativar Feature Flag (recomendado)

```sql
UPDATE public.configuracao_portal
SET ui_settings = ui_settings || '{
  "use_puck_home": true,
  "use_categories": true,
  "use_news_drafts": true
}'::jsonb
WHERE id = 1;
```

### 3️⃣ Publicar Layout Inicial (opcional)

```sql
INSERT INTO public.page_layout (slug, title, published_data, created_at)
VALUES (
  'home',
  'Home — Nossa Web TV',
  '{"blocks": []}',
  now()
)
ON CONFLICT (slug) DO UPDATE SET published_data = '{"blocks": []}';
```

### 4️⃣ Verificar Tabelas Criadas

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Esperadas: `page_layout`, `page_layout_versions`, `page_templates`, `page_comments`, `user_roles`, `admin_actions`, `ad_impressions`, `ad_clicks`, etc.

---

## 🧪 Testes Post-Deployment

Após migrations + seed:

```bash
# 1. Start dev server
npm run dev

# 2. Login em /admin
# Usuário: [seu email do auth]
# Password: [google/magic link]

# 3. Verificar admin carrega
# GET http://localhost:3000/admin
# Esperado: Dashboard com stats

# 4. Testar Puck Editor
# GET http://localhost:3000/admin/home-builder
# Esperado: Editor carrega com blocos

# 5. Verificar home renderiza Puck (se flag ativo)
# GET http://localhost:3000
# Esperado: Home renderiza com layout Puck ou fallback legado
```

---

## 📊 Checklist Pré-Deploy

- [ ] Migrations v10–v15 executadas no Supabase
- [ ] Admin role seedado com seu user_id
- [ ] Feature flag `use_puck_home` = true (opcional)
- [ ] Home layout inicial publicado (opcional)
- [ ] RLS ativado em todas tabelas (automático via migrations)
- [ ] `npm run build` passa
- [ ] `npm run dev` funciona
- [ ] `/admin` carrega sem erros
- [ ] `/admin/home-builder` carrega sem erros

---

## 🆘 Troubleshooting

### ❌ "Table doesn't exist" ao acessar `/admin`

**Causa**: Migrations não foram executadas
**Solução**: Execute Opção 1 ou 2 acima

### ❌ "Permission denied" ou "Invalid JWT"

**Causa**: SERVICE_ROLE_KEY incorreta ou expirada
**Solução**:
1. Supabase Dashboard → Settings → API
2. Copie chave **Service Role** (não Anon)
3. Atualize `.env.local`

### ❌ "Foreign key constraint failed"

**Causa**: Tabelas dependentes não existem
**Solução**: Execute migrations em ordem (v10 → v15)

### ❌ "RLS policy blocks insert/update"

**Causa**: Usuário não tem permissão via RLS
**Solução**:
1. Verifique `user_roles` tem entrada para seu user_id
2. Ou execute query como `service_role` (Supabase Dashboard)

### ❌ "use_puck_home not recognized"

**Causa**: Flag ainda não foi adicionado em `configuracao_portal`
**Solução**: Execute o seed de feature flag acima

---

## 📞 Suporte

Se erro não resolver:

1. **Logs**: Supabase Dashboard → **Logs** → verificar erros
2. **SQL Check**: Executar `SELECT * FROM pg_tables WHERE schemaname='public'`
3. **Reset (último recurso)**: Supabase oferece "Reset database" em Settings → Database

---

**Última atualização**: 2026-04-22
**Status**: Pronto para produção (opção 1–3)
