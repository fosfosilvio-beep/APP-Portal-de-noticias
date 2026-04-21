# [0401] Tabela: noticias

Armazena todas as matérias jornalísticas publicadas no portal.

## Contrato de Dados (Esquema)

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único da notícia. |
| `slug` | TEXT (Unique) | URL amigável da matéria. |
| `titulo` | TEXT | Título principal da notícia. |
| `subtitulo` | TEXT | Linha fina / Subtítulo. |
| `conteudo` | TEXT | Corpo da matéria (suporta quebras de linha). |
| `categoria` | TEXT | Tag de categoria (Ex: Polícia, Esporte, Arapongas). |
| `imagem_capa` | TEXT (URL) | URL da imagem principal (local ou externa). |
| `video_url` | TEXT (URL) | URL de vídeo (upload local ou link externo). |
| `created_at` | TIMESTAMP | Data de criação / publicação. |
| `ordem_prioridade` | INTEGER | Peso para ordenação na home (maior = topo). |
| `mostrar_no_player` | BOOLEAN | Define se deve aparecer no SmartPlayer como destaque. |
| `mostrar_na_home_recentes` | BOOLEAN | Define se deve aparecer no feed de recentes da home. |
| `audio_url` | TEXT (URL) | URL do áudio gerado pelo Google TTS (Cache). |
| `audio_content_hash` | TEXT | Hash do conteúdo usado para invalidar o cache do áudio. |
| `seo_tags` | TEXT | Tags de palavras-chave para indexação. |
| `is_sponsored` | BOOLEAN | Se `true`, exibe badge "Patrocinado" no card e na matéria. |
| `sponsor_id` | UUID (FK, null) | Referência ao patrocinador (futuro: tabela sponsors). |
| `real_views` | INTEGER | Contador de visualizações reais (+1 por acesso único/sessão). |

## Lógica de Views (Bifurcação Frontend vs Admin)
- **Banco de dados**: Guarda apenas `real_views` (incremento atômico via RPC `incrementar_views(uuid)`).
- **Frontend público**: Exibe `real_views * 9` — número inflado para percepção de popularidade.
- **Dashboard Admin (/admin/relatorios)**: Exibe `real_views` bruto, sem multiplicação.
- **Captação**: API Route `/api/track-view` (POST) incrementa +1, uma vez por sessão por notícia (via `sessionStorage`).

## Lógica de Publicidade
- `is_sponsored`: Quando `true`, injeta badge âmbar "⭐ Patrocinado" no canto superior direito do card (Home) e na área de meta da matéria.
- `sponsor_id`: Reservado para futura integração com tabela de anunciantes.

## RLS (Row Level Security)
- **SELECT**: Público (Anon).
- **INSERT/UPDATE/DELETE**: Restrito a usuários autenticados (Service Role/Admin via client).

## Trigger Associado
- `trg_nova_noticia`: Ao inserir (`INSERT`) uma nova notícia, dispara `fn_notificar_nova_noticia()` que cria um registro na tabela `notificacoes`.

---
Status: Atualizado — Reengenharia 2026-04-21
Relacionado: [[0202] Noticia_Detalhe](../02XX/0202_Noticia_Detalhe.md) | [[0405] Table_Notificacoes](0405_Table_Notificacoes.md)
