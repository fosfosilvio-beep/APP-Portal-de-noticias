# [0315] Widget de Enquetes (Polls)

## Descrição
Widget interativo que permite aos leitores votar em enquetes na página inicial do portal.

## Componentes UI
- `EnquetesWidget` (`/components/home/EnquetesWidget.tsx`): Exibe a pergunta ativa e lida com o estado de votação (localStorage).
- `AdminEnquetes` (`/admin/enquetes/page.tsx`): Cria e ativa/desativa enquetes.

## Contrato de Dados
- Tabela `enquetes`
  - `id` (uuid)
  - `pergunta` (text)
  - `opcoes` (jsonb) -> ex: `[{id, texto, votos}]`
  - `status` (text)
- Tabela `votos_enquete` (Armazena votos por IP/userId para segurança futura, mas `EnquetesWidget` atualiza `jsonb` diretamente + usa LocalStorage para debounce do client).
