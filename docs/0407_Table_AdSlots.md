# 0407 - Tabela: ad_slots (Motor Publicitário)

## 1. Propósito
Oferecer liberdade de precificação, gestão de banners laterais e posições premium para os anunciantes na UI global. A `ad_slots` hospeda as configurações que os Admins modulam no Dashboard e que são lidos on-demand na Client-side.

## 2. Estrutura (Schema)

*   `id` (UUID): O identificador gerado randômicamente (`gen_random_uuid()`).
*   `nome_slot` (TEXT): Nome de referência no Dashboard (Ex: "Header Banner").
*   `posicao_html` (TEXT): O placeholder reservado em React (Ex: `sidebar_right`).
*   `dimensoes` (TEXT): Medidas recomendadas.
*   `codigo_html_ou_imagem` (TEXT): Link local ou URL persistente da publicidade inserida.
*   `status_ativo` (BOOLEAN): Define visibilidade condicional.

## 3. Integração na Page
Essa arquitetura está acoplada nos layouts da home e noticiário, substituindo placeholders padrão quando `status_ativo=true`.
