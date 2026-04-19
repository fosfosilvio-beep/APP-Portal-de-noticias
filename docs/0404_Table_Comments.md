# [0404] Tabela: comentarios_noticias

Tabela responsável por armazenar as interações dos usuários nas matérias do portal via NextAuth.

## Estrutura de Dados (Supabase)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | `uuid` (PK) | Identificador único do comentário |
| `noticia_id` | `uuid` (FK) | Relacionamento com a tabela `noticias` |
| `usuario_nome` | `text` | Nome do usuário (vindo do Auth Social) |
| `usuario_email` | `text` | E-mail do usuário |
| `usuario_imagem` | `text` | URL da foto do perfil |
| `conteudo` | `text` | Texto do comentário |
| `created_at` | `timestamptz` | Data e hora da postagem |
| `aprovado` | `boolean` | Flag para moderação (default: true) |

## Políticas de RLS (Row Level Security)
- **Select**: Permitido para todos os usuários (público).
- **Insert**: Permitido apenas para usuários autenticados via NextAuth.
- **Update/Delete**: Restrito ao proprietário do comentário ou Administradores.

## Queries Estreitadas
```sql
-- Buscar comentários por notícia
SELECT * FROM comentarios_noticias 
WHERE noticia_id = 'ID_DA_NOTICIA' 
AND aprovado = true 
ORDER BY created_at DESC;
```

---
Status: Documentado (Aguardando Criação na DB)
Relacionado: [[0202] Noticia Detalhe](../02XX/0202_Noticia_Detalhe.md)
