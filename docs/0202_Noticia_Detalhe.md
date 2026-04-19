# [0202] Tela: Notícia Detalhe

Exibe o conteúdo completo de uma matéria jornalística com suporte a vídeo em destaque.

## Informações Gerais
- **Rota**: `/noticia/[slug]`
- **Arquivo**: `src/app/noticia/[slug]/page.tsx`
- **Responsabilidade**: Leitura profunda e engajamento.

## Componentes Utilizados
- `SmartPlayer`: Renderiza o `video_url` da notícia no topo do artigo.
- `Header`: Navegação fixa (modo simplificado sem categorias).
- `Share Buttons`: Botões sociais para Facebook e WhatsApp.

## Lógica de Carregamento
1. Extrai o `slug` da URL.
2. Tenta buscar na tabela `noticias` pelo `slug`.
3. Fallback: Se o slug for um UUID válido, tenta buscar pelo `id`.
4. Carrega metadados da `configuracao_portal` para o cabeçalho.
5. Carrega "Giro de Notícias" (5 notícias recentes) para a barra lateral.

## Design
- Tipografia serifada/prose para o corpo do texto (melhora a legibilidade).
- Imagem de capa em destaque abaixo do título.
- Barra lateral com informações meteorológicas e banner vertical de publicidade.

---
Status: Documentado
Relacionado: [[0401] Table_Noticias](../04XX/0401_Table_Noticias.md)
