# 0402 - Tabela: live_messages (Chat Realtime)

## 1. Propósito
Garantir total posse e governança da base de usuários ativos e leads qualificados através das interações do Chat Ao Vivo, substituindo o IFrame do Facebook Comments ou do YouTube Live e absorvendo todas as mensagens diretamente para o banco do portal via Realtime WebSockets.

## 2. Estrutura (Schema)
*   `id` (UUID): Primary Key auto-gerada.
*   `profile_id` (UUID): FK conectada à tabela `profiles`, representando o "autor" da mensagem.
*   `conteudo` (TEXT): A mensagem textual do Chat.
*   `is_admin_msg` (BOOLEAN): Tag visual para respostas da equipe da emissora.
*   `created_at` (TIMESTAMPTZ): TIMESTAMP.

## 3. Row Level Security (RLS)
*   **Permissão Pública (SELECT)**: Qualquer usuário anônimo observa o bate-papo, mas o formulário de Input não.
*   **Inserção (INSERT)**: Protegido. O owner_id (user autenticado pela Session token) deve garantir que é dele a postagem: `CHECK (auth.uid() = profile_id)`.
*   **Exclusão (DELETE)**: Apenas funções RLS restritas ao serviço podem apagar, por isso os Admins limpam a base via painel Cockpit.
