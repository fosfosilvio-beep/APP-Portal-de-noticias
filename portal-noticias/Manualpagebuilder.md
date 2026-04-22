# Manual do Page Builder — Portal de Notícias

**Base técnica**: `@measured/puck` (MIT) + React 19 + Next 16 (App Router) + Tailwind v4 + shadcn/ui + framer-motion + Supabase.
**Escopo**: editor visual da home (`/admin/home-builder`) e, futuramente, páginas editoriais especiais (cobertura eleitoral, dossiês, landings patrocinadas).
**Layout escolhido**: blocos à **direita**, canvas ao **centro**, inspetor à **esquerda**. Puck por padrão inverte isso; faremos override via slot customizado (`<Puck.Components />` e `<Puck.Fields />` posicionados manualmente em um grid CSS de 3 colunas).

---

## 1. Arquitetura de Painéis

### 1.1 Painel Direito — Biblioteca de Blocos (`<BlocksSidebar />`)

**Largura**: 280px desktop; colapsa para drawer vaul em mobile (<1024px).
**Conteúdo**: lista vertical de blocos agrupados por categoria (accordion shadcn), cada card arrastável com thumbnail, nome e ícone.
**Busca**: campo `<Input>` no topo com filtro fuzzy (cmdk) por nome/tag.
**Favoritos**: estrela por bloco (persiste em `localStorage: puck_favorites`).
**Recentes**: topo da lista mostra os 5 últimos blocos arrastados.

**Categorias (accordion)**: Editoriais; Publicidade; Widgets; Multimídia; Layout; CTA; Social; Personalizados.

**Elementos visuais do card arrastável**:
`thumbnail 100x60`; `nome`; `ícone lucide`; `badge "Novo"`; `badge "Patrocinado"`; `badge "Beta"`; `handle de drag`; `botão favoritar (estrela)`; `tooltip descrição`; `indicador de cor por categoria (borda-left 2px)`.

### 1.2 Painel Central — Canvas Editorial (`<Canvas />`)

**Largura**: fluida (`1fr`); respeita breakpoints do modo de visualização.
**Fundo**: grid de pontos sutis (8px) em `--muted/0.3`, desaparece ao preview.
**Scroll**: vertical nativo; barra custom fina (`scrollbar-thin`).
**Zoom**: slider 50%–150% na topbar (atalho `Ctrl + / Ctrl -`).
**Régua**: opcional (toggle topbar), mostra medidas em px na borda superior e esquerda.
**Outline mode**: toggle topbar, renderiza só wireframes com labels.

**Ferramentas de edição flutuantes (aparecem ao selecionar bloco)**:
`mover (drag handle)`; `duplicar`; `deletar`; `mover para cima`; `mover para baixo`; `copiar`; `recortar`; `colar`; `salvar como template`; `agrupar com bloco acima`; `desagrupar`; `travar (lock)`; `esconder (hide)`; `mais (dropdown)`.

### 1.3 Painel Esquerdo — Inspetor de Bloco (`<BlockInspector />`)

**Largura**: 320px desktop; drawer esquerda em mobile.
**Vazio-state**: mensagem "Selecione um bloco para editar" + atalho hint.
**Estrutura**: tabs shadcn no topo — **Conteúdo** | **Estilo** | **Avançado** | **SEO**.
**Footer fixo**: botões `Restaurar padrão` e `Duplicar bloco`.

**Tab Conteúdo (props de dados)**:
`titulo`; `subtitulo`; `texto_auxiliar`; `linkUrl`; `linkTarget`; `image_url`; `image_alt`; `noticiaId (combobox)`; `noticiaIds[]`; `categoria (select)`; `tag`; `autor`; `count`; `ordem (dropdown asc/desc)`; `dataInicio`; `dataFim`; `ctaLabel`; `ctaUrl`.

**Tab Estilo (visual)**:
`variant (default/outlined/ghost/elevated)`; `size (sm/md/lg/xl)`; `alinhamento (left/center/right/justify)`; `cor de fundo (color picker + presets)`; `cor do texto`; `padding (top/right/bottom/left sliders)`; `margin (top/right/bottom/left sliders)`; `border radius (preset + custom)`; `shadow (none/sm/md/lg/xl)`; `border (width/style/color)`; `overlay (gradient picker)`; `object-fit (cover/contain/fill)`; `aspect-ratio (16:9/4:3/1:1/3:4/livre)`; `gap (para grids)`; `colunas (1/2/3/4/6/12)`; `background image`; `background video`.

**Tab Avançado**:
`id customizado (HTML anchor)`; `classe CSS extra`; `visibilidade (sempre/desktop/tablet/mobile/logado/deslogado)`; `condicional (horário/categoria/campanha)`; `animação de entrada (fade/slide/zoom + delay/duration)`; `sticky (toggle + offset)`; `z-index`; `data-attributes (key/value)`; `tracking id`; `A/B variant tag`.

**Tab SEO (quando aplicável)**:
`heading level (H1/H2/H3/H4)`; `schema.org type (Article/NewsArticle/Event/Product)`; `og:title override`; `og:image override`; `alt obrigatório`; `noindex block`.

---

## 2. Sistema de Arrastar e Soltar

### 2.1 Ciclo de vida do drag

1. **idle** — bloco parado no sidebar ou canvas.
2. **dragstart** — cursor vira `grabbing`; bloco fica semi-transparente (`opacity-60`); "ghost" segue o cursor.
3. **dragover** — drop zones válidas iluminam; guias de alinhamento aparecem; barra de inserção pulsa.
4. **drop** — animação spring (framer-motion) encaixa o bloco; toast "Bloco adicionado".
5. **dragcancel** (ESC) — ghost volta à origem com animação reversa.

### 2.2 Indicadores visuais durante o drag

`cursor grabbing`; `ghost semi-transparente 60%`; `drop zones destacadas (borda tracejada azul)`; `drop zone ativa (borda sólida + bg primary/10)`; `barra de inserção azul 2px (pulsa)`; `label flutuante "Inserir aqui"`; `slots inválidos em vermelho (borda + ícone X)`; `auto-scroll ao chegar nas bordas do canvas`; `shadow elevada no ghost`; `contador de posição (ex: "3 de 7")`.

### 2.3 Barra de inserção (insertion bar / baliza)

**Descrição**: linha horizontal de 2px (cor `--primary`) que aparece **entre blocos** indicando onde o novo bloco será fixado ao soltar. Com glow sutil (box-shadow blur 8px).
**Comportamento**:
- Aparece quando o cursor cruza a linha média entre dois blocos.
- Anima com `framer-motion` (spring, stiffness 500, damping 30).
- Exibe label "Inserir" do lado direito, 12px, texto primary.
- Pulsa a cada 1.2s quando inativa (sem cursor próximo) por 2s e então some.
- Suporta **orientação horizontal** (blocos stacked) e **vertical** (colunas dentro de Grid3/Grid2).

### 2.4 Guias de alinhamento (snap lines)

**Ativação**: ao arrastar/redimensionar, linhas rosa-fluor (`--accent`) aparecem quando bordas/centro do bloco coincidem com:
- Bordas do canvas (margens globais).
- Bordas de outros blocos (top/bottom/left/right/center-x/center-y).
- Linhas de grid (múltiplos de 8px).
- Linhas de safe-area do breakpoint ativo.

**Tolerância**: 6px — bloco "agarra" (snap) automaticamente.
**Override**: `Alt` durante o drag desliga snap (movimento livre).
**Exibição**: linha 1px com label numérico pequeno na ponta ("128px", "center").

### 2.5 Margens e espaçamento

**Margem global da página**: 16px mobile, 24px tablet, 32px desktop (editável em Settings do Puck).
**Margem por bloco**: configurável via sliders T/R/B/L no inspetor (tab Estilo), valores múltiplos de 4px.
**Visualização hover**: ao passar sobre um bloco, sobreposição mostra margens em **laranja translúcido** e paddings em **verde translúcido** (estilo DevTools).
**Gap em grids**: slider 0–64px com preview live.
**Preset rápido**: botões "Compacto / Normal / Relaxado / Amplo" aplicam margem global.

### 2.6 Drop zones válidas

Cada bloco declara quais slots aceita. Exemplos:
- `Grid3` aceita **apenas** cards (`NewsCard`, `PodcastCard`, `AdSlotCard`).
- `Carousel` aceita cards e imagens.
- `Section` aceita qualquer bloco.
- Blocos de top-level (`Hero`, `BreakingBar`) não podem ser aninhados.

Dragging um bloco inválido destaca drops incompatíveis com borda vermelha e ícone de bloqueio. Tooltip: "Este bloco não aceita {nome}".

---

## 3. Biblioteca de Blocos

### 3.1 Editoriais

`Hero (noticia em destaque);` `HeroDouble (2 notícias lado-a-lado);` `HeroStack (1 grande + 3 pequenas);` `Grid2 (2 cards);` `Grid3 (3 cards);` `Grid4 (4 cards);` `Grid6 (6 cards);` `NewsRow (linha horizontal);` `NewsList (lista vertical compacta);` `CategorySection (header + grid por categoria);` `FeaturedArticle (artigo full-bleed com overlay);` `EditorsPick (curadoria manual);` `MostRead (top 5 mais lidas);` `RelatedNews (relacionadas por tag);` `Timeline (agrupado por data);` `QuoteCard (destaque de citação);` `LiveBanner (cobertura ao vivo).`

### 3.2 Publicidade

`AdSlot (posição nomeada);` `AdHeader (leaderboard 970x90);` `AdSidebar (MREC 300x250);` `AdInArticle (728x90 / 320x100);` `AdFooter (970x250);` `AdNative (parece card editorial + badge Patrocinado);` `AdVideo (video roll autoplay muted);` `AdSticky (fixo bottom mobile).`

### 3.3 Widgets

`PlantaoPolicialWidget;` `ClimaWidget;` `CotacaoWidget (dólar/euro/bitcoin);` `AgendaCulturalWidget;` `EnqueteWidget;` `BreakingNewsBar;` `ScoreboardWidget (placar esportivo);` `TrafegoWidget;` `LoteriaWidget.`

### 3.4 Multimídia

`PodcastFeed (episódios recentes);` `PodcastPlayer (episódio único embutido);` `VideoEmbed (YouTube/Vimeo);` `FacebookLiveEmbed;` `InstagramEmbed;` `TwitterEmbed;` `GaleriaImagens (lightbox);` `BibliotecaVODGrid;` `AudioPlayer (TTS gerado);` `SpotifyEmbed.`

### 3.5 Layout

`Section (container semântico);` `Divider (separador horizontal);` `Spacer (espaço vertical);` `Columns2;` `Columns3;` `Columns4;` `Container (largura customizada);` `FullBleed (largura total viewport);` `StickySection;` `TabsBlock (abas de conteúdo);` `AccordionBlock;` `CardStack.`

### 3.6 CTA

`NewsletterCTA;` `AppDownloadCTA;` `SubscribeCTA (planos pagos);` `WhatsAppGroupCTA;` `DonationCTA;` `SurveyCTA;` `PushNotificationCTA.`

### 3.7 Social

`SocialBar (ícones compartilhar);` `FacebookPageEmbed;` `InstagramFeed;` `TwitterFeed;` `YouTubeChannelStrip;` `CommentsBlock (Disqus/próprio);` `ShareButtonsFloating.`

### 3.8 Personalizados

`HTMLRaw (código livre — sanitizado);` `MarkdownBlock;` `IFrameBlock (URL externa);` `CountdownBlock (evento futuro);` `MapBlock (endereço/lat-lng);` `FormBlock (inputs custom);` `SVGIllustration.`

---

## 4. Controles por Bloco (hover/select floating toolbar)

`arrastar (grab handle);` `duplicar (Ctrl+D);` `deletar (Del);` `mover para cima (↑);` `mover para baixo (↓);` `indentar (Tab);` `desindentar (Shift+Tab);` `copiar (Ctrl+C);` `recortar (Ctrl+X);` `colar (Ctrl+V);` `colar estilo (Ctrl+Shift+V);` `salvar como template;` `substituir por outro bloco;` `ver código JSON;` `travar/destravar (L);` `esconder/mostrar (H);` `agrupar (Ctrl+G);` `desagrupar (Ctrl+Shift+G);` `mais opções (dropdown);` `comentar (para colaboração);` `ver histórico deste bloco.`

---

## 5. Topbar do Editor

**Zona esquerda**: `logo portal;` `breadcrumb (Home > Layout Principal);` `indicador de status (salvo/salvando/erro);` `timestamp último salvamento.`

**Zona central (viewport switcher)**: `desktop (1280px+);` `laptop (1024px);` `tablet (768px);` `mobile (375px);` `mobile pequeno (320px);` `custom (input px).`

**Zona direita**: `undo (Ctrl+Z);` `redo (Ctrl+Shift+Z);` `preview (toggle Ctrl+P);` `toggle régua;` `toggle grid;` `toggle outline;` `zoom slider;` `tema do editor (claro/escuro);` `comentários (sidebar drawer);` `versões (histórico);` `compartilhar preview (URL temp);` `configurações globais;` `publicar (botão primário);` `salvar rascunho (botão secundário);` `menu usuário.`

---

## 6. Configurações Globais da Página (modal acessível pela topbar)

`título da página;` `slug;` `meta description;` `og:image;` `canonical URL;` `robots (index/noindex, follow/nofollow);` `schema.org type;` `cor de fundo global;` `fonte primária;` `fonte secundária;` `largura máxima do conteúdo (max-width);` `margem global (mobile/tablet/desktop);` `breakpoints customizados;` `modo de tema (auto/forçado claro/forçado escuro);` `CSS custom (textarea);` `scripts head;` `scripts body.`

---

## 7. Atalhos de Teclado

`Ctrl+S → salvar rascunho;` `Ctrl+Shift+S → publicar;` `Ctrl+Z → desfazer;` `Ctrl+Shift+Z → refazer;` `Ctrl+D → duplicar bloco;` `Del/Backspace → deletar bloco;` `Ctrl+C/X/V → copiar/recortar/colar;` `Ctrl+A → selecionar todos os blocos;` `Ctrl+G → agrupar seleção;` `Ctrl+K → command palette;` `Ctrl+P → preview;` `Ctrl+/ → atalhos (help);` `Ctrl+F → buscar bloco;` `Ctrl+, → configurações globais;` `Ctrl++/Ctrl- → zoom in/out;` `Ctrl+0 → reset zoom;` `Tab/Shift+Tab → navegar blocos;` `Esc → desselecionar/cancelar drag;` `L → travar bloco;` `H → esconder bloco;` `R → toggle régua;` `G → toggle grid.`

---

## 8. Command Palette (Ctrl+K)

**Categorias de ações**:
`adicionar bloco (com busca fuzzy);` `ir para bloco (navegação);` `mudar viewport;` `aplicar template;` `duplicar página atual;` `exportar JSON;` `importar JSON;` `comparar com publicado;` `reverter para versão;` `copiar shareable link;` `toggle tema escuro;` `abrir configurações;` `publicar agora;` `agendar publicação;` `ajuda.`

---

## 9. Modos de Visualização (viewport switcher)

`desktop 1440px (design-ref);` `desktop 1280px;` `laptop 1024px;` `tablet retrato 768px;` `tablet paisagem 1024px;` `mobile grande 414px;` `mobile médio 375px;` `mobile pequeno 320px;` `4K 2560px;` `custom (input numérico).`

Cada modo aplica:
- Safe-area visual (sombra fora do viewport).
- Snap guides respeitam o breakpoint.
- Props responsivas do bloco mudam conforme viewport ativa (ex: `Grid3` vira `Grid1` em mobile automaticamente se `responsive=true`).
- Toggle "Editar neste viewport" habilita overrides específicos (ex: margem só mobile).

---

## 10. Drop Zones e Regras de Aninhamento

**Hierarquia máxima**: 4 níveis (`Page > Section > Columns > Block`).
**Bloqueios**:
- `Hero` só em nível top-level.
- `AdSlot` pode aninhar em qualquer lugar exceto dentro de outro `AdSlot`.
- `BreakingBar` obrigatoriamente top-level e topo (posição 0).
- `Footer/Header` controlados por layout global, não arrastáveis no canvas.
- Cards só dentro de Grids/Rows/Carousels.

**Validação em tempo real**: Puck valida via `config.fields` e mostra tooltip de erro no ghost durante drag inválido.

---

## 11. Inspetor — Controles Detalhados

### 11.1 Tipos de campos (field types) disponíveis

`text (single-line);` `textarea (multi-line);` `richtext (Tiptap embutido);` `number;` `slider (min/max/step);` `toggle/switch;` `select (enum);` `multiselect;` `radio;` `checkbox;` `combobox (async search, ex: notícias);` `date picker;` `datetime picker;` `time picker;` `color picker (hex + hsl + presets da marca);` `image upload (via uploadMedia);` `video upload;` `file upload;` `url;` `email;` `phone;` `icon picker (lucide);` `font picker;` `spacing control (4 sliders T/R/B/L linkados);` `border control (width + style + color + radius);` `shadow control (preset + custom);` `gradient editor;` `json raw editor (avançado);` `conditional group (mostra campos conforme valor de outro);` `repeater (array de subitems);` `code editor (Monaco lite para HTML/CSS).`

### 11.2 Seletor de notícia (combobox rico)

**Preview no combobox**: `thumbnail;` `título;` `categoria badge;` `data relativa;` `autor;` `status (rascunho/publicada);` `indicador "já usada nesta página".`
**Busca**: debounced 300ms, full-text em `titulo + tags`.
**Scope**: filtro por categoria, status, autor, período.
**Ações inline**: `abrir no editor de notícia;` `trocar por outra;` `ver no site.`

---

## 12. Persistência e Versionamento

### 12.1 Fluxo de salvamento

1. **Auto-save rascunho** a cada 5s de inatividade → `page_layout.draft_data` (JSONB).
2. **Save manual** (`Ctrl+S`) → commit imediato do rascunho + toast.
3. **Publicar** → copia `draft_data` para `published_data` + `published_at = now()` + audit em `admin_actions`.
4. **Agendar** → cria entrada em `scheduled_publications` com `publish_at`; `pg_cron` promove.
5. **Reverter** → restaura versão de `page_layout_versions` (histórico).

### 12.2 Histórico de versões

Tabela `page_layout_versions` (snapshot a cada publicação, mantém 50 últimas):
`id;` `page_layout_id;` `data (JSONB);` `published_by;` `published_at;` `note (opcional);` `diff_summary (gerado server-side).`

**UI**: drawer lateral com lista, diff visual (cores tipo git), botão "Restaurar esta versão".

### 12.3 Branching (opcional futuro)

Permite editar rascunho enquanto versão publicada segue no ar (já nativo em Puck com draft/published split). Fase 2 do builder.

---

## 13. Preview e Colaboração

### 13.1 Preview mode

Toggle `Ctrl+P`: esconde sidebars, canvas ocupa 100%, chrome do navegador simulado. Útil para screenshot/print.

### 13.2 Preview link compartilhável

Gera URL temporária `/preview/[token]` (expira em 24h) que renderiza o rascunho. Para revisão de stakeholders externos sem login.

### 13.3 Comentários inline

Clique direito num bloco → "Comentar". Fica ancorado; notifica via Supabase Realtime + push para editores designados. Thread de respostas. Resolve/reabrir. Integra com `admin_actions`.

---

## 14. Tokens de Design Aplicados

O editor respeita o design system (Fase 0.3 — `globals.css`):
`cores da marca (--primary, --accent, --muted, --destructive);` `radii (4/8/12/16);` `shadows Soft UI (sm/md/lg/xl);` `spacing (múltiplos de 4);` `typography scale (text-xs a text-5xl);` `easing (ease-out-expo, ease-in-out-quart);` `breakpoints Tailwind v4;` `dark mode (.dark).`

**Seletores de cor** no inspetor mostram **primeiro** os tokens da marca, depois palette full. Evita dissonância visual.

---

## 15. Estados e Feedback Visual

### 15.1 Estados de bloco

`idle (padrão);` `hover (borda sutil primary/30);` `selected (borda sólida primary + toolbar flutuante);` `dragging (opacity 60% + cursor grabbing);` `editing (um campo do inspetor focado — pulsa borda);` `locked (ícone cadeado no canto + bloqueia interação);` `hidden (opacity 30% + ícone olho cortado);` `error (borda vermelha + tooltip "Preencha o campo X");` `loading (skeleton enquanto dado async carrega);` `empty-state (placeholder "Escolha uma notícia").`

### 15.2 Toasts de ação

`bloco adicionado;` `bloco duplicado;` `bloco deletado (undo 10s);` `rascunho salvo;` `publicado;` `erro ao salvar;` `versão restaurada;` `comentário resolvido;` `imagem enviada;` `limite atingido.`

### 15.3 Confirmações (AlertDialog)

`deletar página;` `publicar (com diff summary);` `descartar rascunho;` `reverter versão;` `sair sem salvar;` `aplicar template (sobrescreve conteúdo).`

---

## 16. Templates Pré-definidos

Biblioteca de layouts iniciais (`/admin/home-builder/templates`):
`Home Clássica (Hero + Grid3 + Sidebar);` `Home Breaking News (BreakingBar + Hero + Grid6);` `Home Editorial (HeroDouble + CategorySections);` `Cobertura Ao Vivo (LiveBanner + Timeline);` `Especial Eleições;` `Landing Patrocinada;` `Home Limpa (minimal);` `Homepage Mobile-First.`

Usuário salva qualquer página como template custom (`page_templates` table).

---

## 17. Integração com Supabase

### 17.1 Schema

```sql
-- Persistência
CREATE TABLE page_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT,
  draft_data JSONB,
  published_data JSONB,
  settings JSONB, -- meta/og/schema
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE page_layout_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_layout_id UUID REFERENCES page_layout(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  published_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ DEFAULT now(),
  note TEXT,
  diff_summary JSONB
);

CREATE TABLE page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  thumbnail_url TEXT,
  data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE page_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_layout_id UUID REFERENCES page_layout(id) ON DELETE CASCADE,
  block_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  resolved_at TIMESTAMPTZ,
  parent_id UUID REFERENCES page_comments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 17.2 Realtime

Canal `page_layout:{id}` notifica:
`outro editor abriu a mesma página;` `bloco foi modificado;` `comentário novo;` `publicação ocorreu;` `conflito de edição.`

Mostra avatares dos editores online no topbar. Bloqueio otimista com merge.

### 17.3 RLS

- `admin` e `editor`: full CRUD em `page_layout`.
- `autor`: só lê publicado + propõe rascunho (vira `page_layout_proposals`).
- `revisor`: lê rascunhos + publica.
- Leitura pública via Server Component consome `published_data` diretamente sem RLS user-context (usa service role no server).

---

## 18. Renderização Pública

### 18.1 Server Component

`src/app/page.tsx` (home) e `src/app/[slug]/page.tsx` (páginas custom) consultam `page_layout` pela slug, recebem `published_data` e passam para `<PuckRenderer config={puckConfig} data={published_data} />`.

### 18.2 Fallback

Se `published_data = null` ou erro no render → layout legado (grid atual) via feature flag `ui_settings.use_puck_home`.

### 18.3 Performance

- SSG com ISR `revalidate: 60s` para home.
- Imagens dentro de blocos usam `next/image` com `blurDataURL` (plaiceholder).
- framer-motion apenas em blocos acima-da-dobra.

---

## 19. Acessibilidade

`todos botões com aria-label;` `drag-drop acessível via teclado (ARIA DnD spec);` `focus ring visível (shadcn default);` `announcements de screen-reader a cada ação (aria-live);` `contraste AA garantido via tokens;` `respeita prefers-reduced-motion (desliga animações de drop);` `alt obrigatório em imagens (zod valida);` `heading level validator (Puck plugin heading-analyzer).`

---

## 20. Performance do Editor

`lazy-load de blocos (dynamic import por categoria);` `virtualização da lista de blocos se >50;` `debounce 300ms em campos de texto;` `memoização de renders de bloco (React.memo + shallow);` `IntersectionObserver para off-screen blocks;` `web worker para diff de versões grandes;` `IndexedDB cache do config Puck.`

---

## 21. Sub-fases de Implementação (adendo à Fase 5)

### 5.1 — Shell do Editor e Layout de 3 Painéis *(1–2 dias)*
`<PuckEditor />` client-only em `/admin/home-builder`; grid CSS custom (sidebar direita 280px / canvas 1fr / sidebar esquerda 320px); topbar; responsive (drawers em mobile via vaul); tema integrado (next-themes); keyboard-shortcuts hook (`use-hotkeys`); Supabase realtime canal subscribed.

### 5.2 — Configuração Base e Blocos Essenciais *(2 dias)*
`src/lib/puck-config.ts` registra primeiros 8 blocos: `Hero`, `Grid3`, `Grid2`, `NewsCard`, `AdSlot`, `PlantaoPolicialWidget`, `Section`, `Divider`. Cada bloco tem render (reusa componentes do site) + fields (inspetor). Zod validation em cada bloco.

### 5.3 — Sistema de Drag & Drop Premium *(2 dias)*
Override do DnD padrão do Puck com layer custom (Puck usa `react-dnd`; mantemos e estilizamos via CSS + framer-motion no ghost). Snap lines, barra de inserção animada, drop zones iluminadas, auto-scroll nas bordas, indicadores visuais conforme seção 2 deste manual. Toggle Alt para movimento livre. Escape cancela drag.

### 5.4 — Inspetor Avançado *(2 dias)*
4 tabs (Conteúdo/Estilo/Avançado/SEO); custom field types (spacing control, combobox notícias, color picker com tokens da marca, image upload via `uploadMedia`, conditional groups). Live preview dos changes. Reset ao default por campo e por bloco.

### 5.5 — Persistência, Versionamento e Publicação *(2 dias)*
Migrations `page_layout`, `page_layout_versions`, `page_comments`, `page_templates`. Auto-save 5s. Publicar cria version entry. Drawer de histórico com diff. Rollback em 1 clique. Agendamento integrado a `pg_cron`.

### 5.6 — Biblioteca Completa de Blocos *(3–4 dias)*
Restantes ~50 blocos das 8 categorias. Cada bloco documentado, com thumbnail (Playwright gera screenshots), tests de render e props. Blocos que dependem de dados externos (Clima, Cotação) via API com fallback.

### 5.7 — Templates, Comentários, Preview Link, Viewport Switcher *(2 dias)*
Biblioteca de 8 templates iniciais. Sistema de comentários inline com Realtime. URL de preview com token JWT assinado. Viewport switcher com overrides responsivos.

### 5.8 — Renderização Pública + Feature Flag + Fallback *(1 dia)*
`PuckRenderer` Server Component. `ui_settings.use_puck_home` flag. Fallback legado. ISR 60s. Testes de regressão visual com Playwright.

### 5.9 — Polish, Acessibilidade e Performance *(1–2 dias)*
Audit a11y (axe-core). Lighthouse ≥95. Lazy-load blocos. Worker para diff. IndexedDB cache. Onboarding tour (driver.js) para primeiro uso.

**Total Fase 5 expandida**: **16–20 dias** (substitui os 6–7 dias originais; maior escopo merece mais tempo).

---

## 22. Critérios de Aceitação

`editor abre em <2s;` `arrastar um bloco entre 50+ existentes não trava (60fps);` `barra de inserção aparece sem flicker;` `snap lines em todas bordas/centros;` `inspetor atualiza canvas em <100ms;` `auto-save sem perder foco;` `undo/redo ilimitado na sessão;` `publicar aplica em <3s na home pública;` `comentário realtime em <500ms;` `preview link funciona em incognito;` `mobile edita via drawers sem zoom bug;` `dark mode do editor não vaza no preview claro;` `screen-reader navega blocos em ordem lógica;` `teclado-only completa fluxo: adicionar → editar → publicar.`

---

## 23. Riscos Específicos do Builder

| Risco | Mitigação |
|---|---|
| Puck padrão não permite sidebar invertida (blocos direita) | Usar Puck headless API (`<Puck>` provê slots; renderizamos `<Puck.Components>` à direita manualmente). |
| Drag custom conflita com `react-dnd` interno | Não substituir DnD; apenas estilizar ghost/snap via CSS e hook `useDndMonitor`. |
| JSON payload grande trava React 19 concurrent | Virtualizar canvas + memo profundo; limite soft de 200 blocos/página. |
| Conflito de edição simultânea | Lock otimista com lease 30s; aviso se outro editor está no bloco. |
| Fonts customizadas não carregam no preview | Inject `<link>` de fonts no iframe de preview. |
| Block thumbnails desatualizados | Playwright regenera no CI a cada push que toca `puck-config.ts`. |
| Migration de layout legado para Puck JSON | Script one-shot lê `page.tsx` atual e gera JSON seed em `published_data`. Rollback via flag. |

---

## 24. Roadmap Pós-MVP

`editor colaborativo multi-cursor (Yjs);` `A/B testing nativo (variants per bloco);` `heatmap sobreposto (Fase 4 feeding);` `geração de bloco por IA ("Crie uma seção sobre X");` `importar layout de URL concorrente (scraper);` `design tokens editor inline;` `marketplace de blocos comunitários;` `mobile app editor (React Native + Puck headless).`

---

**Versão**: 1.0 — 2026-04-22
**Autor**: Plano de Refatoração Premium (Fase 5 expandida)
**Depende de**: Fases 0, 1, 2, 2B, 3 concluídas.
