# 🏗️ Plano de Refatoração Premium — Portal de Notícias

**Status Geral**: Fase 6 concluída ✅ | Subfases 2B pendentes em execução 🔧

---

## 📊 Quick Reference — Checklist de Fases

- [x] **Fase 0.1** — Instalar todas as dependências ✅
- [x] **Fase 0.2** — Gerar shadcn/ui components ✅
- [x] **Fase 0.3** — Configurar tokens CSS + Providers ✅
- [x] **Fase 0.4** — Quick wins visuais ✅
- [x] **Fase 0.5** — Tipos Supabase + Verify ✅

---

## 🎯 Status de Fases

| Fase | Descrição | Status | Prioridade |
|---|---|---|---|
| **1** | Home Polish | ✅ Concluído | 🔴 |
| **2** | Admin Shell | ✅ Concluído | 🔴 |
| **2B** | Módulo-a-Módulo (10 sub-fases) | 🔧 Em andamento | 🟡 |
| **3** | Ad Manager Premium | ✅ Concluído | 🟡 |
| **4** | Ad Analytics | ✅ Concluído | 🟡 |
| **5** | Page Builder Puck | ✅ Concluído | 🟡 |
| **6** | Governance & Auth | ✅ Concluído | 🟢 |

---

## 📋 Sub-fases 2B — Status Detalhado

| Sub-fase | Módulo | Status |
|---|---|---|
| 2B.1 | Transmissão cockpit | ✅ Completo (progressive boost, oscillation) |
| 2B.2 | Notícias: Editor + Listagem | ✅ Completo (react-hook-form+zod, status, roles) |
| 2B.2 | Auto-save nuvem (news_drafts) | ✅ Migration v15 criada — UI a integrar |
| 2B.2 | Categorias dinâmicas | ✅ Migration v15 + HomeContent busca do banco |
| 2B.3 | Publicidade stub → shadcn | ✅ Completo (4 abas: Slots/Criativos/Diretrizes/Preview) |
| 2B.4 | Aparência (Hero Banners) | ✅ Completo — ⚠️ Live Preview sidebar pendente |
| 2B.5 | Branding & UI | ✅ Completo — ⚠️ Live Preview pendente |
| **2B.6** | **Podcasts** | ✅ **IMPLEMENTADO** (form+zod, dnd-kit, thumbnail upload) |
| **2B.7** | **Mídia/VOD** | ✅ **IMPLEMENTADO** (XHR progress, tabs, grid) |
| 2B.8 | Auditoria de Notícias | 🔧 Parcial — falta indicador "na home", reordenação dnd |
| 2B.9 | Relatórios | ✅ Completo (CSV/PDF, filtros Supabase) |
| 2B.10 | Remover Copiloto IA como aba | ✅ Integrado no editor |

---

## 🆕 Novidades 2026-04-22

- **Admin Overview Dashboard** — Quick Stats, Live badge, Top notícias
- **Editor Visual (9 blocos Puck)** — auto-save 30s, Rascunho vs Publicar
- **Progressive Audience Boost** — ease-in-out + oscilação orgânica ±3-7%
- **Breaking News Marquee** — CSS animated, speed control, dismiss button
- **Home renderiza Puck** — feature flag `use_puck_home` + PuckRenderer
- **Podcasts 2B.6** — Gerenciador completo com YouTube validation + dnd-kit
- **Mídia/VOD 2B.7** — Upload com progresso XHR + grid preview
- **Migration v15** — categorias, news_drafts, published_at, use_puck_home

---

## 🚧 Gaps Pendentes

| Gap | Prioridade |
|---|---|
| Live Preview em Aparência (banners carrossel) | P4 |
| Live Preview em Branding (header/card ao vivo) | P4 |
| Auditoria Notícias: indicador "na home", dnd reordenação | P4 |
| Rota pública `/podcast/[slug]` | P5 |
| RLS granular no Supabase (policies SQL) | P5 |

---

## 🔑 Comandos Importantes

**Ativar Puck na home** (executa no SQL Editor do Supabase):
```sql
UPDATE configuracao_portal 
SET ui_settings = ui_settings || '{"use_puck_home": true}'::jsonb 
WHERE id = 1;
```

**Aplicar Migration v15** (categorias + news_drafts):
> Arquivo: `supabase/migrations/20260422_v15_categorias_drafts_flags.sql`

---

**Última atualização**: 2026-04-22 23:12 UTC (2B.6, 2B.7, P1/P3 concluídos)
