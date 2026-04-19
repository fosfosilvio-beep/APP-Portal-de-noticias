# [0101] Configurações Gerais

Documentação do ecossistema de infraestrutura do Portal Nossa Web TV.

## Variáveis de Ambiente (`.env.local`)

| Variável | Obrigatório | Descrição |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Endpoint da API do Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave pública anônima para interações client-side. |
| `OPENROUTER_API_KEY` | Sim | Chave para o motor de IA (utilizado em `/api/generate-news`). |

## Supabase (Backend as a Service)

- **Storage**: Bucket `videos` utilizado para upload de banners publicitários e vídeos de notícias.
- **Database**: PostgreSQL hospedado no Supabase.
- **Realtime**: Utilizado para alternar o status da Live globalmente sem refresh (tabela `configuracao_portal`).

## Padrões de Projeto

1. **Framework**: Next.js 14+ (App Router).
2. **Estilização**: Tailwind CSS.
3. **Ícones**: Lucide React.
4. **Client-Side Data**: Fetching direto via Supabase JS Client em componentes `"use client"`.

---
Status: Documentado
Observação: A autenticação administrativa é baseada em segredo compartilhado no frontend (`admin`).
