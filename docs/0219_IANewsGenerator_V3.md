# [0219] Componente: IA News Generator V3

O IA News Generator V3 é o motor de redação automatizada da Nossa Web TV, focado em alta performance e multimodalidade.

## Informações Técnicas
- **Arquivo**: `src/components/admin/noticias/IANewsGenerator.tsx`
- **API**: `/api/generate-news`
- **Engine**: Gemini 2.5 Flash (v1beta) para processamento multimodal e texto.

## Interface de Abas (UX Recovery)
O componente foi refatorado para oferecer três fluxos de entrada distintos, organizados em abas:

### 1. Aba: Link Externo
- **Propósito**: Scraping e reescrita de notícias existentes, burlando bloqueios de paywall ou JS pesado.
- **Fontes Suportadas**: UOL, G1, Instagram, YouTube e URLs de notícias em geral.
- **Estratégia de Scraping (Chave Mestra)**:
  1. **Primária (Jina Reader)**: A URL é enviada para `https://r.jina.ai/[URL]` para retornar um Markdown limpo (passa por paywalls e resolve o JS).
  2. **Secundária (Googlebot)**: Caso o Jina falhe, é feito um fallback usando o header `User-Agent: Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)`.
  3. **Último Recurso (Metadados OG)**: Se o conteúdo retornar "Access Denied" ou bloqueado, a IA é instruída a redigir a notícia com base exclusivamente nos metadados (Título e Descrição do OpenGraph).
- **Funcionamento**: A IA extrai o contexto da URL e reescreve a matéria seguindo o tom da Nossa Web TV.

### 2. Aba: Tema Livre
- **Propósito**: Criação de conteúdo original a partir de um resumo ou ideia.
- **Funcionamento**: O jornalista insere um prompt curto e a IA desenvolve a matéria completa.

### 3. Aba: Vídeo Local
- **Propósito**: Geração de matéria a partir de um vídeo bruto.
- **Engine**: Gemini 1.5 Flash (Multimodal).
- **Vantagem**: Analisa as cenas do vídeo para descrever os fatos, eliminando a dependência de scripts manuais.

## Diretrizes Editoriais (System Prompt)
A IA atua como um **Jornalista Sênior**, seguindo rigorosamente:
- **Pirâmide Invertida**: Informações mais importantes no primeiro parágrafo.
- **Estrutura HTML**: Entrega o conteúdo formatado com `h2`, `p` e `strong`.
- **Tom de Voz**: Profissional, informativo e impactante.
- **Insights Sociais**: Gera automaticamente sugestões de legenda para Instagram e tags SEO.

## Mudanças Recentes (Recovery Plan)
- **Engine Upgrade**: Migração de Twelve Labs/Gemini Pro para Gemini 2.5 Flash (v1beta) para maior agilidade no vídeo.
- **UI Refactor**: Substituição de lista vertical por sistema de Tabs intuitivo.
- **Prompt Refinement**: Reintrodução das diretrizes de jornalismo sênior.
