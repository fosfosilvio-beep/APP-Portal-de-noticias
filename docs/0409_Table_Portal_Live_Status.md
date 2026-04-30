# [0409] Tabela: portal_live_status

Gerencia o estado de transmissão em tempo real (Realtime) de forma isolada das configurações gerais do portal. Esta tabela é a fonte primária para o componente `SmartPlayer` e `HeroSection`.

## Contrato de Dados (Esquema)

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | INTEGER (PK) | Registro único (ID 1). |
| `is_live` | BOOLEAN | Chave mestre de ativação do modo transmissão. |
| `url_youtube` | TEXT (URL) | Link direto da live no YouTube (opcional). |
| `url_facebook` | TEXT (URL) | Link direto da live no Facebook (opcional). |
| `titulo` | TEXT | Título que aparece no overlay do player. |
| `descricao` | TEXT | Texto descritivo que aparece sob o título no player. |
| `live_id` | TEXT | Identificador único da sessão de live (usado para isolar o Chat). |
| `fake_viewers_boost` | INTEGER | Quantidade base de espectadores para o contador fictício. |
| `updated_at` | TIMESTAMPTZ | Registro de última modificação para sincronização. |

## Regras de Negócio e Governança

1. **Limpeza de Dados**: Ao desativar a live (`is_live = false`), os campos `url_youtube`, `url_facebook` e `live_id` DEVEM ser definidos como `NULL` para evitar que o player tente renderizar conteúdo antigo em cache.
2. **Sincronização Realtime**: Esta tabela possui o Realtime ativado no Supabase. O Hook `useLiveStatus` assina as mudanças nesta tabela para atualizar a Home instantaneamente.
3. **Isolamento de Chat**: O `live_id` é essencial para o `LiveChat`. Sem ele, as mensagens podem se misturar entre diferentes transmissões.

---
Status: Documentado
Relacionado: [[0201] Home](../02XX/0201_Home.md), [[0203] Admin](../02XX/0203_Admin_Dashboard.md)
