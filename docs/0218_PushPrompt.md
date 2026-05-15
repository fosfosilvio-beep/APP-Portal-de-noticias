# [0218] PushPrompt (Notificações)

Responsável por solicitar a permissão e registrar o Service Worker para Notificações Push (Web Push).

## Informações Gerais
- **Componente**: `PushPrompt`
- **Arquivo**: `src/components/PushPrompt.tsx`
- **Responsabilidade**: Exibir um card interativo pedindo ao usuário permissão para enviar notificações (Alertas em Tempo Real).

## Comportamento e Lógica
- **Exibição Condicional**: O prompt só aparece se a permissão atual for `"default"` e se o usuário não o tiver ignorado na sessão atual (`sessionStorage.getItem("push_prompt_ignored")`). Ele possui um delay de 10 segundos antes de aparecer na tela.
- **Requisição de Permissão**: Ao clicar em "Ativar Alertas", ele invoca `Notification.requestPermission()`.
- **Registro do SW**: Em caso de sucesso (`"granted"`), ele registra o service worker (`/sw.js`) e obtém uma subscrição usando a `VAPID_PUBLIC_KEY`.
- **Persistência**: A subscrição é salva no Supabase na tabela `push_subscriptions`.
- **Tratamento de Erros/Dismiss**: 
  - Independentemente do resultado (seja erro, bloqueio pelo navegador, ou sucesso), o componente vai se ocultar e definir o estado de ignorado no `sessionStorage` para não incomodar mais o usuário durante a sessão atual.
  - Ao clicar no botão "Agora não" ou no "X", o prompt é fechado e a preferência também é salva temporariamente.

## Estilo Visual
- Posicionado no canto inferior direito (`bottom-6 right-6`), em forma de "card flutuante" com bordas arredondadas e sombras.
- Uso de bibliotecas externas de ícones (`lucide-react`) e de animação (`framer-motion`) para uma transição suave.

---
Status: Documentado
Relacionado: [[0405] Table_Notificacoes](../04XX/0405_Table_Notificacoes.md)
