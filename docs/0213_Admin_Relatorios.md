# [0213] Tela: Admin — Relatórios de Visualizações

Painel privado de analytics com dados reais de visualizações de matérias e desempenho de publicidade.

## Informações Gerais
- **Rota**: `/admin/relatorios`
- **Arquivo**: `src/app/admin/relatorios/page.tsx`
- **Acesso**: Protegido por senha (`admin`) — igual ao painel principal.
- **Responsabilidade única**: Exibir métricas reais e auditoria detalhada de acessos.

## Funcionalidades

### Views de Notícias (Auditoria Profissional)
- **Painel de Auditoria**: Números de views agora são clicáveis, abrindo um modal com a lista detalhada de acessos (Usuário, Cidade/Estado e Hora).
- **Inteligência Geográfica**: Gráfico (Pie) exibindo as Top 5 Cidades que mais consomem o portal.
- **Horários de Pico**: Gráfico de linha (Trend) mostrando os acessos hora a hora nas últimas 24h.
- **Views Reais**: Sincronizadas via `noticia_logs` para garantir integridade.
- **Exportação**: CSV e PDF mantidos para relatórios externos.

### Analytics de Publicidade
- **Impressões e Cliques**: Rastreamento granular de banners.
- **CTR Médio**: Cálculo em tempo real.

## Dados (Fetch)
- **Tabela**: `noticias` — campo `views_reais`.
- **Tabela**: `noticia_logs` — fonte da verdade para auditoria e geolocalização.
- **RPCs**: `get_top_cities`, `get_peak_hours`, `update_news_view_count`.

---
Status: Atualizado em 2026-05-04 (Upgrade de Auditoria e Geolocation concluído)
Relacionado: [[0410] Table_NoticiaLogs](../04XX/0410_Table_NoticiaLogs.md) | [[0203] Admin_Dashboard](0203_Admin_Dashboard.md)
