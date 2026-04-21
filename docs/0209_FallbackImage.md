# FallbackImage Component

## Propósito
Um componente *wrapper* em cima do `next/image` do Next.js. O objetivo é evitar falhas críticas ("broken link") na Home quando imagens armazenadas no Supabase Storage não carregam (seja por CORS, link expirado ou falta de permissão).

## Como Funciona
O componente tenta carregar a imagem original (prop `src`). Se o `next/image` disparar um evento `onError`, o FallbackImage automaticamente substitui a URL renderizada por uma imagem estática alocada localmente no projeto.

## Arquivos Relacionados
*   **Componente**: `src/components/FallbackImage.tsx`
*   **Ativo Estático (Fallback)**: `public/images/fallback.jpg`
*   **Consumidor Principal**: `src/app/page.tsx` (Grid da Malha Visual)
