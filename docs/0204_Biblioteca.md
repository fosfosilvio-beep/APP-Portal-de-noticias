# [0204] Tela: Biblioteca Web TV (Podcasts)

Acervo digital focado em Podcasts (Programas) e Episódios (On-Demand), substituindo o antigo sistema de upload genérico de matérias.

## Informações Gerais
- **Rota Pública**: `/biblioteca`
- **Rota Admin**: `/admin/biblioteca`
- **Responsabilidade**: Catálogo de Podcasts e Entrevistas.

## Lógica de UI (Pública)
- Layout estilo "Netflix/Cinema" (Fundo Escuro).
- Menu superior interativo com a lista de Programas (Ex: Espaço Retrô, Ponto de Vista) trazendo a foto do apresentador.
- **Player Dinâmico**: O layout agora prioriza as informações do programa (Apresentador e Convidados) no topo, com o Player de vídeo logo abaixo para uma navegação mais intuitiva.
- **Grid de Episódios**: Organização otimizada em um Grid de 2 colunas (2x2) para facilitar a visualização de múltiplos episódios em dispositivos móveis e desktop.
- **Navegação**: Botão "Início" corrigido para redirecionar corretamente para a Home Principal (`/`) resetando o estado de categorias.
- Área de Engajamento: Comentários e reações em tempo real por episódio.

## Lógica de UI (Painel Admin)
O painel foi remodelado em sistema de "Abas":
1. **Gerenciar Programas**: CRUD completo da tabela `podcasts` (Nome, Apresentador, Foto, Horário). Agora inclui botão de **Editar** para alterar dados e foto do apresentador.
2. **Cadastrar/Editar Episódio**: CRUD completo da tabela `episodios`. Permite colar Link do YouTube ou Upload de arquivo físico. Agora permite **Editar** episódios existentes para corrigir títulos, trocar convidados ou atualizar thumbnails.

## Fontes de Dados (Tabelas)
A ferramenta consome exclusivamente as novas tabelas dedicadas:
1. **`podcasts`**: Armazena as franquias (programas).
2. **`episodios`**: Armazena os episódios amarrados a um `podcast_id`.

*(A tabela antiga `biblioteca_webtv` foi depreciada como fonte primária nesta rota, mas os arquivos físicos continuam sendo salvos no bucket `videos_biblioteca`).*

---
Status: Documentado e Atualizado
Relacionado: `src/app/admin/biblioteca/page.tsx`, `src/app/biblioteca/page.tsx`
