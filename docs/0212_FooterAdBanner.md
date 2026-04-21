# [0212] Componente: FooterAdBanner

Banner publicitário horizontal de largura total posicionado imediatamente acima do `<footer>`.

## Informações Gerais
- **Arquivo**: `src/components/FooterAdBanner.tsx`
- **Importado em**: `src/app/page.tsx` e `src/app/noticia/[slug]/page.tsx`
- **Responsabilidade única**: Renderizar banner de publicidade full-width antes do rodapé.

## Props

| Prop | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `imageUrl` | `string?` | — | URL da imagem do banner. |
| `link` | `string?` | `"#"` | URL de destino ao clicar no banner. |
| `altText` | `string?` | `"Publicidade"` | Texto alternativo para acessibilidade. |
| `visible` | `boolean?` | `true` | Se `false`, o componente retorna `null`. |

## Comportamento
- Se `imageUrl` fornecida: renderiza imagem clicável com overlay "Publicidade" no canto.
- Se `imageUrl` ausente: renderiza placeholder escuro com texto "Espaço Publicitário Premium".
- Fonte de dados: campos `ad_slot_2` / `banner_anuncio_home` da tabela `configuracao_portal`.

## Posicionamento
Inserido **entre o `</main>` e o `<footer>`** em todas as páginas principais.

---
Status: Documentado — Criado em 2026-04-21
Relacionado: [[0402] Table_Config_Portal](../04XX/0402_Table_Config_Portal.md)
