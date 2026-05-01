# [0217] Componente: Header (Navegação Global)

O Header é o componente mestre de navegação e identidade visual do portal, responsável por gerenciar a troca de categorias e o acesso a áreas institucionais.

## Lógica de Navegação Absoluta

Para evitar erros de rotas relativas (como `/noticia/esportes`), o Header utiliza:
1.  **Caminhos Absolutos**: Todos os links são gerados com uma barra inicial (`/`).
2.  **Componente `<Link>`**: Utilizado para navegação otimizada sem recarregamento de página.
3.  **Handle Smart Click**: 
    - Se o usuário estiver na Home (`/`), o clique em uma categoria apenas filtra o estado local (`setCategoriaAtiva`) e faz scroll suave.
    - Se o usuário estiver em qualquer outra página (`/noticia/[slug]`, `/biblioteca`, etc), o clique força uma navegação real para a raiz da categoria (`/categoria`).

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
