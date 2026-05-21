# [0214] PWA Install Banner

Responsável por exibir o banner de instalação do aplicativo (PWA) no topo do site (logo abaixo do Header).

## Informações Gerais
- **Componente**: `PWAInstallBanner`
- **Arquivo**: `src/components/PWAInstallBanner.tsx`
- **Responsabilidade**: Interagir com as APIs do navegador (`beforeinstallprompt`) para oferecer ao usuário a opção de instalar o portal como um app nativo (PWA).

## Comportamento Visual e Layout (Mobile Optimization)
- O componente foi otimizado para um **layout contínuo e compacto** no ambiente mobile.
- **Sem Espaços Vazios**: Margens (`m-0`), paddings verticais/horizontais (`p-0`) e bordas arredondadas foram totalmente removidos do contêiner root e do botão.
- **Proporção da Imagem**: A imagem de capa (`/images/pwa-banner.png`) utiliza `w-full`, `h-auto` e display `block`, preenchendo toda a extensão horizontal da tela e eliminando espaços fantasmas (line-height residual).
- **Sincronização com Vizinhos**: Renderizado imediatamente após o `Header` e imediatamente antes do `CategoryNav` no `HomeContent`. Devido à ausência de margens e padding, ele se conecta de forma fluida a ambos os elementos `bg-black` vizinhos.

## Lógica Interna
- Oculta-se automaticamente caso o portal já esteja aberto no modo *Standalone* (PWA já instalado).
- Implementa um botão de fechar (`X`) flutuante. Ao ser clicado, a preferência do usuário de ocultar o banner é salva no `localStorage` sob a chave `pwa_banner_dismissed`, impedindo que o banner reapareça em visitas futuras no mesmo navegador.
- Ao clicar na imagem para realizar o download do APK, o banner também é fechado automaticamente e a preferência é salva no `localStorage`.
- Aguarda e intercepta o evento `beforeinstallprompt` do navegador.
- Dispara o fluxo nativo de instalação ao ser clicado (`deferredPrompt.prompt()`).

## Ícone PWA (Manifest)
- O manifesto PWA (`public/manifest.json`) está configurado para utilizar as imagens oficiais do app:
  - `icon-192x192.png`
  - `icon-512x512.png`
  - Garante a presença do ícone correto ("Logo web") no prompt nativo de instalação.

---
Status: DEPRECATED – componente removido; instalação bloqueada via script no layout.
