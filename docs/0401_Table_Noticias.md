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
| `categoria` | TEXT | Tag de categoria legada (slug). |
| `categoria_id` | UUID (FK) | Link para a tabela `categorias`. |
| `imagem_capa` | TEXT (URL) | URL da imagem principal. |
| `video_url` | TEXT (URL) | URL de vídeo destacado. |
| `galeria_urls` | TEXT[] | Lista de URLs de fotos para o álbum. |
| `created_at` | TIMESTAMP | Data de criação. |
| `publish_at` | TIMESTAMP | Data agendada para publicação. |
| `status` | TEXT | Status: draft, in_review, scheduled, published, archived. |
| `ordem_prioridade` | INTEGER | Peso para ordenação na home. |
| `mostrar_na_home_recentes` | BOOLEAN | Define se aparece no feed de recentes. |
| `audio_url` | TEXT (URL) | URL do áudio TTS. |
| `seo_tags` | TEXT | Tags para indexação. |
| `is_sponsored` | BOOLEAN | Badge "Patrocinado". |
| `ad_id` | UUID (FK) | Anúncio vinculado à matéria. |
| `colunista_id` | UUID (FK) | Link para a tabela `colunistas`. |
| `ad_id` | UUID (FK) | Anúncio vinculado (`ad_slots.id`). Substitui logicamente `sponsor_id`. |

## Tabelas Relacionadas (criadas em `20260424_audit_fix.sql`)

| Tabela | Propósito |
| :--- | :--- |
| `categorias` | Categorias editoriais (`id, nome, slug, ativa, ordem`). Seed de 10 categorias padrão. |
| `colunistas` | Autores colunistas (`id, nome, slug, bio, foto_url, ativa`). |
| `news_drafts` | Rascunhos por usuário. `UNIQUE(user_id)` — um rascunho ativo por autor. |

## RPC: `slug_disponivel(p_slug, p_excluir_id)`
Verificação de unicidade de slug antes do INSERT/UPDATE. Retorna `TRUE` se o slug está livre.
- Chamada pelo `NewsEditorForm` na função `generateSlug` (fallback `-2`, `-3`...).
- Permissão: `GRANT EXECUTE` para `anon` e `authenticated`.


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
