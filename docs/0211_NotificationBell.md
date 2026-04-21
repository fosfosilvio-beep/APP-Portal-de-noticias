# [0211] Componente: NotificationBell

Sino de notificações in-app no Header do portal.

## Informações Gerais
- **Arquivo**: `src/components/NotificationBell.tsx`
- **Importado em**: `src/components/Header.tsx`
- **Responsabilidade única**: Exibir contador de notificações não lidas e dropdown com lista de matérias publicadas recentemente.

## Funcionamento
1. No mount, carrega as últimas 10 notificações da tabela `notificacoes`.
2. Assina o canal Realtime `notificacoes_realtime` para receber novos INSERTs em tempo real.
3. Compara IDs recebidos com o Set `lidas` (persistido em `localStorage` chave `notifs_lidas`).
4. Exibe contador animado com o número de não lidas.
5. Ao clicar no sino: abre dropdown e marca todas como lidas.
6. Cada notificação no dropdown linka para `/noticia/{noticia_id}`.

## Props
Nenhuma prop — componente autônomo que gerencia seu próprio estado interno.

## Estado Local
| State | Tipo | Descrição |
| :--- | :--- | :--- |
| `notifs` | `Notificacao[]` | Lista das últimas 10 notificações. |
| `open` | `boolean` | Controla visibilidade do dropdown. |
| `lidas` | `Set<string>` | IDs já visualizados, persistidos em localStorage. |

## Dependências
- `supabase` client (`lib/supabase`)
- Tabela: `notificacoes`
- Ícones: `lucide-react` (Bell, X, Newspaper)

---
Status: Documentado — Criado em 2026-04-21
Relacionado: [[0405] Table_Notificacoes](../04XX/0405_Table_Notificacoes.md)
