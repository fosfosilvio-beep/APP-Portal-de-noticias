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


## RLS (Row Level Security)
- **SELECT**: Público (Anon).
- **INSERT/UPDATE/DELETE**: Restrito a usuários autenticados (Service Role/Admin via client).

---
Status: Documentado
Relacionado: [[0202] Noticia_Detalhe](../02XX/0202_Noticia_Detalhe.md)
