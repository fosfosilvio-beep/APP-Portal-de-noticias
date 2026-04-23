# 🔍 Verificar Status do Banco — Guia

## O Problema

Estamos tendo erros de colunas que não existem:
- `noticia_id` não existe
- `user_id` não existe
- etc.

**Causa**: Tabelas pré-existem com schema diferente do esperado.

---

## ✅ Solução: Rodar CHECK_STATUS.sql

### Passo 1: Abrir SQL Editor

1. Supabase Dashboard → **SQL Editor**
2. Click **+ New query**

### Passo 2: Executar Status Check

1. Abra arquivo: `supabase/migrations/CHECK_STATUS.sql`
2. Copie **TODO** o conteúdo
3. Cole no SQL Editor
4. Click **RUN**

### Passo 3: Analisar Resultados

O resultado mostrará:

```
📋 TABELAS E COLUNAS
│ table_name  │ column_name      │ data_type │
├─────────────┼──────────────────┼───────────┤
│ news_drafts │ id               │ uuid      │
│ news_drafts │ user_id          │ uuid      │
│ news_drafts │ data             │ jsonb     │
│ news_drafts │ updated_at       │ timestamp │
...

📊 TABELAS
│ table_name       │ column_count │
├──────────────────┼──────────────┤
│ categorias       │ 7            │
│ news_drafts      │ 4            │
...

✅ RESUMO
│ metric         │ value │
├────────────────┼───────┤
│ Tabelas        │ 12    │
│ Colunas total  │ 145   │
│ Policies (RLS) │ 8     │
```

---

## 📋 Checklist: O Que Procurar

Procure por essas tabelas e colunas:

### `news_drafts` deve ter:
- [ ] id (uuid)
- [ ] user_id (uuid) ← **faltando?**
- [ ] noticia_id (uuid) ← **faltando?**
- [ ] data (jsonb)
- [ ] updated_at (timestamp)

### `categorias` deve ter:
- [ ] id (uuid)
- [ ] slug (text)
- [ ] nome (text)
- [ ] sort_order (int) ← **faltando?**

### `news_statuses` deve ter:
- [ ] id (uuid)
- [ ] name (text)
- [ ] label (text)
- [ ] display_order (int) ← **faltando?**

### `page_layout` deve ter:
- [ ] id (uuid)
- [ ] slug (text)
- [ ] draft_data (jsonb)
- [ ] published_data (jsonb)

---

## 🆘 Se Colunas Faltam

**Se `user_id` falta em `news_drafts`:**

```sql
ALTER TABLE news_drafts 
ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
```

**Se `noticia_id` falta:**

```sql
ALTER TABLE news_drafts 
ADD COLUMN IF NOT EXISTS noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE;
```

**Se `sort_order` falta em `categorias`:**

```sql
ALTER TABLE categorias 
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
```

---

## 🔧 Opção: Clean Slate (Nuclear)

Se o banco está muito corrupto, você pode:

1. **Supabase Dashboard** → **Settings** → **Database**
2. Clique **Reset Database** (⚠️ DELETA TUDO)
3. Depois rodar `00_RUN_ALL.sql` do zero

---

## 📝 Próximas Etapas

1. Execute `CHECK_STATUS.sql`
2. Compartilhe comigo os resultados (ou screenshot)
3. Identificaremos exatamente o que falta
4. Corrigiremos com ALTER TABLE específicos

---

**Hora estimada**: 2 minutos (1 para executar, 1 para analisar)
