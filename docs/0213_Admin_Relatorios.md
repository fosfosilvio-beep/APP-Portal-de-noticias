# [0213] Tela: Admin — Relatórios de Visualizações

Painel privado de analytics com dados reais de views por matéria, geolocalização e exportação PDF.

## Informações Gerais
- **Rota**: `/admin/relatorios`
- **Arquivo**: `src/app/admin/relatorios/page.tsx`
- **Acesso**: Protegido por senha (`admin`) — igual ao painel principal.
- **Responsabilidade única**: Exibir métricas reais (sem multiplicação) e exportar relatório.

## Funcionalidades

### Cards de Resumo
- Total de matérias filtradas.
- Views Reais (banco — sem multiplicação).
- Views Públicos (×9 — como o leitor vê).

### Geolocalização da Sessão
- Detecta IP, Cidade, Estado e País do administrador via API Route `/api/geo`.
- A API Route faz proxy para `ip-api.com` server-side para evitar bloqueios CORS.

### Filtros
| Filtro | Tipo | Descrição |
| :--- | :--- | :--- |
| Título | text | Busca case-insensitive via `ilike`. |
| Data Início | date | Filtra matérias a partir desta data. |
| Data Fim | date | Filtra matérias até esta data. |

### Tabela de Relatório
- Colunas: `#`, Matéria, Categoria, Data de Publicação, Views Reais, Views Públicos (×9).
- Total consolidado no rodapé da tabela.

### Exportação PDF
- Utiliza `html2pdf.js` (instalado via npm).
- Exporta a tabela filtrada em formato A4 landscape.
- Nome de arquivo: `relatorio-views-YYYY-MM-DD.pdf`.

## Dados (Fetch)
- **Tabela**: `noticias` — campos `id, titulo, categoria, created_at, real_views, slug`.
- **API**: `/api/geo` — geolocalização por IP.

## Acesso pelo Admin Principal
- Link "Relatórios de Views" com ícone `↗` no menu lateral de `/admin`.
- Abre em nova aba.

---
Status: Documentado — Criado em 2026-04-21
Relacionado: [[0401] Table_Noticias](../04XX/0401_Table_Noticias.md) | [[0203] Admin_Dashboard](0203_Admin_Dashboard.md)
