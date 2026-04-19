# [0205] Componente: VideoCarousel

Carrossel horizontal interativo para navegação no acervo de vídeos do portal.

## Informações Gerais
- **Arquivo**: `src/components/VideoCarousel.tsx`
- **Responsabilidade**: Exibir miniaturas dos últimos 10 vídeos da `biblioteca_webtv` e permitir a seleção para o Hero Player.

## Contrato de Dados (Fetch)
- **Tabela**: `biblioteca_webtv`
- **Campos**: `id`, `titulo`, `url_video`, `thumbnail`, `created_at`.
- **Limite**: 10 itens ordenados por `created_at DESC`.

## Interatividade (Eventos)
- `onVideoSelect(url: string)`: Callback disparado ao clicar em uma miniatura para atualizar o Player principal.

## Comportamento Visual
- **Scroll Snap**: Deslize horizontal suave em dispositivos móveis.
- **Micro-animação**: Efeito de `scale-105` e overlay de brilho ao passar o mouse.
- **Indicador Ativo**: Destaque visual (borda ciano) no vídeo que está sendo reproduzido.

---
Status: Em Desenvolvimento
Relacionado: [[0201] Home](../02XX/0201_Home.md)
