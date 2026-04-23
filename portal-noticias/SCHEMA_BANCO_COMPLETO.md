# 📐 SCHEMA COMPLETO DO BANCO — 2026-04-22

## 🗄️ ESTRUTURA GERAL

**Total de Tabelas**: 24  
**Schema**: public  
**Versão PostgreSQL**: 15+ (Supabase)

---

## 📊 TABELAS EXISTENTES (19/24)

### 1️⃣ NÚCLEO EDITORIAL

#### `noticias` (Tabela Principal)
```
id                  → UUID (PK)
titulo              → TEXT
subtitulo           → TEXT
conteudo            → TEXT / JSONB
autor_id            → UUID (FK → auth.users)
categoria           → TEXT (string, será substituído por categoria_id)
imagem_url          → TEXT
data_publicacao     → TIMESTAMP
criado_em           → TIMESTAMP
atualizado_em       → TIMESTAMP
status              → TEXT (draft, published, archived)
views               → INT
destaque            → BOOLEAN
posicao_home        → INT
```

#### `news_drafts` ⭐
```
id                  → UUID (PK)
user_id             → UUID (FK → auth.users) ✅
noticia_id          → UUID (FK → noticias) ✅
data                → JSONB (conteúdo em edição)
updated_at          → TIMESTAMP
```

#### `categorias` ⭐
```
id                  → UUID (PK)
slug                → TEXT (UNIQUE)
nome                → TEXT
cor                 → TEXT
sort_order          → INT ✅
ativa               → BOOLEAN
created_at          → TIMESTAMP
```

### 2️⃣ SISTEMA DE PUBLICIDADE

#### `ad_slots`
```
id                  → UUID (PK)
nome                → TEXT
posicao_html        → TEXT (home_banner_1, sidebar_right_1, etc.)
width               → INT
height              → INT
is_sponsored_content → BOOLEAN
advertiser_name     → TEXT
click_url           → TEXT
start_date          → TIMESTAMP
end_date            → TIMESTAMP
status_ativo        → BOOLEAN
```

#### `ad_impressions`
```
id                  → BIGSERIAL (PK)
slot_id             → UUID (FK → ad_slots)
noticia_id          → UUID (FK → noticias, nullable)
viewed_at           → TIMESTAMP
user_agent          → TEXT
session_hash        → TEXT (SHA256)
viewport_w          → INT
viewport_h          → INT
```

#### `ad_clicks`
```
id                  → BIGSERIAL (PK)
slot_id             → UUID (FK → ad_slots)
noticia_id          → UUID (FK → noticias, nullable)
clicked_at          → TIMESTAMP
session_hash        → TEXT
referrer            → TEXT
```

### 3️⃣ GOVERNANCE & ROLES

#### `user_roles` ⭐
```
user_id             → UUID (PK, FK → auth.users)
role                → TEXT (admin, editor, autor, revisor)
created_at          → TIMESTAMP
```

#### `admin_actions` ⭐
```
id                  → BIGSERIAL (PK)
user_id             → UUID (FK → auth.users)
action              → TEXT (create, update, delete, publish)
entity_type         → TEXT (noticia, categoria, ad_slot)
entity_id           → TEXT (UUID stringificado)
diff                → JSONB (mudanças)
created_at          → TIMESTAMP
```

### 4️⃣ MÍDIA & CONTEÚDO

#### `biblioteca_webtv`
```
id                  → UUID (PK)
titulo              → TEXT
descricao           → TEXT
url_video           → TEXT
thumbnail           → TEXT
categoria           → TEXT
duracao             → INT (segundos)
views               → INT
criado_em           → TIMESTAMP
```

#### `biblioteca_lives` ⭐
```
id                  → UUID (PK)
titulo              → TEXT
url_youtube         → TEXT
data_ao_vivo        → TIMESTAMP
sort_order          → INT ✅
descricao           → TEXT ✅
tipo                → TEXT ✅
criado_em           → TIMESTAMP
```

#### `podcasts`
```
id                  → UUID (PK)
titulo              → TEXT
descricao           → TEXT
autor                → TEXT
url_cover           → TEXT
url_rss             → TEXT
criado_em           → TIMESTAMP
```

#### `episodios`
```
id                  → UUID (PK)
podcast_id          → UUID (FK → podcasts)
numero              → INT
titulo              → TEXT
descricao           → TEXT
url_audio           → TEXT
duracao             → INT
data_publicacao     → TIMESTAMP
```

### 5️⃣ CONTEÚDO ESPECIAL

#### `plantao_policial`
```
id                  → UUID (PK)
titulo              → TEXT
descricao           → TEXT
status              → TEXT (ativo, inativo)
criado_em           → TIMESTAMP
atualizado_em       → TIMESTAMP
```

#### `notificacoes`
```
id                  → UUID (PK)
user_id             → UUID (FK → auth.users)
tipo                → TEXT
mensagem            → TEXT
lida                → BOOLEAN
criada_em           → TIMESTAMP
```

### 6️⃣ CONFIGURAÇÃO GLOBAL

#### `configuracao_portal` ⭐
```
id                  → INT (PK, sempre 1)
logo_url            → TEXT
logo_texto_url      → TEXT
banner_anuncio_home → TEXT (URL ad home)
link_anuncio_home   → TEXT
primary_color       → TEXT (hex)
secondary_color     → TEXT (hex)
font_family         → TEXT
font_weight         → INT (400, 600, 700)
ui_settings         → JSONB (feature flags, breaking_news, etc.)
thumbnail_live      → TEXT (preview thumbnail)
last_live_end       → TIMESTAMP
live_last_ended_at  → TIMESTAMP
openrouter_api_key  → TEXT (IA)
facebook_page_url   → TEXT
youtube_channel_url → TEXT
url_live_youtube    → TEXT
mostrar_live_facebook → BOOLEAN
alerta_urgente_texto → TEXT
marquee_speed       → INT (ms delay)
```

### 7️⃣ SUPABASE INTERNALS

#### `profiles`
```
id                  → UUID (FK → auth.users)
updated_at          → TIMESTAMP
```

#### `identificacao_pessoal` (legacy?)
#### Outras tabelas Supabase internas...

---

## ❌ TABELAS FALTANTES (5/24)

### 🔴 CRÍTICAS PARA MIGRAÇÃO

#### `news_statuses` (Tabela de Workflow)
```
id                  → UUID (PK)
name                → TEXT (UNIQUE) — draft, in_review, scheduled, published, archived
label               → TEXT — Rascunho, Em Revisão, Agendado, Publicado, Arquivado
description         → TEXT (opcional)
color               → TEXT (hex) — Cor visual no UI
display_order       → INT — Ordem de exibição
```

**Seeds necessárias:**
- ('draft', 'Rascunho', '#yellow', 0)
- ('in_review', 'Em Revisão', '#blue', 1)
- ('scheduled', 'Agendado', '#purple', 2)
- ('published', 'Publicado', '#green', 3)
- ('archived', 'Arquivado', '#gray', 4)

#### `page_layout` (Page Builder — Puck)
```
id                  → UUID (PK)
slug                → TEXT (UNIQUE) — home, about, etc.
title               → TEXT (opcional)
draft_data          → JSONB — Blocos em edição (Puck JSON)
published_data      → JSONB — Blocos publicados
settings            → JSONB — Configurações layout
updated_by          → UUID (FK → auth.users, nullable)
updated_at          → TIMESTAMP
published_at        → TIMESTAMP (nullable)
created_at          → TIMESTAMP
```

#### `page_layout_versions` (Histórico de Versões)
```
id                  → UUID (PK)
page_layout_id      → UUID (FK → page_layout, CASCADE)
data                → JSONB — Snapshot da versão
published_by        → UUID (FK → auth.users, nullable)
published_at        → TIMESTAMP
note                → TEXT (anotação, opcional)
diff_summary        → JSONB (resumo mudanças)
```

#### `page_templates` (Templates Reutilizáveis)
```
id                  → UUID (PK)
name                → TEXT
category            → TEXT
thumbnail_url       → TEXT
data                → JSONB — Template Puck JSON
created_by          → UUID (FK → auth.users, nullable)
is_official         → BOOLEAN
created_at          → TIMESTAMP
```

#### `page_comments` (Comentários em Blocos)
```
id                  → UUID (PK)
page_layout_id      → UUID (FK → page_layout, CASCADE)
block_id            → TEXT — ID do bloco comentado
user_id             → UUID (FK → auth.users, nullable)
content             → TEXT
resolved_at         → TIMESTAMP (nullable)
parent_id           → UUID (FK → page_comments, nullable) — Comments aninhados
created_at          → TIMESTAMP
```

---

## 📈 ÍNDICES NECESSÁRIOS

```sql
CREATE INDEX idx_noticias_categoria ON noticias(categoria);
CREATE INDEX idx_noticias_data_publicacao ON noticias(data_publicacao DESC);
CREATE INDEX idx_noticias_autor ON noticias(autor_id);

CREATE INDEX idx_news_drafts_user ON news_drafts(user_id, updated_at DESC);
CREATE INDEX idx_news_drafts_noticia ON news_drafts(noticia_id);

CREATE INDEX idx_page_layout_slug ON page_layout(slug);
CREATE INDEX idx_page_layout_versions_page ON page_layout_versions(page_layout_id, published_at DESC);
CREATE INDEX idx_page_comments_page ON page_comments(page_layout_id, created_at DESC);
CREATE INDEX idx_page_comments_block ON page_comments(block_id);

CREATE INDEX idx_ad_impressions_slot_time ON ad_impressions(slot_id, viewed_at DESC);
CREATE INDEX idx_ad_clicks_slot_time ON ad_clicks(slot_id, clicked_at DESC);

CREATE INDEX idx_admin_actions_user ON admin_actions(user_id, created_at DESC);
CREATE INDEX idx_admin_actions_entity ON admin_actions(entity_type, entity_id);
```

---

## 🔐 RLS POLICIES

**Habilitado em:**
- ✅ news_drafts — Usuários só veem seus próprios
- ✅ user_roles — Admin/editor veem todos
- ✅ page_layout — Público lê publicado, editors escrevem
- ✅ page_comments — Autenticado comenta

---

## 📋 FOREIGN KEYS CRÍTICAS

```
news_drafts.user_id       → auth.users.id
news_drafts.noticia_id    → noticias.id
noticias.autor_id         → auth.users.id
user_roles.user_id        → auth.users.id
admin_actions.user_id     → auth.users.id
page_layout.updated_by    → auth.users.id
page_layout_versions.published_by → auth.users.id
page_layout_versions.page_layout_id → page_layout.id (CASCADE)
page_templates.created_by  → auth.users.id
page_comments.page_layout_id → page_layout.id (CASCADE)
page_comments.user_id      → auth.users.id
page_comments.parent_id    → page_comments.id
ad_impressions.slot_id    → ad_slots.id (CASCADE)
ad_impressions.noticia_id → noticias.id (SET NULL)
ad_clicks.slot_id         → ad_slots.id (CASCADE)
ad_clicks.noticia_id      → noticias.id (SET NULL)
episodios.podcast_id      → podcasts.id
notificacoes.user_id      → auth.users.id
```

---

## 🎯 STATUS DE COMPLETUDE

### Por Feature

| Feature | Status | Obs |
|---------|--------|-----|
| **Editorial Base** | ✅ 95% | Faltam news_statuses |
| **Rascunhos Automáticos** | ✅ 100% | news_drafts OK |
| **Page Builder** | ❌ 0% | Todas 5 tabelas faltam |
| **Ad Manager** | ✅ 100% | Tabelas + tracking |
| **Governance** | ✅ 100% | Roles + audit log |
| **Mídia & Podcasts** | ✅ 100% | Todos os tipos |
| **Configuração** | ✅ 95% | Alguns campos JSONB |

---

## ✅ PRÓXIMAS AÇÕES

1. **Criar 5 tabelas faltantes** (20 min)
2. **Criar índices** (5 min)
3. **Seed dados iniciais** (5 min)
4. **Validar RLS** (10 min)
5. **Testar npm run dev** (10 min)

**Total**: ~50 minutos

---

**Gerado em**: 2026-04-22  
**Método**: Inspeção via SQL + Documentação migrations  
**Status**: Pronto para executar
