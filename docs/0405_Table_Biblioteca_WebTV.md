# [0405] Tabela: biblioteca_webtv

Armazena os vídeos enviados manualmente ("On Demand") que não são oriundos de lives passadas.

## Contrato de Dados (Esquema)

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único. |
| `titulo` | TEXT | Nome descritivo do vídeo. |
| `url_video` | TEXT (URL) | URL pública do vídeo (armazenado no Supabase Storage). |
| `categoria` | TEXT | Categoria (Ex: Reportagem, Documentário). |
| `thumbnail` | TEXT (URL) | Imagem de capa. |
| `created_at` | TIMESTAMP | Data do upload. |
| `start_time_sec` | INTEGER | Ponto de início do vídeo (segundos). |
| `end_time_sec` | INTEGER | Ponto de fim do vídeo (segundos). |
| `is_hidden` | BOOLEAN | Define se o vídeo está oculto no portal. |
| `is_pinned` | BOOLEAN | Define se o vídeo está fixo no topo. |

---
Status: Documentado
Relacionado: [[0204] Biblioteca](../02XX/0204_Biblioteca.md)
