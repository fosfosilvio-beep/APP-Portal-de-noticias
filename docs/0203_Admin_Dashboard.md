# [0203] Tela: Painel Administrativo

Centro de controle para jornalistas e administradores do portal.

## Informações Gerais
- **Rota**: `/admin`
- **Arquivo**: `src/app/admin/page.tsx`
- **Responsabilidade**: CRUD de notícias, controle de live e anúncios.

## Segurança (Estado Atual)
- Autenticação via senha simples (`admin`) validada no frontend.
- Não há persistência de sessão via JWT (apenas estado local react).

## Funcionalidades Principais

### 1. Dashboard
- Métricas rápidas: Status da Live, Total de Notícias, Boost de Audiência.

### 2. Gerenciador de Live
- Botão Toggle ON/OFF para `is_live`.
- Input de URL para `url_live_facebook`.
- Slider "Boost" para manipular o contador de visualizações fictício.

### 3. Redação IA (Gerador Mágico)
- Integração com `/api/generate-news`.
- Transforma prompts simples em matérias completas (Título, Conteúdo, Categoria, Slug).

### 4. Postagem de Notícias
- Formulário completo para inserção na tabela `noticias`.
- **Editor Rich Text (TipTap)**: Suporte expandido (8 famílias), tamanhos, cores, alinhamentos e **Gerador Mágico IA Integrado**.
- **Gerador Mágico (IA)**: Acessível via ícone de Faíscas (`Sparkles`) na barra de ferramentas do editor. Permite reescrever o rascunho colado com base em diretrizes customizadas (Tom, Estilo, etc).
- **Estilização de Títulos**: Controles para escolher Fonte, Peso e Cor para Título e Subtítulo.
- Suporte a upload de vídeo para o Storage do Supabase.

### 5. Configurações do Portal
- Upload de banners publicitários (Home e Vertical).
- Definição de links de destino.

---
Status: Documentado
Relacionado: [[0402] Table_Config_Portal](../04XX/0402_Table_Config_Portal.md)
