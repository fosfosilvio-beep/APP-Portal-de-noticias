# [0200] Índice de Telas e UI

Este documento mapeia todas as rotas e componentes visuais do Portal Nossa Web TV.

## Relação de Rotas (Frontend)

| Rota | Descrição | Arquivo Fonte | Doc Específica |
| :--- | :--- | :--- | :--- |
| `/` | Home / Landing Page | `src/app/page.tsx` | [[0201] Home](0201_Home.md) |
| `/noticia/[slug]` | Visualização de Matéria | `src/app/noticia/[slug]/page.tsx` | [[0202] Notícia](0202_Noticia_Detalhe.md) |
| `/admin` | Dashboard Administrativo | `src/app/admin/page.tsx` | [[0203] Admin Dashboard](0203_Admin_Dashboard.md) |
| `/biblioteca` | Acervo Público de Lives | `src/app/biblioteca/page.tsx` | [[0204] Biblioteca](0204_Biblioteca.md) |
| `/privacidade` | Política de Privacidade | `src/app/privacidade/page.tsx` | [[0206] Privacidade](0206_Privacidade.md) |
| `/termos` | Termos de Serviço | `src/app/termos/page.tsx` | [[0207] Termos de Serviço](0207_Termos_Servico.md) |
| `/admin/biblioteca` | Gerenciamento de Lives | `src/app/admin/biblioteca/page.tsx` | - |

## Componentes Compartilhados (`src/components/`)

- **Header.tsx**: Cabeçalho principal com navegação por categorias e indicador de Live.
- **SmartPlayer.tsx**: Player de vídeo inteligente que alterna entre Live (Facebook/Vimeo) e vídeo da notícia.
- **LiveChat.tsx**: Widget de chat integrado para transmissões ao vivo.
- **AutomatedNewsFeed.tsx**: Feed de notícias externas (G1/Rss) para conteúdo complementar.

## Padrões de Design
- **Cores**: Predomínio de Azul (`#00AEE0`, `#005a78`) e tons de Slate/Slate-50.
- **Fontes**: Sans-serif moderna (Geist/Inter).
- **Estilização**: Tailwind CSS.

---
Status: Auditoria Concluída
Próxima Ação: Documentar cada tela individualmente.
