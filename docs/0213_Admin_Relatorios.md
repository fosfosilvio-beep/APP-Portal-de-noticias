# [0213] Tela: Admin — Relatórios de Visualizações

Painel privado de analytics com dados reais de visualizações de matérias e desempenho de publicidade.

## Informações Gerais
- **Rota**: `/admin/relatorios`
- **Arquivo**: `src/app/admin/relatorios/page.tsx`
- **Acesso**: Protegido por senha (`admin`) — igual ao painel principal.
- **Responsabilidade única**: Exibir métricas reais (sem multiplicação) e exportar relatório.

## Funcionalidades

### Views de Notícias
- **Total Matérias**: Contagem dinâmica total baseada nos filtros aplicados.
- **Views Reais**: Soma da coluna `view_count` da tabela `noticias`.
- **Filtros**: Título (ilike), Data Início (gte) e Data Fim (lte).
- **Tabela**: Listagem das matérias com data de publicação e contagem real de visualizações.
- **Exportação**: CSV e PDF (via html2pdf.js).

### Analytics de Publicidade
- **Impressões**: Contagem de registros na tabela `ad_impressions` vinculados aos slots.
- **Cliques**: Contagem de registros na tabela `ad_clicks`.
- **CTR Médio**: Cálculo em tempo real (Cliques / Impressões * 100).
- **Filtros por Período**: Permite analisar o desempenho de banners em janelas de tempo específicas.

## Dados (Fetch)
- **Tabela**: `noticias` — campo `view_count`.
- **Tabela**: `ad_impressions` e `ad_clicks` — para rastreamento granular.
- **Tabela**: `ad_slots` — para mapeamento de nomes de posições.

---
Status: Atualizado em 2026-05-04 (Limpeza de métricas fakes concluída)
Relacionado: [[0401] Table_Noticias](../04XX/0401_Table_Noticias.md) | [[0203] Admin_Dashboard](0203_Admin_Dashboard.md)
