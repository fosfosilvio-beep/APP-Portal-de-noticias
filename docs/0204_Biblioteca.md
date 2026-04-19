# [0204] Tela: Biblioteca Web TV

Acervo digital de programas, lives passadas e matérias especiais em formato de vídeo.

## Informações Gerais
- **Rota**: `/biblioteca` (ou aba na home)
- **Arquivo**: `src/app/biblioteca/page.tsx`
- **Responsabilidade**: Catálogo On-Demand.

## Lógica de UI
- Estilo "Netflix" com grid de cartões e thumbnails.
- Barra de pesquisa que filtra por título ou tema em tempo real.

## Fontes de Dados
Combina duas fontes em um único array:
1. **Tabela `biblioteca_lives`**: Vídeos exclusivos de transmissões ao vivo.
2. **Tabela `noticias`**: Filtra apenas notícias que possuem `video_url` preenchido.

---
Status: Documentado
Relacionado: [[0403] Table_Biblioteca_Lives](../04XX/0403_Table_Biblioteca_Lives.md)
