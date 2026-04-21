# [0405] Tabela: notificacoes

Armazena notificações in-app geradas automaticamente a cada nova matéria publicada.

## Informações Gerais
- **Criada via**: Migração `20260421_reengenharia_banco.sql`
- **Alimentada por**: Trigger `trg_nova_noticia` → Função `fn_notificar_nova_noticia()`
- **Consumida por**: Componente `NotificationBell.tsx` via Supabase Realtime

## Contrato de Dados (Esquema)

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | UUID (PK) | Identificador único da notificação. |
| `noticia_id` | UUID (FK → noticias.id) | Referência à notícia que originou a notificação. |
| `titulo` | TEXT | Título da notícia copiado no momento do INSERT. |
| `lido_por` | UUID[] | Array de `auth.uid` que marcaram como lido (reservado). |
| `created_at` | TIMESTAMPTZ | Data/hora de criação automática. |

## RLS (Row Level Security)
- **SELECT**: Público (`anon`) — política `anon_select_notificacoes`.
- **INSERT**: Apenas via trigger do banco (SECURITY DEFINER). Usuários não inserem diretamente.

## Fluxo de Notificação
1. Admin publica nova matéria → `INSERT` em `noticias`.
2. Trigger `trg_nova_noticia` captura o evento.
3. Insere linha em `notificacoes` com `noticia_id` e `titulo`.
4. `NotificationBell.tsx` recebe o evento via **Supabase Realtime** (channel `notificacoes_realtime`).
5. Contador do sino incrementa na UI. Dropdown exibe a notificação.
6. Usuário clica → navega para `/noticia/{noticia_id}`.
7. Estado "lido" persiste no `localStorage` do browser (chave: `notifs_lidas`).

## Componente Frontend
- **Arquivo**: `src/components/NotificationBell.tsx`
- **Localização**: Integrado no `Header.tsx` ao lado do indicador TV Ao Vivo.
- **Comportamento**: Carrega últimas 10 notificações, escuta Realtime, persiste lidas localmente.

---
Status: Documentado — Criado em 2026-04-21
Relacionado: [[0401] Table_Noticias](0401_Table_Noticias.md) | [[0211] NotificationBell](../02XX/0211_NotificationBell.md)
