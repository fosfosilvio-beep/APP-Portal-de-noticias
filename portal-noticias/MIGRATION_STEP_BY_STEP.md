# 🚀 Migrations — Passo a Passo (Supabase SQL Editor)

## ⚠️ IMPORTANTE
- Copie **EXATAMENTE** uma query por vez
- **NÃO** execute múltiplas queries juntas
- Clique "Run without RLS" se o Supabase perguntar
- Aguarde mensagem de sucesso antes de próxima query

---

## Query 1: Criar news_statuses

**Copie isto:**
```sql
CREATE TABLE IF NOT EXISTS public.news_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  color TEXT DEFAULT '#gray',
  display_order INT DEFAULT 0
);
```

**Status**: Aguardando execução

---

## Query 2: Seed news_statuses

**Copie isto:**
```sql
INSERT INTO public.news_statuses (name, label, color, display_order) VALUES
  ('draft', 'Rascunho', '#yellow', 0),
  ('in_review', 'Em Revisão', '#blue', 1),
  ('scheduled', 'Agendado', '#purple', 2),
  ('published', 'Publicado', '#green', 3),
  ('archived', 'Arquivado', '#gray', 4)
ON CONFLICT (name) DO NOTHING;
```

**Esperado**: "0 rows" (because ON CONFLICT)

---

## Query 3: Criar page_layout

**Copie isto:**
```sql
CREATE TABLE IF NOT EXISTS public.page_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT NULL,
  draft_data JSONB DEFAULT NULL,
  published_data JSONB DEFAULT NULL,
  settings JSONB DEFAULT NULL,
  updated_by UUID DEFAULT NULL REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Query 4: Criar page_layout_versions

**Copie isto:**
```sql
CREATE TABLE IF NOT EXISTS public.page_layout_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_layout_id UUID NOT NULL REFERENCES public.page_layout(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  published_by UUID DEFAULT NULL REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  note TEXT DEFAULT NULL,
  diff_summary JSONB DEFAULT NULL
);
```

---

## Query 5: Criar page_templates

**Copie isto:**
```sql
CREATE TABLE IF NOT EXISTS public.page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT NULL,
  thumbnail_url TEXT DEFAULT NULL,
  data JSONB NOT NULL,
  created_by UUID DEFAULT NULL REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Query 6: Criar page_comments

**Copie isto:**
```sql
CREATE TABLE IF NOT EXISTS public.page_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_layout_id UUID NOT NULL REFERENCES public.page_layout(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  user_id UUID DEFAULT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  resolved_at TIMESTAMPTZ DEFAULT NULL,
  parent_id UUID DEFAULT NULL REFERENCES public.page_comments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Query 7: Criar índices

**Copie isto:**
```sql
CREATE INDEX IF NOT EXISTS idx_page_layout_slug ON public.page_layout(slug);
CREATE INDEX IF NOT EXISTS idx_page_layout_versions_page ON public.page_layout_versions(page_layout_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_comments_page ON public.page_comments(page_layout_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_comments_block ON public.page_comments(block_id);
```

---

## Query 8: Seed page_layout (home)

**Copie isto:**
```sql
INSERT INTO public.page_layout (slug, title, published_data, created_at)
VALUES ('home', 'Home — Nossa Web TV', '{"blocks": []}', now())
ON CONFLICT (slug) DO NOTHING;
```

---

## ✅ Verificação Final

**Copie isto:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' 
AND table_name IN ('news_statuses', 'page_layout', 'page_layout_versions', 'page_templates', 'page_comments')
ORDER BY table_name;
```

**Esperado resultado:**
```
page_comments
page_layout
page_layout_templates
page_layout_versions
news_statuses
```

---

## 📋 Checklist

- [ ] Query 1 executou ✓
- [ ] Query 2 executou ✓
- [ ] Query 3 executou ✓
- [ ] Query 4 executou ✓
- [ ] Query 5 executou ✓
- [ ] Query 6 executou ✓
- [ ] Query 7 executou ✓
- [ ] Query 8 executou ✓
- [ ] Verificação final = 5 tabelas

---

**Após completar**: execute `npm run dev` e teste `http://localhost:3000/admin`
