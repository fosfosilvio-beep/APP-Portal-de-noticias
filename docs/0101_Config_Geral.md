# [0101] Configurações Gerais

Documentação do ecossistema de infraestrutura do Portal Nossa Web TV.

## Variáveis de Ambiente (`.env.local`)

| Variável | Obrigatório | Descrição |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Sim | Endpoint da API do Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sim | Chave pública anônima para interações client-side. |
| `OPENROUTER_API_KEY` | Sim | Provedor **primário** de IA. Utilizado em `/api/generate-news` e `/api/gerar-noticia`. |
| `GEMINI_API_KEY` | Sim | Provedor **fallback** de IA (Google Gemini 2.0 Flash). Ativado automaticamente se o OpenRouter falhar. |
| `BUNNY_API_KEY` | Sim | Chave de API da conta Bunny.net para upload de vídeos. |
| `NEXT_PUBLIC_BUNNY_LIBRARY_ID` | Sim | ID da Video Library no Bunny Stream. |

## Arquitetura de IA (Motor com Fallback)

A lógica de geração de IA está centralizada em `src/lib/ai-provider.ts`.

**Fluxo de execução:**
1. Tenta `OpenRouter` (modelo padrão: `anthropic/claude-3.5-sonnet:beta`).
2. Se o OpenRouter falhar (erro HTTP, quota, chave inválida), ativa automaticamente o **fallback** via `Google Gemini 2.0 Flash`.
3. Se ambos falharem, retorna erro `500` com mensagem descritiva.

**Rotas que usam o motor:**
- `src/app/api/generate-news/route.ts` — geração e reescrita de notícias (painel admin).
- `src/app/api/gerar-noticia/route.ts` — geração rápida de notícias.

**Campo `_provider` na resposta:** As rotas incluem o campo `_provider: "openrouter" | "gemini"` na resposta JSON para rastreabilidade em logs.

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
Última Auditoria: 2026-04-24
Observação: A autenticação administrativa é baseada em segredo compartilhado no frontend (`admin`).

