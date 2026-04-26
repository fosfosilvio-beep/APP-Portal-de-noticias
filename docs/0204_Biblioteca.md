# [0204] Tela: Biblioteca Web TV (Podcasts)

Acervo digital focado em Podcasts (Programas) e Episódios (On-Demand), substituindo o antigo sistema de upload genérico de matérias.

## Informações Gerais
- **Rota Pública**: `/biblioteca`
- **Rota Admin**: `/admin/biblioteca`
- **Responsabilidade**: Catálogo de Podcasts e Entrevistas.

## Lógica de UI (Pública)
- Layout estilo "Netflix/Cinema" (Fundo Escuro).
- Menu superior interativo com a lista de Programas (Ex: Espaço Retrô, Ponto de Vista) trazendo a foto do apresentador.
- **Player Dinâmico**: Ao selecionar um episódio, o player carrega o vídeo (YouTube ou Upload Local) respeitando os timecodes (`start_time` e `end_time`) para pular introduções ou focar na entrevista.
- Área de Engajamento: Comentários e reações em tempo real por episódio.

## Lógica de UI (Painel Admin)
O painel foi remodelado em sistema de "Abas":
1. **Gerenciar Programas**: CRUD da tabela `podcasts` (Nome, Apresentador, Foto, Horário).
2. **Cadastrar Episódio**: CRUD da tabela `episodios`. Permite colar Link do YouTube (com campos para Recorte de Tempo) ou Upload de arquivo físico. Permite também fazer upload da "Capa" (Thumbnail do convidado) que sobrescreve a capa padrão do YouTube.

## Fontes de Dados (Tabelas)
A ferramenta consome exclusivamente as novas tabelas dedicadas:
1. **`podcasts`**: Armazena as franquias (programas).
2. **`episodios`**: Armazena os episódios amarrados a um `podcast_id`.

*(A tabela antiga `biblioteca_webtv` foi depreciada como fonte primária nesta rota, mas os arquivos físicos continuam sendo salvos no bucket `videos_biblioteca`).*

---
Status: Documentado e Atualizado
Relacionado: `src/app/admin/biblioteca/page.tsx`, `src/app/biblioteca/page.tsx`
