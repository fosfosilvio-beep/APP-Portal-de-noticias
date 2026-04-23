# [0212] Você no Portal & Engajamento

## Descrição
Módulo de jornalismo cidadão e caixa de sugestões/denúncias. Permite que leitores enviem relatos com anexos (imagens e vídeos).

## Componentes UI
- `VoceNoPortalPage` (`/voce-no-portal/page.tsx`): Formulário público com upload de arquivos.
- `VoceNoPortalAdmin` (`/admin/voce-no-portal/page.tsx`): Painel administrativo para moderação das sugestões com botão "Transformar em Pauta".

## Fluxo de Dados (Hooks & Supabase)
- Insere na tabela `vocenoportal_sugestoes`.
- Faz upload no bucket `colaboracao`.
- Quando aprovado, cria um rascunho na tabela `noticias`.
