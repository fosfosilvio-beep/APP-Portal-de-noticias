# [0410] Tabela: noticia_logs

Tabela de auditoria granular para rastreamento de visualizações de notícias com geolocalização e identificação de usuário.

## Estrutura de Dados (Supabase)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `uuid` (PK) | Identificador único do log |
| `noticia_id` | `uuid` (FK) | Referência para a notícia visualizada |
| `user_id` | `uuid` (FK) | ID do usuário (auth.users) se logado |
| `nome_usuario` | `text` | Nome exibido do usuário |
| `email_usuario` | `text` | E-mail do usuário para auditoria |
| `cidade` | `text` | Cidade detectada via IP (Vercel Geolocation) |
| `estado` | `text` | Estado/Região detectado |
| `ip_address` | `text` | IP do visitante (anonimizado ou original) |
| `user_agent` | `text` | Navegador/Dispositivo do usuário |
| `created_at` | `timestamptz` | Carimbo de data/hora do acesso |

## Políticas de RLS (Row Level Security)
- **Insert**: Público (permitido para todos para registrar o acesso).
- **Select**: Restrito a **Administradores** e **Editores**.
- **Update/Delete**: Desativado (imutabilidade de logs).

## RPCs Relacionadas
- `get_top_cities()`: Retorna as 5 cidades com mais acessos.
- `get_peak_hours()`: Retorna contagem de acessos por hora nas últimas 24h.
- `update_news_view_count(p_noticia_id)`: Sincroniza a contagem total na tabela `noticias`.

---
Status: Documentado (Implementado em 2026-05-04)
Relacionado: [[0213] Admin Relatórios](../02XX/0213_Admin_Relatorios.md)
