# [0202] Painel Administrativo (Enterprise Management V2)

O Painel Admin agora atua como o Orquestrador Central da Identidade Visual e Visibilidade do portal.

## Informações Gerais
- **Rota**: `/admin`
- **Arquivo**: `src/app/admin/page.tsx`
- **Responsabilidade**: Gestão integral de Conteúdo (CRUD), Publicidade (Slots), HeroBanner e Branding.

## Novas Funcionalidades (V2)

### 1. Gestão de HeroBanner & Slides
- **Uploader Nativo**: Substituição de campos de texto por inputs de arquivo que sobem mídia diretamente para o bucket `media` no Supabase Storage.
- **Configurações por Slide**:
  - `Link`: Destino do clique.
  - `Legend`: Texto complementar exibido no banner.
  - `Scale`: Escolha entre `cover` (preencher) ou `contain` (mostrar tudo).
- **Global Settings**:
  - `hero_duration`: Tempo de permanência do slide.
  - `hero_transition`: Velocidade da animação de troca.

### 2. Branding & Design System
- **Logo Mode**: Chaveamento entre Logo em Imagem (Upload) ou Texto Dinâmico.
- **Tipografia**: Ajuste de `font-size` e `font-weight` para o logo em texto.
- **Variable Injection**: Inclusão de `primary_color` via input color-picker, que injeta o valor na variável CSS `--primary-color` do front-end.

### 3. Publicidade (Ads)
- **Slots Dinâmicos**: Dois slots (`ad_slot_1` e `ad_slot_2`) com toggles de visibilidade, uploader de arte e link de destino.

### 4. Visibilidade de Widgets
- Toggles lógicos para controle de renderização do Clima, Giro 24h, Plantão Policial e HeroBanner na Home.

## Fluxo de Dados
1. O usuário aciona um upload.
2. O arquivo é enviado para `media/` via `supabase.storage`.
3. A URL pública é retornada e preenchida no estado do formulário.
4. Ao "Publicar", o JSON de configurações é salvo na tabela `configuracao_portal`.

---
Status: Atualizado (Enterprise V2)
Relacionado: [[0201] Home](0201_Home.md)
