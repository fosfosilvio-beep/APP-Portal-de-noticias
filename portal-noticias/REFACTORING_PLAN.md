# 🏗️ Plano de Refatoração Premium — Portal de Notícias

**Status Geral**: Fase 2B concluída ✅ | Fase 3 pronta para iniciar 🚀

---

## 📊 Quick Reference — Checklist de Fases

- [x] **Fase 0.1** — Instalar todas as dependências ✅
  - ✅ next-themes, @supabase/ssr, sonner
  - ✅ cmdk, vaul, framer-motion
  - ✅ react-hook-form, zod, @hookform/resolvers
  - ✅ @tanstack/react-query, @tanstack/react-table
  - ✅ @measured/puck
  - ✅ recharts (Tremor removido, React 19 incompatível)
  - ✅ dompurify, date-fns, plaiceholder, @playwright/test
  - ✅ `npm run build` passou

- [x] **Fase 0.2** — Gerar shadcn/ui components ✅
  - ✅ Gerados 25 componentes em `src/components/ui/`
  - ✅ Corrigido `components.json` e `tsconfig.json` aliases

- [x] **Fase 0.3** — Configurar tokens CSS + Providers ✅
  - ✅ `src/app/globals.css` — Soft UI tokens (shadows, radii, easing, spacing, colors)
  - ✅ `src/app/layout.tsx` + `Providers.tsx` — ThemeProvider, Toaster, QueryClientProvider
  - ✅ `src/lib/supabase-browser.ts` e `supabase-server.ts` (split SSR)
  - ✅ `src/lib/query-client.ts` (singleton)

- [x] **Fase 0.4** — Quick wins visuais ✅
  - ✅ Header: ThemeToggle (dark/light) integrado
  - ✅ HeroBanner: corrigidas alturas (h-40/64/80), lógica object-fit
  - ✅ FooterAdBanner: removido overflow-hidden, aspect-ratio aplicado

- [x] **Fase 0.5** — Tipos Supabase + Verify ✅
  - ✅ Gerar tipos: `npx supabase gen types typescript`
  - ✅ Verificação: `npm run build` e `typecheck` passando (UTF-8 fix)

---

## 🎯 Próximas Etapas (Críticas — implementar com Claude por aqui)

| Fase | Descrição | Status | Duração | Prioridade |
|---|---|---|---|---|
| **1** | Home Polish (refator page.tsx, grid, micro-interações) | Concluído ✅ | 4–5d | 🔴 Crítica |
| **2** | Admin Shell (sidebar, rotas, padrões unificados) | Concluído ✅ | 4–5d | 🔴 Crítica |
| **2B** | Reorganização Módulo-a-Módulo (9 sub-fases) | Concluído ✅ | 8–10d | 🟡 Alta |
| **3** | Ad Manager Premium (abas, diretrizes, badge) | Concluído ✅ | 4–5d | 🟡 Alta |
| **4** | Ad Analytics (tracking, dashboard) | Planejado | 3–4d | 🟡 Alta |
| **5** | Page Builder Puck (editor visual home) | Planejado | 6–7d | 🟡 Alta |
| **6** | Governance & Auth (roles, approval workflow) | Planejado | 4–5d | 🟢 Normal |

---

## 📝 Instruções para Agentes (IDE)

### Como atualizar este plano

Após **cada fase concluída com sucesso**, atualize:

1. Marque como ✅ na seção "Checklist de Fases"
2. Atualize a data/hora de conclusão
3. Liste qualquer problema encontrado ou ajuste necessário
4. Indique se a próxima fase está pronta para começar
5. Faça um commit com a mensagem: `docs: update REFACTORING_PLAN.md (Fase X.Y completed)`

### Padrão de Commit para Fases

```bash
git commit -m "Fase 0.2: Gerar shadcn/ui components

- Gerados 25 componentes em src/components/ui/
- Components: button, card, tabs, dialog, alert-dialog, dropdown-menu, sheet, badge, separator, skeleton, input, label, form, select, tooltip, textarea, switch, popover, command, combobox, table, scroll-area, avatar, progress, toggle
- ✓ npm run build, typecheck, dev todos passando

Co-Authored-By: [Your Name] <your.email@example.com>"
```

### Quando Parar e Chamar Claude

Pare e chame Claude (via comunicação em plataforma) quando:

1. ❌ Um step falha repetidamente e você não consegue diagnosticar
2. ⚠️ Encontrar incompatibilidades não previstas (como Tremor + React 19)
3. 🤔 Precisar tomar decisão arquitetural (qual alternativa usar?)
4. 🔄 Precisar integrar com steps em paralelo (sincronização)
5. 🚀 Fase 1+ começar (sempre crítica — Claude será envolvido)

---

## 🔗 Links Importantes

- **Plano Completo** (com todos os detalhes): `.claude/plans/c-users-nossa-webtv-videos-grava-es-de-distributed-abelson.md`
- **Monorepo Root**: verificar `package-lock.json` para resolvê-lo via `turbopack.root` no `next.config.ts`

---

## 💡 Dicas para Agentes

1. **Teste após cada mudança**: `npm run build && npm run typecheck && npm run dev` (quick validation)
2. **Commits frequentes**: uma sub-fase = um commit (fácil rollback)
3. **Reutilize componentes**: evite duplicação; verifique `src/components/` antes de criar novos
4. **Tipos Supabase**: sempre use tipos gerados (nunca `any`)
5. **Dark mode**: todo novo componente deve suportar `.dark` via Tailwind

---

## 📞 Escalação para Claude

Quando chamar, forneça:
- Fase atual (ex: "0.3")
- Erro específico ou questão de design
- Que você tentou já
- Link para o arquivo problemático se aplicável

Exemplo mensagem:
```
Estou na Fase 0.3 — Configurar tokens CSS.
Problema: Tailwind v4 não está reconhecendo @source directive em globals.css.
Tentei: adicionar @source "../node_modules/@measured/puck"; e rodar build.
Erro: "Warning: @source not recognized"
Arquivo: src/app/globals.css (linhas 1–20)
```

---

**Última atualização**: 2026-04-22 21:00 UTC (Fase 2B concluída — Migração de Módulos completa, pronto para Fase 3)
