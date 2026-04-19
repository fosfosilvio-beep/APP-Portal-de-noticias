# [0301] Lógica: Supabase Client & Fetching

Padrões de comunicação com o backend e gerenciamento de estado de rede.

## Cliente Supabase (`src/lib/supabase.ts`)
Instância global do cliente utilizando `supabase-js`. 
- Utiliza chaves anônimas (`NEXT_PUBLIC_...`) permitindo acesso seguro via browser.

## Padrão de Fetching
A maioria das telas utiliza `useEffect` para carregar dados no montagem do componente.

### Exemplo de Query Padrão (Notícias):
```typescript
const { data, error } = await supabase
  .from('noticias')
  .select('*')
  .order('created_at', { ascending: false });
```

## Realtime (Canais)
O sistema utiliza canais de Realtime para monitorar mudanças na tabela `configuracao_portal`. Isso permite que a UI reaja instantaneamente ao início de uma live sem necessidade de polling ou refresh.

### Canal Home:
- **Nome**: `home_config_changes`
- **Evento**: `UPDATE`
- **Tabela**: `configuracao_portal`

---
Status: Documentado
Relacionado: [[0101] Config_Geral](../01XX/0101_Config_Geral.md)
