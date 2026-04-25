# [0402] Tabela: configuracao_portal

Gerencia o estado global do portal, incluindo status de transmissão e espaços publicitários.

## Contrato de Dados (Esquema)

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | INTEGER (PK) | Geralmente ID 1 (Single Row). |
| `is_live` | BOOLEAN | Switch global para "Modo Cinema / Ao Vivo". |
| `url_live_facebook` | TEXT (URL) | URL da transmissão atual. |
| `fake_viewers_boost` | INTEGER | Número fictício de espectadores para contador social. |
| `banner_anuncio_home` | TEXT (URL) | URL da imagem do banner principal na home. |
| `link_anuncio_home` | TEXT (URL) | Link de destino do banner home. |
| `banner_vertical_noticia` | TEXT (URL) | URL do banner lateral fixo. |
| `link_vertical_noticia` | TEXT (URL) | Link de destino do banner lateral. |
| `live_last_ended_at` | TIMESTAMP | Registro de quando a última live foi encerrada. |
| `openrouter_api_key` | TEXT | Chave de autorização para o Copiloto IA no painel admin. |
| `facebook_page_url` | TEXT | URL da página FB para importação do widget na Home. |
| `youtube_channel_url` | TEXT | URL do Canal/Playlist Base para a seção Biblioteca. |
| `url_live_youtube` | TEXT | Link do player caso a live seja pelo YouTube. |
| `mostrar_live_facebook` | BOOLEAN | Chave secundária para forçar a prioridade do Módulo Live para o FB em vez do YT. |
| `ad_slot_1` | JSONB | Estrutura: `{ image_url, link, visible }` |
| `ad_slot_2` | JSONB | Estrutura: `{ image_url, link, visible }` |
| `hero_banner_items` | JSONB | Array de objetos: `[{ image, link, duration, scale, animation }]` |
| `titulo_live` | TEXT | Título overlay para a transmissão ativa. |
| `descricao_live` | TEXT | Descrição overlay para a transmissão ativa. |
| `organic_views_enabled` | BOOLEAN | Ativa a flutuação orgânica visual de espectadores. |
| `ui_settings` | JSONB | Controle visual da UI (Logo, fontes, cores primárias, toggles de sidebar, alertas de Breaking News). |

## Uso no Frontend
- Utilizado na Home para alternar layouts (Bento vs Cinema).
- Utilizado no SmartPlayer para definir a fonte primária de vídeo.
- Sincronizado via Supabase Realtime para atualizações instantâneas.

---
Status: Documentado
Relacionado: [[0201] Home](../02XX/0201_Home.md)
