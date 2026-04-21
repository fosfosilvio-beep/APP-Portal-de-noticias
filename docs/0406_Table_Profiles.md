# 0406 - Tabela: profiles

## 1. Propósito
A tabela `profiles` estende a autenticação nativa do Supabase (`auth.users`), mantendo dados públicos de usuários como nome completo, avatar e data de criação. Isso permite criar relacionamentos de chave-estrangeira seguros sem expor a tabela auth secreta. A sincronização de dados é garantida por uma Triggers de DB.

## 2. Estrutura (Schema)

*   `id` (UUID): Primary Key, referenciando obrigatoriamente `auth.users(id) ON DELETE CASCADE`.
*   `nome_completo` (TEXT): Nome usado para exibição pública na Home, LiveChat, e comentários.
*   `avatar_url` (TEXT): Foto proveniente da conta Social logada (Google/Meta).
*   `email` (TEXT): Email.
*   `created_at` (TIMESTAMPTZ): Data de sincronização.

## 3. Row Level Security (RLS)
*   **Permissão Pública (SELECT)**: Qualquer usuário, mesmo anônimo, pode acessar os profiles para visualizar a autoria do "LiveChat" enviada por outros.
*   **Inserção (INSERT/UPDATE)**: Apenas o owner do ID pode atualizar seu nome/avatar.

## 4. Trigger de Sincronização
Ao injetar um novo usuário através de Provedores Sociais (`signInWithOAuth`), a Trigger de Banco `handle_new_user()` é acionada, lendo os metadados brutos recebidos da API do Google/Facebook (`new.raw_user_meta_data->>'full_name'`) e persistindo no `profiles`.
