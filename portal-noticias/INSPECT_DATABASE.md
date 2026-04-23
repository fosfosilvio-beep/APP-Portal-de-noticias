# 🔍 Inspecionar Estado Atual do Banco de Dados

## Objetivo
Entender **exatamente** quais tabelas e colunas existem agora para depois corrigir as migrations.

## Passo 1: Copiar a query abaixo

```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

## Passo 2: Executar no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto ("Nossa Web TV")
3. Vá para **SQL Editor**
4. Click **+ New query**
5. Cole a query acima
6. Click **RUN**

## Passo 3: Analisar os resultados

O resultado vai mostrar **TODAS** as colunas de **TODAS** as tabelas. Procure por:

### Tabelas que NÃO devem existir ainda (se existem, precisam ser resetadas):
- `news_drafts` — deve estar VAZIA ou NÃO EXISTIR
- `ad_impressions` — deve estar VAZIA ou NÃO EXISTIR
- `ad_clicks` — deve estar VAZIA ou NÃO EXISTIR
- `page_layout` — pode existir com dados legados
- `news_statuses` — pode existir com dados legados
- `categorias` — pode existir com dados legados

### Para cada tabela existente, verificar se faltam colunas:

#### `news_drafts` (se existir, deve ter):
- ✓ id (uuid)
- ✓ user_id (uuid)
- ✓ noticia_id (uuid) ← verifique se existe
- ✓ data (jsonb)
- ✓ updated_at (timestamp)

#### `categorias` (se existir, deve ter):
- ✓ id (uuid)
- ✓ slug (text)
- ✓ nome (text)
- ✓ sort_order (int) ← verifique, pode estar como `ordem`
- ✓ cor (text)
- ✓ ativa (boolean)
- ✓ created_at (timestamp)

#### `news_statuses` (se existir, deve ter):
- ✓ id (uuid)
- ✓ name (text)
- ✓ label (text)
- ✓ description (text)
- ✓ color (text)
- ✓ display_order (int) ← verifique, pode estar como `order`

---

## 🆘 Se encontrar inconsistências

**Exemplo**: Se `categorias` existe mas `sort_order` não:
```sql
ALTER TABLE categorias ADD COLUMN sort_order INT DEFAULT 0;
```

**Exemplo**: Se `news_drafts` existe mas `noticia_id` não:
```sql
ALTER TABLE news_drafts ADD COLUMN noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE;
```

---

## ✅ Próximo passo

Compartilhe comigo a **contagem de linhas** de cada tabela e quais colunas faltam. Depois rodaremos 00_RUN_ALL.sql com confiança.
