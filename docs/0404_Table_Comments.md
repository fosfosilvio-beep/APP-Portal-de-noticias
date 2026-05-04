# [0404] Tabela: comentarios

Tabela responsável por armazenar as interações dos usuários nas matérias do portal. 

## Estrutura de Dados (Supabase)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `uuid` (PK) | Identificador único do comentário |
| `noticia_id` | `uuid` (FK) | Relacionamento com a tabela `noticias` |
| `usuario_id` | `uuid` (FK) | ID do usuário no Supabase Auth (auth.users) |
| `usuario_nome` | `text` | Nome do usuário (vindo do Auth Social ou Profile) |
| `usuario_email` | `text` | E-mail do usuário |
| `usuario_imagem` | `text` | URL da foto do perfil (avatar_url/picture) |
| `comentario` | `text` | Conteúdo do comentário |
| `criado_em` | `timestamptz` | Data e hora da postagem |
| `status` | `text` | Moderação: 'pending', 'approved', 'rejected' (default: 'pending') |

## Políticas de RLS (Row Level Security)
- **Select**: Permitido para todos os usuários (público) onde `status = 'approved'`.
- **Insert**: Permitido apenas para usuários **autenticados**.
- **Update/Delete**: Restrito a Administradores ou Moderadores.

## Queries Estreitadas
```sql
-- Buscar comentários aprovados por notícia
SELECT id, usuario_nome, comentario, criado_em, usuario_imagem 
FROM comentarios 
WHERE noticia_id = 'ID_DA_NOTICIA' 
AND status = 'approved' 
ORDER BY criado_em DESC;
```

---
Status: Documentado (Atualizado em 2026-05-04)
Relacionado: [[0202] Noticia Detalhe](../02XX/0202_Noticia_Detalhe.md)
