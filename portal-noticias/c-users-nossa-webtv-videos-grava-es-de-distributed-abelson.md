# Plano de Refatoração Premium — Portal de Notícias

## Contexto

O portal (Next.js 16.2.4 + React 19 + Tailwind v4 + Supabase) tem núcleo editorial sólido — editor Tiptap, Motor de Publicidade v2 com drag-drop, podcasts, biblioteca VOD, TTS, live. Mas o diagnóstico visual e **a auditoria módulo-a-módulo do admin** revelaram gaps que travam o salto para padrão "premium":

**Frontend público**:
- Logo/banner com problemas de ajuste, footer ad cortado por overflow, grids inconsistentes, seções flutuando sem agrupamento Gestalt, zero micro-interações, zero dark mode com toggle.
- Duplicações: `PlantaoPolicialWidget` × bloco inline em `src/app/page.tsx:475-505`; três implementações de ad (`DynamicAdSlot`, `FooterAdBanner`, `config.ad_slot_1/2` legado).

**Admin — auditoria profunda dos 12 módulos (em `src/app/admin/page.tsx` ~1000 linhas monolíticas)**:

| Problema | Evidência |
|---|---|
| **3 sistemas de auth coexistindo** | Supabase Auth (main admin), `password === "admin"` hardcoded (Relatórios, Biblioteca, Editar), rascunho em `localStorage` |
| **Botões dummy** | "Modo de Manutenção" e "Breaking News Alerta" no Dashboard renderizam `onClick={() => {}}` |
| **Funcionalidades prometidas sem efeito no site** | `priorizar_facebook_live`, `font_weight`, `marquee_speed`, `widgets_visibility.herobanner`, embeds sociais, Copiloto IA (só salva key, não integra no editor) |
| **Duplicações internas** | Ad Slots em 2 lugares (AdSlotManager × `ad_slot_1/2` em Aparência); Hero timing em Branding mas items em Aparência; categorias hardcoded em 2 lugares |
| **Zero confirmação premium** | Todos deletes usam `window.confirm()`, sem Dialog, sem undo |
| **Sem padrão de forms** | Todos módulos usam `useState` manual — zero `react-hook-form`/`zod`; validação inexistente ou inconsistente |
| **Uploads descentralizados** | Cada módulo chama `supabase.storage.from(bucket).upload()` com path próprio (`banners/`, `ads/`, `branding/`, `podcast-covers`, `videos_biblioteca`, `galeria/{id}/`) — sem utilidade central |
| **Sem reflexos validados** | Branding salva `font_weight` mas nenhum componente consome; `hero_banner_items.scale` não tem live preview |
| **XSS aberto** | `ad_slots.codigo_html_ou_imagem` aceita `<script>` sem sanitização |
| **Sem paginação/busca** | Lista de notícias carrega tudo; biblioteca idem; chat live só mostra 40 msg sem scroll infinito |
| **Sem realtime onde faria sentido** | Só o chat live usa Supabase Realtime; alterações de branding/slots exigem refresh manual |
| **Governance zero** | Sem RLS granular, sem audit log, sem draft→review→publish, publicação direta ao salvar |

**Resultado desejado**: portal premium com home editorialmente flexível (Page Builder), Ad Manager com abas/diretrizes/tracking/badge Patrocinado, **admin reorganizado módulo-a-módulo com padrão único de forms/dialogs/uploads/toasts refletindo fielmente no site e configurado corretamente com o Supabase**, governance editorial maduro.

**Decisões confirmadas**:
- **Supabase Auth puro** (remover `next-auth` e fallback `"admin"`).
- **Sequencial estrito** — uma fase por vez, cada shippable.
- **Puck** (`@measured/puck`, MIT) como Page Builder na Fase 5.

---

## Princípios transversais

1. **Stack-first**: libs React-idiomatic, compatíveis com React 19 + Server Components.
2. **Tokens antes de componentes**: design system em `globals.css` via `@theme inline` (Tailwind v4 CSS-first).
3. **Database-first**: schema é contrato; migrations precedem código.
4. **Uma forma de fazer cada coisa**: um form lib (react-hook-form+zod), um dialog, um toast, um padrão de upload, um client Supabase (browser) + um server.
5. **Reuso**: `AdSlotManager` (@dnd-kit), `NewsEditorForm` (Tiptap), `settingsStore` (zustand) são refatorados, não reescritos.
6. **Cada módulo do admin deve ter**: rota dedicada, form validado, feedback via toast, confirmação via Dialog, reflexo verificável no site público, leitura/escrita explícita no Supabase com tipagem.

---

## Fase 0 — Foundation, Instalação Completa & Quick Wins  *(3–5 dias)*

**Objetivo**: **baixar e configurar TODAS as dependências do plano de uma só vez** (inclusive Puck, framer-motion, tanstack, etc.), estabelecer a base premium (design tokens, dark toggle, SSR Supabase) e corrigir os bugs visuais imediatos.

**Resultado visível**: `package.json` completo para as 7 fases, `node_modules` pronto, shadcn/ui gerado, header impecável, banner hero na altura certa, footer ad sem corte, toggle claro/escuro sem flicker, tipografia editorial nos artigos.

---

## ✅ FASE 0 — STATUS DE CONCLUSÃO

### 0.1 — Instalação completa ✅ **CONCLUÍDO**

Todos os pacotes do plano são instalados agora. Razão: evita atrito em fases seguintes, permite que o TypeScript saiba de todos os tipos desde o início, e libera exploração antecipada das libs (especialmente Puck) em branches de spike.

**Runtime — Framework & Infra**
```bash
npm install next-themes @supabase/ssr sonner
```

**UI Components & Micro-interações**
```bash
npm install cmdk vaul framer-motion
# @dnd-kit já está instalado (v6.3.1 core / v10 sortable) — apenas verificar
```

**Forms & Validação**
```bash
npm install react-hook-form zod @hookform/resolvers
```

**Data Fetching, State & Tabelas**
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools @tanstack/react-table
```

**Page Builder (home dinâmica — Fase 5)**
```bash
npm install @measured/puck
# opcional: @measured/puck-plugin-heading-analyzer (acessibilidade SEO)
```

**Charts & Analytics (Fase 4)**
```bash
npm install @tremor/react recharts
```

**Segurança & Utilidades**
```bash
npm install dompurify && npm install -D @types/dompurify
npm install date-fns plaiceholder  # plaiceholder gera blurDataURL server-side
```

**Dev & QA**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

**shadcn/ui** (gera arquivos em `src/components/ui/`, ownership do código)
```bash
npx shadcn@latest init
# responder: Style = Default, Base color = Slate, CSS vars = Yes
npx shadcn@latest add button card tabs dialog alert-dialog dropdown-menu sheet badge separator skeleton input label form select tooltip sonner textarea switch popover command combobox table scroll-area avatar progress toggle toggle-group
```

**Status 0.1**: ✅ **INSTALADO COM SUCESSO**
- ✅ next-themes, @supabase/ssr, sonner
- ✅ cmdk, vaul, framer-motion
- ✅ react-hook-form, zod, @hookform/resolvers
- ✅ @tanstack/react-query, @tanstack/react-query-devtools, @tanstack/react-table
- ✅ @measured/puck
- ✅ recharts (Tremor removido por incompatibilidade React 19; usar recharts direto na Fase 4)
- ✅ dompurify, date-fns, plaiceholder, @types/dompurify
- ✅ @playwright/test
- ✅ `npm run build` passou sem erros (4.1s, TypeScript OK)

**Nota importante**: Tremor `@3.18.7` requer React 18, mas o projeto usa React 19. Como recharts é a dependência subjacente, usaremos **recharts puro + shadcn charts na Fase 4** em vez de Tremor. Não há impacto no plano — apenas ganho de simplificação.

---

### 0.2 — Geração de shadcn/ui components (PRÓXIMA ETAPA) ⏳

**O que fazer**:
- Gerar 25 componentes shadcn em `src/components/ui/` (button, card, tabs, dialog, alert-dialog, dropdown-menu, sheet, badge, separator, skeleton, input, label, form, select, tooltip, textarea, switch, popover, command, combobox, table, scroll-area, avatar, progress, toggle).
- Usar `npx shadcn@latest add <component> --yes` um por um (após fix de `components.json`).

**Tempo estimado**: 1–2 horas.

---

### 0.3 — Configuração de tokens e providers ⏳

**O que fazer**:
- [src/app/globals.css](portal-noticias/src/app/globals.css) — expandir `@theme inline` com Soft UI tokens (shadows camadas sm/md/lg/xl, radii 4/8/12/16, easing, spacing editorial, `--color-primary/muted/accent/destructive`), dark mode via classe (`.dark { ... }`). Adicionar `@source "../node_modules/@measured/puck";`.
- [src/app/layout.tsx](portal-noticias/src/app/layout.tsx) — `<ThemeProvider>` (next-themes) + `<Toaster />` (sonner) + `<QueryClientProvider>` wrapper. Font-sans: Inter; títulos editoriais: Playfair Display.
- [src/lib/supabase-browser.ts](portal-noticias/src/lib/supabase-browser.ts) e [src/lib/supabase-server.ts](portal-noticias/src/lib/supabase-server.ts) (novos) — usando `@supabase/ssr`. Substituem [src/lib/supabase.ts](portal-noticias/src/lib/supabase.ts).
- `src/lib/query-client.ts` (novo) — singleton do `QueryClient`.

**Tempo estimado**: 1–2 horas.

---

### 0.4 — Quick wins visuais ⏳

**O que fazer**:
- [src/components/Header.tsx](portal-noticias/src/components/Header.tsx) — adicionar `ThemeToggle` (shadcn button + next-themes).
- [src/components/HeroBanner.tsx](portal-noticias/src/components/HeroBanner.tsx) — corrigir alturas `h-40 md:h-64 lg:h-80`, adicionar lógica `object-contain`/`object-cover` condicional.
- [src/components/FooterAdBanner.tsx](portal-noticias/src/components/FooterAdBanner.tsx) — remover `overflow-hidden`, usar `aspect-ratio`.

**Tempo estimado**: 1–2 horas.

---

### 0.5 — Tipos Supabase + Verificação Final ⏳

**O que fazer**:
```bash
npx supabase gen types typescript --project-id <PROJECT_ID> --schema public > src/types/database.ts
npm run build
npm run typecheck
npm run dev
```

**Verificação**:
- ✓ `npm run build` passa sem erros.
- ✓ `npm run typecheck` limpo.
- ✓ `/` carrega no `npm run dev`.
- ✓ Toggle dark/light alterna sem flicker.
- ✓ CSS vars em `:root` e `.dark`.
- ✓ `import { Puck } from '@measured/puck'` resolve.

**Tempo estimado**: 0.5 horas.

---

## 📊 RESUMO FASE 0 — PROGRESS REPORT

| Sub-fase | Status | Duração | Dependências |
|---|---|---|---|
| **0.1 — Instalar deps** | ✅ **CONCLUÍDO** | 15 min | Nenhuma |
| **0.2 — shadcn/ui components** | ⏳ **PRÓXIMO** | 1–2h | 0.1 ✓ |
| **0.3 — Tokens + Providers** | ⏳ **PRÓXIMO** | 1–2h | 0.2 |
| **0.4 — Quick wins visuais** | ⏳ **PRÓXIMO** | 1–2h | 0.3 |
| **0.5 — Types + Verify** | ⏳ **PRÓXIMO** | 0.5h | 0.4 |

**Total Fase 0**: ~3–5 horas restantes (das 3–5 dias planejados).

---

## 🎯 RECOMENDAÇÃO CRÍTICA PARA PRÓXIMOS PASSOS

> **Após completar 0.5 (verificação final), CRIE UM COMMIT E MERGUE** em `main` **ANTES de começar a Fase 1**.
>
> **Razão**:
> - Fase 0 é uma **base sólida e testada** (`npm run build` ✓ com 0.1 concluído).
> - Fase 1 começará a refatorar `src/app/page.tsx` (560 linhas) — mudança significativa e delicada.
> - **Snapshot agora** permite rollback seguro se algo der errado em Fase 1.
> - Git history fica claro: "Foundation (0.x deps + tokens + quick wins)" como um commit atômico.
>
> **Git Workflow Sugerido**:
> ```bash
> git checkout -b feat/phase-0-foundation          # Branch para trabalhar
> # ... completar 0.2, 0.3, 0.4, 0.5 ...
> npm run build && npm run typecheck && npm run dev # Verificação final
> git add -A
> git commit -m "Fase 0: Foundation (shadcn, tokens, providers, quick wins)
>
> - Instaladas todas as deps: next-themes, @supabase/ssr, sonner, cmdk, vaul, framer-motion, react-hook-form, zod, @tanstack/*, @measured/puck, recharts, dompurify, plaiceholder
> - shadcn/ui components gerados (25 components)
> - Tokens Tailwind v4 CSS-first (Soft UI design system)
> - Providers: ThemeProvider (next-themes), Toaster (sonner), QueryClientProvider (@tanstack/react-query)
> - Supabase SSR: split de clients browser/server
> - Quick wins: Header ThemeToggle, HeroBanner alturas, FooterAdBanner overflow fix
> - Types gerados do Supabase (typed queries)
> - ✓ npm run build, typecheck, dev todos passando
> 
> Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
> git push -u origin feat/phase-0-foundation
> # Abrir PR, review, mergear para main
> # Depois: git checkout main && git pull
> # Iniciar Fase 1 em novo branch: git checkout -b feat/phase-1-home-polish
> ```
>
> Isso garante rastreabilidade, rollback, e separação clara entre foundation e implementações subsequentes.

---

## Fase 1 — Home Polish  *(4–5 dias)*

**Objetivo**: transformar `src/app/page.tsx` (560 linhas client) em home editorial com Server Components.

**Resultado visível**: grid rítmico, separadores sutis, micro-interações framer-motion, next/image otimizado com blur placeholder, duplicação de Plantão e Ad unificadas.

### Bibliotecas
*(todas já instaladas na Fase 0)*
- **framer-motion** com `LazyMotion` + `domAnimation` (bundle enxuto).
- **@tanstack/react-query** — adotado efetivamente a partir da Fase 2.
- **plaiceholder** — gerar `blurDataURL` em build/server para imagens Supabase.

### Arquivos
- [src/app/page.tsx](portal-noticias/src/app/page.tsx) — Server Component raiz + children client pontuais.
- `src/components/home/HeroSection.tsx`, `NewsGrid.tsx`, `NewsCard.tsx`, `SectionSeparator.tsx`, `CategoryRow.tsx` (novos) — extração.
- [src/components/PlantaoPolicialWidget.tsx](portal-noticias/src/components/PlantaoPolicialWidget.tsx) — fonte única; remover bloco duplicado em `src/app/page.tsx:475-505`.
- `src/components/ads/AdSlot.tsx` (novo) — **unifica** `DynamicAdSlot` + `FooterAdBanner` + `config.ad_slot_1/2` legado atrás de uma interface única com prop `position`. Renderiza `SponsoredBadge` quando apropriado.
- [src/components/FallbackImage.tsx](portal-noticias/src/components/FallbackImage.tsx) — remover `unoptimized=true`, `placeholder="blur"` default.

### Migrations
Opcional: `ALTER TABLE noticias ADD COLUMN blur_hash TEXT`.

### Dependências
Fase 0.

---

## Fase 2 — Admin Shell & Foundations  *(4–5 dias)*

**Objetivo**: sair das 1000 linhas monolíticas para shell + rotas + padrões unificados (forms, dialogs, uploads, toasts, data-fetching). **Esta fase NÃO refatora módulos individuais ainda** — só monta a infraestrutura.

**Resultado visível**: `/admin` com sidebar colapsável (desktop) / drawer vaul (mobile), topbar com command palette (Ctrl+K), rotas dedicadas por módulo (ainda stubs). Utilidade centralizada de upload, `ConfirmDialog` premium, toasts sonner padronizados.

### Bibliotecas
*(todas já instaladas na Fase 0 — aqui só ativamos o uso)*
- **cmdk** — command palette.
- **vaul** — drawer mobile premium.
- **react-hook-form** + **zod** + **@hookform/resolvers** — forms validados.
- **@tanstack/react-query** — caching + invalidation + optimistic updates.
- **@tanstack/react-table** — tabelas.
- **date-fns** — formatação.

### Arquivos
- [src/app/admin/layout.tsx](portal-noticias/src/app/admin/layout.tsx) (novo) — shell com `AdminSidebar` + `AdminTopbar` + `QueryClientProvider`.
- [src/app/admin/page.tsx](portal-noticias/src/app/admin/page.tsx) — reduzir a dashboard "Visão Geral" apenas (o monólito sai desta fase).
- Rotas stubs (conteúdo migra módulo-a-módulo na Fase 2B): `src/app/admin/transmissao/page.tsx`, `noticias/page.tsx`, `publicidade/page.tsx`, `aparencia/page.tsx`, `branding/page.tsx`, `podcasts/page.tsx`, `midia/page.tsx`, `auditoria/page.tsx`, `relatorios/page.tsx` (novos).
- `src/components/admin/AdminSidebar.tsx`, `AdminTopbar.tsx`, `CommandPalette.tsx` (novos).
- `src/lib/query-client.ts` (novo) — singleton.
- `src/middleware.ts` — redirect `/admin` → `/admin/visao-geral`; gate de rotas admin por sessão Supabase.
- **Utilidades centralizadas (base de toda Fase 2B)**:
  - `src/lib/storage.ts` (novo) — `uploadMedia({ file, bucket, folder }) → { url, path }`. Centraliza todos uploads (hoje espalhados em 5+ módulos).
  - `src/components/ui/confirm-dialog.tsx` (novo) — wrapper shadcn `AlertDialog` com `useConfirm()` hook. Substitui TODO `window.confirm()`.
  - `src/lib/toast.ts` (novo) — wrapper sonner com padrões (`toast.success/error/promise`).
  - `src/lib/schemas/` (novo) — arquivos zod por entidade (`news.ts`, `podcast.ts`, `ad-slot.ts`, `ui-settings.ts`).
  - `src/hooks/use-form-config.ts` (novo) — padrão `useForm({ resolver: zodResolver(schema) })`.

### Migrations
Nenhuma nesta fase.

### Trade-offs
Fase de maior esforço estrutural. Destrava toda a Fase 2B.

### Dependências
Fase 0.

---

## Fase 2B — Reorganização Módulo-a-Módulo  *(8–10 dias, uma sub-fase por módulo)*

**Objetivo**: migrar cada uma das 12 áreas do admin para sua rota dedicada, com padrão único (shadcn + react-hook-form + zod + `useConfirm` + toasts + tanstack-query + `uploadMedia`) e **validar o reflexo de cada configuração no site público**.

**Regras aplicáveis a TODOS os módulos** (checklist obrigatório por sub-fase):
- [ ] Rota dedicada com layout consistente (cards, tabs, breadcrumb).
- [ ] Formulário com `react-hook-form + zod` (zero `useState` manual em forms).
- [ ] Uploads via `uploadMedia()` unificado.
- [ ] Deletes e ações destrutivas via `useConfirm()` (não `window.confirm`).
- [ ] Feedback: `toast.success/error` padrão.
- [ ] Loading: `Skeleton` shadcn; erro: `Alert` com retry.
- [ ] Invalidation: `queryClient.invalidateQueries(['key'])` após mutate.
- [ ] Tipagem Supabase: usar `Database` types gerados (`supabase gen types typescript`).
- [ ] **Reflexo no site validado**: comentário em cada handler citando qual componente público consome o dado.
- [ ] Acessibilidade: `aria-label` em ícones, `label` em inputs.
- [ ] Live preview embutido quando aplicável (branding, hero banners, ads).

### Sub-fase 2B.1 — Transmissão (consolida Dashboard + Sinal Ao Vivo)  *(1 dia)*
Rota: `/admin/transmissao`. Fusão dos módulos "Visão Geral" (`src/app/admin/page.tsx:436-474`) e "Sinal Ao Vivo" (`:477-655`) em cockpit único.
- **Remover botões dummy**: "Modo de Manutenção" e "Breaking News Alerta" (`onClick={() => {}}`) — ou implementar de fato (toggle `configuracao_portal.maintenance_mode`, marquee breaking via `ui_settings.breaking_news_alert.active`).
- **Validar URLs YouTube/Facebook** via zod antes de salvar.
- **Consumir `mostrar_live_facebook`** de fato no frontend (condicional do `<iframe>`) OU remover o campo.
- **Chat**: paginação scroll infinito (hoje limite 40 hardcoded). Reconexão automática do channel Realtime.
- **Reflexo**: `is_live` → `<LiveBanner>` no Header; `url_live_*` → `<LivePlayer>` em `/ao-vivo`; `fake_viewers_boost` → contador na home.
- Cards de métricas com tanstack-query (total notícias, viewers, state live).

### Sub-fase 2B.2 — Notícias: Editor + Listagem + Copiloto IA  *(2 dias)*
Rotas: `/admin/noticias` (lista + busca + filtros + paginação), `/admin/noticias/novo`, `/admin/noticias/[id]/editar`.
- [src/components/admin/NewsEditorForm.tsx](portal-noticias/src/components/admin/NewsEditorForm.tsx) migrado para `react-hook-form` + schema zod em `src/lib/schemas/news.ts`.
- **Copiloto IA integrado no editor** (não mais aba separada): sidebar direita com botões "Gerar título", "Resumir", "Reescrever em tom X". Consumir `ui_settings.openrouter_api_key` via Route Handler `src/app/api/ai/route.ts` (não expor key no client).
- Auto-save em nuvem (tabela `news_drafts`) em vez de `localStorage` — sobrevive a troca de tab/incognito.
- Validação uploads: tamanho, formato, dimensões mínimas.
- Listagem com `@tanstack/react-table`: busca por título, filtro categoria, filtro status, paginação server-side, reordenação `ordem_prioridade` via dnd-kit.
- Deletar com `useConfirm()`; undo por 10s (soft-delete).
- **Categorias dinâmicas**: criar tabela `categorias` (ver schema abaixo) e substituir hardcoded em NewsEditor + Biblioteca.
- **Reflexo**: `mostrar_na_home_recentes` → `NewsGrid` na home; `ordem_prioridade` → ordem dos cards; `titulo_config.font` → classe CSS aplicada no card (validar mapping).

### Sub-fase 2B.3 — Publicidade (Motor)  *(escopo completo na Fase 3)*
Stub na Fase 2B apenas: rota `/admin/publicidade` com `AdSlotManager` migrado para shadcn + `useConfirm`. Refactor completo com abas/diretrizes/badge na **Fase 3**.

### Sub-fase 2B.4 — Aparência (Hero Banners)  *(1 dia)*
Rota: `/admin/aparencia`. Origem: `src/app/admin/page.tsx:682-854`.
- **Remover ad_slot_1/ad_slot_2 daqui** — migrar para `ad_slots` table como entries `posicao_html='home_banner_1/2'` (gerenciados em `/admin/publicidade`).
- Reordenação de banners via dnd-kit (hoje só add/remove).
- Live preview embutido do carrossel (aspect-ratio, `object-cover`/`object-contain`).
- Validação imagem: mínimo 1920×600, máximo 2MB.
- **Reflexo**: `hero_banner_items` → `<HeroBanner>` na home via `HeroSection.tsx`. Validar `scale` aplica de fato.

### Sub-fase 2B.5 — Branding & UI  *(1 dia)*
Rota: `/admin/branding`. Origem: `src/app/admin/page.tsx:857-1071`.
- Schema único `ui_settings` em `src/lib/schemas/ui-settings.ts` (hoje espalhado entre aparência e branding).
- Live preview: sidebar direita mostra header, card típico e marquee atualizando em tempo real conforme o form muda.
- Validação hex color (zod `.regex(/^#[0-9a-f]{6}$/i)`).
- Breaking news: speed ganha opções (slow/normal/fast) mapeadas em CSS duration.
- **Remover `widgets_visibility.herobanner`** daqui (conflito com módulo Aparência).
- Font tokens: `font_family` salva variável CSS (`var(--font-inter)`), não o nome em string.
- `font_weight` efetivamente aplicado em Header/títulos (validar no DOM).
- **Reflexo**: `primary_color` → `--color-primary` CSS var injeta no layout; `logo_url/logo_texto_url` → Header; `breaking_news_alert` → `<BreakingNewsMarquee>`; `widgets_visibility` → condicionais na home.

### Sub-fase 2B.6 — Podcasts  *(1 dia)*
Rota: `/admin/podcasts`. Origem: `src/app/admin/page.tsx:1219-1500+`.
- Form com RichText para descrição (reusar `RichTextEditor` do editor).
- Validação YouTube URL via zod + helper `getYouTubeID()`.
- Reordenação episódios via dnd-kit.
- Upload thumbnails via `uploadMedia()`, feedback de progresso.
- Dialog em vez de form inline na tabela (UX mais limpa).
- **Criar rotas públicas** (escopo de conteúdo, não admin): `/podcast/[slug]` e widget `<PodcastFeed>` para home. Sem isso, o módulo não tem reflexo no site.
- **Reflexo**: `podcasts` + `episodios` tables → `/podcast/[slug]` + `<PodcastFeed>` bloco Puck (Fase 5).

### Sub-fase 2B.7 — Mídia (Biblioteca VOD + Feeds Sociais)  *(1 dia)*
Rota: `/admin/midia` com tabs: "Biblioteca VOD" | "Redes Sociais".
- **Biblioteca** (origem `src/app/admin/biblioteca/page.tsx`): remover password hardcoded `"admin"` — usar Supabase Auth do shell; progresso de upload (`XMLHttpRequest.upload.onprogress`); delete robusto no Storage (não depender de split de filename).
- **Redes Sociais** (origem `:1074-1097`): decidir — **ou implementar Facebook Page Plugin embed de fato** (criar `<FacebookEmbed>` em `src/components/social/`), **ou remover o campo** e documentar. Sem meio-termo — hoje é ilusório.
- **Reflexo**: `biblioteca_webtv` → `/biblioteca`; `facebook_page_url` → `<FacebookEmbed>` em seção social (se implementar).

### Sub-fase 2B.8 — Auditoria de Notícias  *(0.5 dia)*
Rota: `/admin/auditoria` (lista; `admin_actions` log entra na Fase 6).
- Migrar para `@tanstack/react-table` com busca, filtro categoria, filtro data, paginação server-side.
- Indicador visual "na home agora?" (`mostrar_na_home_recentes && status = 'published'`).
- Slug clicável → copia para clipboard com toast.
- Reordenação via dnd-kit salva `ordem_prioridade` em batch atômico (RPC ou transaction).

### Sub-fase 2B.9 — Relatórios  *(escopo completo na Fase 4)*
Stub na Fase 2B: remover password hardcoded `"admin"` (usar Supabase Auth do shell), manter filtros atuais. Dashboard tremor + analytics de ads entra na **Fase 4**.

### Sub-fase 2B.10 — Remover Copiloto IA como aba  *(consolida em 2B.2)*
A aba separada é redundante — vira um ícone na topbar para configurar a key (Dialog) + sidebar no editor para consumir. Botão de aba removido do menu.

### Migrations Supabase (transversais a toda Fase 2B)
```sql
-- Categorias dinâmicas (substitui hardcoded)
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cor TEXT,
  ordem INT DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
INSERT INTO categorias (slug, nome, ordem) VALUES
  ('geral','Geral',0), ('arapongas','Arapongas',1), ('esportes','Esportes',2),
  ('policia','Polícia',3), ('politica','Política',4), ('entretenimento','Entretenimento',5);

-- FK opcional em noticias/biblioteca_webtv
ALTER TABLE noticias ADD COLUMN categoria_id UUID REFERENCES categorias(id);
ALTER TABLE biblioteca_webtv ADD COLUMN categoria_id UUID REFERENCES categorias(id);
-- backfill por slug; manter coluna `categoria` texto como fallback por 1 release.

-- Auto-save em nuvem (substitui localStorage)
CREATE TABLE news_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Sanitização HTML (Fase 3 expande; já entra aqui o flag)
ALTER TABLE ad_slots ADD COLUMN sanitized BOOLEAN DEFAULT false;
```

### Trade-offs
Fase mais densa. Divisível em PRs pequenos (uma sub-fase por PR). Ganho: admin consistente, previsível, auditável.

### Dependências
Fase 2.

---

## Fase 3 — Ad Manager Premium  *(4–5 dias)*

**Objetivo**: elevar `AdSlotManager` a produto completo com abas, diretrizes por slot, badge Patrocinado automático, vínculo bidirecional slot↔notícia, preview do anúncio no editor.

**Resultado visível**: `/admin/publicidade` com 4 abas (**Slots / Criativos / Diretrizes / Preview**). Dimensões obrigatórias validadas por zod. Badge âmbar "Patrocinado" (CONAR) em cards. Autocomplete de slot no editor com preview live.

### Bibliotecas
Nenhuma nova — **dompurify** já instalado na Fase 0 (sanitização HTML); shadcn Tabs/Dialog/Form + zod da Fase 2.

### Arquivos
- [src/app/admin/publicidade/page.tsx](portal-noticias/src/app/admin/publicidade/page.tsx) — Tabs shadcn.
- `src/components/admin/ads/SlotsTab.tsx`, `CreativesTab.tsx`, `GuidelinesTab.tsx`, `PreviewTab.tsx` (novos).
- `src/lib/ad-guidelines.ts` (novo) — mapa `position → {width, height, aspectRatio, maxWeightKB, formats}`:
  - `header_top: 970x90` (leaderboard)
  - `sidebar_right_1/2: 300x250` (MREC)
  - `in_article: 728x90` desktop + `320x100` mobile
  - `footer_top: 970x250`
  - `home_banner_1/2`: migrados de Aparência na Fase 2B.4.
- `src/components/ads/SponsoredBadge.tsx` (novo) — badge "Patrocinado" reutilizável.
- `src/components/ads/AdSlot.tsx` (Fase 1) — renderiza `SponsoredBadge` quando `is_sponsored_content=true`.
- `src/lib/sanitize.ts` (novo) — `DOMPurify` para HTML de slots (fecha XSS).
- [src/components/admin/NewsEditorForm.tsx](portal-noticias/src/components/admin/NewsEditorForm.tsx) — dropdown vira `Combobox` com preview; tanstack-query invalida ao criar slot novo.

### Migrations Supabase
```sql
ALTER TABLE ad_slots
  ADD COLUMN width INT,
  ADD COLUMN height INT,
  ADD COLUMN is_sponsored_content BOOLEAN DEFAULT false,
  ADD COLUMN advertiser_name TEXT,
  ADD COLUMN click_url TEXT,
  ADD COLUMN start_date TIMESTAMPTZ,
  ADD COLUMN end_date TIMESTAMPTZ;

ALTER TABLE ad_slots
  ADD CONSTRAINT ad_slots_dimensions_required
  CHECK (status_ativo = false OR (width IS NOT NULL AND height IS NOT NULL));
```

### Dependências
Fase 2B.3 (stub do módulo em shadcn).

---

## Fase 4 — Ad Analytics  *(3–4 dias)*

**Objetivo**: medir impressões/cliques com padrão IAB (viewability ≥50% por ≥1s), dashboard em tempo quase-real.

**Resultado visível**: aba Relatórios com CTR por slot, impressões/dia, top anunciantes, gráficos tremor. Auth unificada Supabase (remove `"admin"` hardcoded).

### Bibliotecas
*(já instaladas na Fase 0)*
- **@tremor/react** + **recharts** — dashboard components (harmonizar CSS vars com tokens Fase 0).

### Arquivos
- `src/components/ads/AdSlot.tsx` — `IntersectionObserver` (threshold 0.5 por 1s) + `onClick`.
- `src/lib/ad-tracking.ts` (novo) — buffer debounced via `navigator.sendBeacon`.
- `src/app/api/ads/track/route.ts` (novo) — grava em `ad_impressions` / `ad_clicks`.
- `src/app/admin/relatorios/page.tsx` — tremor charts + filtros.
- `src/lib/queries/ad-analytics.ts` — hooks tanstack-query para agregações.

### Migrations Supabase
```sql
CREATE TABLE ad_impressions (
  id BIGSERIAL PRIMARY KEY,
  slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT,
  session_hash TEXT,
  viewport_w INT,
  viewport_h INT
);
CREATE INDEX idx_ad_impressions_slot_time ON ad_impressions(slot_id, viewed_at DESC);

CREATE TABLE ad_clicks (
  id BIGSERIAL PRIMARY KEY,
  slot_id UUID REFERENCES ad_slots(id) ON DELETE CASCADE,
  noticia_id UUID REFERENCES noticias(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ DEFAULT now(),
  session_hash TEXT,
  referrer TEXT
);
CREATE INDEX idx_ad_clicks_slot_time ON ad_clicks(slot_id, clicked_at DESC);
```
**LGPD**: `session_hash = sha256(ip + ua + salt_diário)`, nunca persistente.

### Dependências
Fase 3.

---

## Fase 5 — Page Builder (Puck)  *(6–7 dias)*

**Objetivo**: editor visual da home com blocos registráveis e persistência JSON.

**Resultado visível**: `/admin/home-builder` com drag-drop (Hero, Grid3/2, Carousel, AdSlotBlock, PlantaoPolicial, NewsletterCTA, PodcastFeed). Draft/Publish. Home pública consome `page_layout.published_data`. Feature flag `ui_settings.use_puck_home` para rollback.

### Bibliotecas
*(já instalado na Fase 0)*
- **@measured/puck** (MIT) — drag-drop visual, JSON persistido, draft/publish nativo. Spike antecipado na Fase 0 em branch isolado para validar compatibilidade com React 19 + Next 16.

### Arquivos
- `src/app/admin/home-builder/page.tsx` (novo) — Puck Editor client-only.
- `src/lib/puck-config.ts` (novo) — registra blocos:
  - `Hero: { noticiaId }`
  - `Grid3: { noticiaIds: [UUID,UUID,UUID] }`
  - `AdSlotBlock: { position }`
  - `Carousel: { filter: {categoria?, tag?}, count }`
  - `PodcastFeed: { podcastId? }`
  - `NewsletterCTA: { title, description }`
- `src/components/puck-blocks/*` (novos) — wrappers reutilizando `NewsCard`, `AdSlot`, `PlantaoPolicialWidget`.
- [src/app/page.tsx](portal-noticias/src/app/page.tsx) — renderizador Server Component; fallback para layout legado se `published_data=null`.
- `src/app/api/home-layout/route.ts` — publicar draft→published com audit (integra Fase 6).

### Migrations Supabase
```sql
CREATE TABLE page_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  draft_data JSONB,
  published_data JSONB,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);
INSERT INTO page_layout (slug, published_data)
VALUES ('home', '<seed layout atual convertido para Puck JSON>');
```

### Dependências
Fase 2B (módulos estáveis), Fase 3 (AdSlot unificado como bloco).

---

## Fase 6 — Governance, Workflow & Auth Consolidation  *(4–5 dias)*

**Objetivo**: roles, aprovação, agendamento, auditoria completa, Supabase Auth puro (remove `next-auth` + senha mestra).

**Resultado visível**: login diferencia **admin/editor/autor/revisor**. Autor cria rascunho, revisor aprova, publicação em data agendada. `admin_actions` log completo. `next-auth` e fallback `"admin"` removidos.

### Bibliotecas
Nenhuma nova. Remover `next-auth` + `[...nextauth]`.

### Arquivos
- `src/lib/auth/roles.ts`, `src/lib/auth/permissions.ts` (novos).
- `src/middleware.ts` — gate por role.
- `src/app/admin/auditoria/page.tsx` — tanstack-table de `admin_actions`.
- `src/components/admin/ScheduleDialog.tsx` — agendamento.
- Supabase Edge Function `publish-scheduled` via `pg_cron` a cada 5min.
- Remover `src/app/api/auth/[...nextauth]/route.ts` e todas dependências.

### Migrations Supabase
```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','autor','revisor')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE noticias
  ADD COLUMN status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft','in_review','scheduled','published','archived')),
  ADD COLUMN publish_at TIMESTAMPTZ,
  ADD COLUMN approved_by UUID REFERENCES auth.users(id),
  ADD COLUMN approved_at TIMESTAMPTZ;

CREATE TABLE admin_actions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  diff JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS granular (exemplo)
CREATE POLICY noticias_insert_autor ON noticias
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('autor','editor','admin')));
CREATE POLICY noticias_publish_editor ON noticias
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('editor','admin')));
```

### Trade-offs
Remover senha mestra é breaking change — comunicar; seed `admin` via SQL antes do deploy.

### Dependências
Fase 2B (todas subfases estáveis), Fase 0 (supabase-server).

---

## Arquivos críticos (ordem de toque)

- [src/app/globals.css](portal-noticias/src/app/globals.css) — Fases 0, 1
- [src/app/layout.tsx](portal-noticias/src/app/layout.tsx) — Fase 0
- [src/lib/supabase.ts](portal-noticias/src/lib/supabase.ts) → split em `supabase-browser.ts` + `supabase-server.ts` — Fase 0
- [src/components/Header.tsx](portal-noticias/src/components/Header.tsx) — Fase 0
- [src/components/HeroBanner.tsx](portal-noticias/src/components/HeroBanner.tsx) — Fase 0
- [src/components/FooterAdBanner.tsx](portal-noticias/src/components/FooterAdBanner.tsx) — Fase 0
- [src/components/FallbackImage.tsx](portal-noticias/src/components/FallbackImage.tsx) — Fase 1
- [src/app/page.tsx](portal-noticias/src/app/page.tsx) — Fases 1, 5
- [src/app/admin/page.tsx](portal-noticias/src/app/admin/page.tsx) — Fase 2 (esvazia monólito), 2B.1 (migra Dashboard+Live)
- [src/components/admin/NewsEditorForm.tsx](portal-noticias/src/components/admin/NewsEditorForm.tsx) — Fase 2B.2, 3, 6
- [src/components/admin/AdSlotManager.tsx](portal-noticias/src/components/admin/AdSlotManager.tsx) — Fase 2B.3 (stub shadcn), Fase 3 (completo)
- [src/app/admin/biblioteca/page.tsx](portal-noticias/src/app/admin/biblioteca/page.tsx) — Fase 2B.7
- [src/app/admin/relatorios/page.tsx](portal-noticias/src/app/admin/relatorios/page.tsx) — Fase 2B.9 (auth), Fase 4 (dashboard completo)
- [src/app/admin/editar/[id]/page.tsx](portal-noticias/src/app/admin/editar/[id]/page.tsx) — Fase 2B.2 (migra para `/admin/noticias/[id]/editar`, remove password)

Reutilizados sem reescrita: `PlantaoPolicialWidget`, `settingsStore` (zustand), Tiptap, `@dnd-kit`, `FallbackImage` (após ajustes Fase 1), `RichTextEditor`.

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Tailwind v4 CSS-first vs libs que esperam `tailwind.config.js` (tremor) | `@source` em `globals.css` para varrer `node_modules`; validar cada lib em branch isolado. |
| Puck força padrão client-heavy vs Server Components | Editor é client-only (admin); renderizador público Server Component só mapeia JSON. |
| Migração `/admin` quebra bookmarks | `middleware.ts` com redirect `/admin` → `/admin/visao-geral`. |
| Ad tracking bloqueado por adblockers | Documentar como "impressões não-bloqueadas"; complementar server-side render log. |
| Remover senha mestra `"admin"` quebra acesso operacional | Comunicar com antecedência; seed de role `admin` para conta atual via SQL antes do deploy Fase 6. |
| framer-motion pesa em listas | `LazyMotion` + above-the-fold only. |
| Regressão visual entre fases | Playwright visual regression para Header/Hero na Fase 0. |
| Fase 2B é grande; risco de PR monster | Uma sub-fase = um PR; cada uma é shippable. |
| Categorias dinâmicas quebram queries existentes | Manter coluna `categoria` texto como fallback por 1 release; backfill com `categoria_id`. |
| `news_drafts` duplica rascunho do `localStorage` durante transição | Migrar `localStorage` para `news_drafts` na primeira abertura do editor pós-Fase 2B.2 (one-shot migração no client). |
| Remover `ad_slot_1/2` de Aparência quebra home atual | Seed de `ad_slots` com `posicao_html='home_banner_1/2'` convertendo dados existentes na migration. |

---

## Verificação end-to-end por fase

**Fase 0**: `npm run dev` → toggle tema sem flicker; header/hero/footer-ad corretos em mobile e desktop; artigo com `prose` legível.

**Fase 1**: home é Server Component (Network mostra HTML completo); grid alinhado; sem duplicação de Plantão; blur placeholder funciona.

**Fase 2**: Ctrl+K abre command palette; sidebar colapsa em mobile; tanstack-query devtools mostra cache; `useConfirm()` em 1 ponto (smoke test); `uploadMedia()` funciona.

**Fase 2B** (por sub-fase):
- **2B.1**: toggle live reflete em 2s no Header; URLs YouTube/Facebook inválidas rejeitadas por zod; chat reconecta após kill de network.
- **2B.2**: criar notícia, sair da aba, voltar → rascunho persiste (`news_drafts`); mudar categoria → listagem pública reflete; Copiloto IA sugere título via Route Handler.
- **2B.3**: AdSlotManager em shadcn, delete pede confirmação premium, toast sucesso.
- **2B.4**: reordenar banners → ordem aplica na home sem refresh (via invalidation); `scale=object-contain` aplica CSS visível.
- **2B.5**: alterar `primary_color` → Header muda em 1s (live preview); `font_weight` efetivamente altera DOM (inspecionar).
- **2B.6**: criar podcast → aparece em `/podcast/[slug]`; YouTube inválido rejeitado.
- **2B.7**: upload vídeo biblioteca mostra progresso; delete remove de Storage também; `/biblioteca` reflete.
- **2B.8**: busca filtra em 200ms; reordenação salva atomicamente.
- **2B.9**: acesso `/admin/relatorios` pede Supabase login (não senha).

**Fase 3**: criar slot no manager → aparece em 1s no Combobox do editor; home exibe badge "Patrocinado" em card com `is_sponsored_content`; zod bloqueia slot sem `width/height`.

**Fase 4**: rolar até ver ad por 1s → `ad_impressions` recebe row; click → `ad_clicks` recebe row; dashboard tremor mostra CTR ≠ 0.

**Fase 5**: arrastar bloco Grid3, escolher 3 notícias, publicar → home reflete em ≤ 1 refresh; feature flag off → layout legado.

**Fase 6**: login como `autor` só vê próprios rascunhos; revisor aprova → `scheduled`; `pg_cron` promove para `published`; `admin_actions` tem log.

---

## Cronograma estimado

| Fase | Duração | Descrição |
|---|---|---|
| 0 | 3–5 dias | Foundation + instalação completa de todas as deps (shadcn, Puck, tremor, framer, tanstack, react-hook-form, zod, cmdk, vaul, dompurify, plaiceholder, playwright) |
| 1 | 4–5 dias | Home Polish |
| 2 | 4–5 dias | Admin Shell |
| 2B | 8–10 dias | Reorg módulo-a-módulo (9 sub-fases) |
| 3 | 4–5 dias | Ad Manager Premium |
| 4 | 3–4 dias | Ad Analytics |
| 5 | 6–7 dias | Page Builder Puck |
| 6 | 4–5 dias | Governance + Auth consolidation |

**Total**: ~36–45 dias úteis, sequencial estrito, cada fase (e sub-fase da 2B) merge-able e shippable.
