# Setup Supabase — Portal de Notícias

## Pré-requisitos

- Conta Supabase criada
- Project ID e URLs configuradas em `.env.local`
- CLI Supabase instalado: `npm install -g supabase`

## Variáveis de Ambiente

Criar `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]
```

Obter chaves em: **Supabase Dashboard** → **Settings** → **API** → **Project API keys**

## Aplicar Migrations

### Opção 1: Via Dashboard Supabase (recomendado)

1. Abra [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Selecione seu project
3. Vá para **SQL Editor**
4. Clique em **New query**
5. Cole todo conteúdo de `migrations/01_phase0_setup.sql`
6. Clique **Run**

### Opção 2: Via CLI (se conectado)

```bash
supabase db push
```

## Verificar Tabelas Criadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Esperadas: `page_layout`, `page_layout_versions`, `page_templates`, `page_comments`, `user_roles`, `admin_actions` (nas próximas fases).

## Gerar/Atualizar Types

```bash
npx supabase gen types typescript --project-id [PROJECT_ID] --schema public > src/types/database.ts
```

Ou use a chave auth diretamente:

```bash
npx supabase gen types typescript \
  --db-url "postgresql://postgres:[PASSWORD]@[SUPABASE_HOST]:5432/postgres" \
  --schema public \
  > src/types/database.ts
```

## RLS (Row Level Security) — Ativação

RLS já vem ativado nas policies das migrations. Para verificar:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

Esperado: `t` (true) em todas as tabelas criadas.

## User Roles Table (opcional — necessária a partir da Fase 6)

```sql
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','autor','revisor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed admin role (substitua [USER_ID] pela UUID do seu usuário no auth.users)
INSERT INTO user_roles (user_id, role)
VALUES ('[USER_ID]', 'admin')
ON CONFLICT DO NOTHING;
```

## Verificação em Localhost

Após setup, testar conexão:

```bash
npm run dev
```

Vá para `/admin` e verifique se carrega sem erros. Cheque browser DevTools → Network para confirmar queries Supabase.

## Troubleshooting

### ❌ "Invalid JWT"
→ Verifique `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correto em `.env.local`

### ❌ "Error creating page_layout"
→ RLS bloqueando. Verifique user está logado e tem role 'admin' ou 'editor'.

### ❌ "404 table not found"
→ Migrations não foram rodadas. Execute SQL em Supabase Dashboard.

### ❌ TypeScript errors em `src/types/database.ts`
→ Regenre tipos: `npx supabase gen types typescript --project-id [ID] > src/types/database.ts`

## Queries Principais (cliente)

### Buscar home layout publicado

```typescript
import { supabaseBrowser } from '@/lib/supabase-browser';

const { data, error } = await supabaseBrowser
  .from('page_layout')
  .select('*')
  .eq('slug', 'home')
  .single();
```

### Salvar rascunho

```typescript
await supabaseBrowser
  .from('page_layout')
  .upsert({ slug: 'home', draft_data: jsonData })
  .eq('slug', 'home');
```

### Listar versões publicadas

```typescript
const { data } = await supabaseBrowser
  .from('page_layout_versions')
  .select('*')
  .eq('page_layout_id', pageId)
  .order('published_at', { ascending: false })
  .limit(10);
```

## Server-side Queries (SSR + Route Handlers)

```typescript
import { supabaseServer } from '@/lib/supabase-server';

// Em Server Component ou Route Handler
const { data } = await supabaseServer()
  .from('page_layout')
  .select('published_data')
  .eq('slug', 'home')
  .single();
```

Usar `supabaseServer()` em server-side código (não expõe chaves ao frontend).

## Realtime Subscriptions (Fase 2+)

```typescript
const channel = supabaseBrowser
  .channel('page_layout:updates')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'page_layout' },
    (payload) => console.log('Updated:', payload)
  )
  .subscribe();
```

---

**Última atualização**: 2026-04-22
**Depende de**: Fase 0.1 concluída
