# [0217] Componente: Header (Navegação Global)

O Header é o componente mestre de navegação e identidade visual do portal, responsável por gerenciar a troca de categorias e o acesso a áreas institucionais.

## Lógica de Navegação Absoluta

Para evitar erros de rotas relativas (como `/noticia/esportes`), o Header utiliza:
1.  **Caminhos Absolutos**: Todos os links são gerados com uma barra inicial (`/`).
2.  **Componente `<Link>`**: Utilizado para navegação otimizada sem recarregamento de página.
3.  **Handle Smart Click**: 
    - Se o usuário estiver na Home (`/`), o clique em uma categoria apenas filtra o estado local (`setCategoriaAtiva`) e faz scroll suave.
    - Se o usuário estiver em qualquer outra página (`/noticia/[slug]`, `/biblioteca`, etc), o clique força uma navegação real para a raiz da categoria (`/categoria`).
    - O clique no link "Início" força o reset do estado global `categoriaAtiva` para garantir que a Home exiba as notícias recentes e não o estado anterior (ex: Biblioteca).

## Estado Ativo (Active State)

O item de menu é marcado como ativo se:
- `categoriaAtiva` (via prop) for igual ao nome da categoria.
- O `pathname` atual for idêntico ao `href` do link.
- For o link "Início" e o `pathname` for exatamente `/`.

## Componentes Integrados

- **NotificationBell**: Sino de notificações com contador realtime.
- **ThemeToggle**: Alternador de modo claro/escuro.
- **BreakingNewsMarquee**: Faixa de notícias urgentes (renderização condicional via config).
- **MobileCategoryNav**: Barra de categorias com scroll horizontal integrada ao componente (substituiu o antigo `CategoryNav` externo).
- **LoginModal**: Interface de autenticação Supabase.

---
Status: Documentado
Relacionado: [[0201] Home](0201_Home.md), [[0301] Supabase Client](../03XX/0301_Supabase_Client.md)


## Instalação Manual do PWA

- **Estado**: `showInstallBtn` controla a visibilidade do botão “Instalar Aplicativo”.
- **Lógica**: Detecta `window.deferredPrompt` no `useEffect` de montagem e exibe o botão.
- **Ação**: `handleInstallClick` dispara `deferredPrompt.prompt()`, aguarda a escolha do usuário e, ao aceitar, oculta o botão.
- **Renderização**: O botão aparece ao lado das ações de ícones no cabeçalho, antes do container de ícones padrão.

Esta implementação garante que a instalação do PWA só ocorra mediante interação explícita do usuário, atendendo aos requisitos de UX e acessibilidade.
