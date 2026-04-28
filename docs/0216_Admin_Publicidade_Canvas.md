# [0216] Módulo: Editor Visual de Publicidade (Canvas Split-View)

Interface avançada de gerenciamento de anúncios com drag-and-drop e preview ao vivo do portal.

## Informações Gerais
- **Rota**: `/admin/publicidade`
- **Arquivo de entrada**: `src/app/admin/publicidade/page.tsx`
- **Componente raiz**: `src/components/admin/ads/AdCanvasEditor.tsx`
- **Hook de estado**: `src/hooks/useAdCanvas.ts`
- **Responsabilidade única**: Permitir alocação visual e configuração de banners publicitários em zonas do layout do portal, com persistência no Supabase.

---

## Arquitetura de Componentes

```
AdCanvasEditor (raiz + DndContext)
├── AdBannerLibrary     (painel esquerdo — itens Draggable)
├── PortalCanvas        (painel central — canvas com Droppable zones)
│   ├── HomeCanvas       (tab Home: 6 DropZones)
│   └── ArticleCanvas    (tab Notícia: 5 DropZones)
└── AdPropertiesPanel   (painel direito — configuração do slot selecionado)

useAdCanvas (hook)
└── Gerencia: slots[], assignments{}, CRUD, upload, persistência
```

---

## Zonas de Drop — Contrato

| Zone ID | Página | Descrição | Dimensão Padrão |
|---|---|---|---|
| `home__header_top` | Home | Banner topo antes do conteúdo | 728×90 |
| `home__hero_below` | Home | Abaixo do carrossel hero | 970×90 |
| `home__sidebar_1` | Home | Sidebar direita bloco 1 | 300×250 |
| `home__sidebar_2` | Home | Sidebar direita bloco 2 | 300×400 |
| `home__between_articles` | Home | Entre os artigos do feed | 728×90 |
| `home__footer_top` | Home | Acima do footer | 728×90 |
| `article__header_top` | Notícia | Topo da página de artigo | 728×90 |
| `article__in_article_1` | Notícia | Dentro do texto (após 2º §) | 468×60 |
| `article__in_article_2` | Notícia | Dentro do texto (após 5º §) | 468×60 |
| `article__sidebar_1` | Notícia | Sidebar da notícia | 300×250 |
| `article__footer_top` | Notícia | Acima do footer na notícia | 728×90 |

---

## Contrato de Dados (Tabela `ad_slots`)

```typescript
interface AdSlot {
  id: string;
  nome_slot: string;
  posicao_html: string;       // legado — mantido para DynamicAdSlot
  zone_id: string | null;     // novo — formato "{pagina}__{zona}"
  dimensoes: string;          // ex: "728x90"
  codigo_html_ou_imagem: string | null;
  status_ativo: boolean;
  advertiser_name: string | null;
  click_url: string | null;
  end_date: string | null;
  custom_width: number | null;   // dimensão W customizada em px
  custom_height: number | null;  // dimensão H customizada em px
  zone_order: number;            // ordem quando múltiplos banners por zona
}
```

### Migração SQL Necessária
Arquivo: `supabase/migrations/20260428_ad_slots_canvas_upgrade.sql`
- Adiciona: `custom_width`, `custom_height`, `zone_order`, `zone_id`
- Migra `posicao_html` legado para `zone_id` automaticamente

---

## Fluxo de Drag-and-Drop

1. Admin arrasta banner da `AdBannerLibrary` (Draggable)
2. `DragOverlay` exibe card flutuante com prévia
3. Admin solta em uma `DropZone` válida (Droppable)
4. `useAdCanvas.assignToZone()` atualiza `assignments` (local)
5. Painel de propriedades abre automaticamente
6. Admin ajusta dimensões, link, expiração
7. Admin clica **"Publicar Tudo"** → `saveAll()` faz upsert no Supabase

---

## Persistência e Retrocompatibilidade

- O campo `zone_id` é o novo identificador canônico
- O campo `posicao_html` é mantido por retrocompatibilidade com `DynamicAdSlot`
- Ao salvar, o hook atualiza **ambos** os campos quando possível

---

## Design System

- Layout: Split View — 256px biblioteca | flex canvas | 288px propriedades
- Tema do canvas: `bg-slate-900` simulando contraste do portal real
- Portal preview: `bg-white` dentro do canvas escuro
- Drag overlay: card com `rotate-2 scale-105 shadow-2xl border-blue-400`
- Drop zone vazia: `border-dashed border-slate-600`
- Drop zone hover: `ring-2 ring-cyan-400 bg-cyan-500/10`
- Drop zone ocupada: `border-solid border-emerald-500/50 bg-emerald-900/20`

---

Status: Implementado — 2026-04-28
Relacionado: [[0203] Admin Dashboard](0203_Admin_Dashboard.md) | [[0402] Table Config Portal](../04XX/0402_Table_Config_Portal.md)
