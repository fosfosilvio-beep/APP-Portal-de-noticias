# [0408] Integração Bunny Stream (Streaming de Vídeo)

Este documento detalha o funcionamento da integração com o Bunny.net para processamento e entrega de vídeos otimizados para streaming.

## Propósito
Substituir o upload direto para o Supabase Storage (que consome muita largura de banda e não oferece adaptive streaming) pelo Bunny Stream, garantindo carregamento rápido em dispositivos móveis e desktop.

## Fluxo de Upload (Backend)
O upload é realizado via rota de API servidora para proteger as credenciais.

- **Endpoint:** `/api/video/upload`
- **Método:** `POST`
- **Contrato Bunny Stream:**
  1. `POST /library/{id}/videos`: Cria a entrada do vídeo e obtém o `videoId`.
  2. `PUT /library/{id}/videos/{videoId}`: Envia o binário do arquivo via stream octet-stream.

## Renderização (SmartPlayer)
O `SmartPlayer.tsx` detecta automaticamente a plataforma e renderiza o iframe correspondente.

- **Padrão de URL:** `https://iframe.mediadelivery.net/embed/[LIBRARY_ID]/[VIDEO_ID]`
- **Detecção:** O componente verifica a presença de `iframe.mediadelivery.net` ou o prefixo `bunny://` (para compatibilidade futura).

## Variáveis de Ambiente
- `BUNNY_API_KEY`: Chave de acesso global (Account API Key).
- `NEXT_PUBLIC_BUNNY_LIBRARY_ID`: ID da biblioteca de vídeos específica.

## Benefícios Técnicos
1. **Transcoding Automático:** O Bunny gera múltiplas resoluções (240p a 1080p).
2. **Player Nativo Premium:** Interface com controles avançados e suporte a DRM/Segurança se necessário.
3. **Redução de Custo:** Armazenamento e banda significativamente mais baratos que buckets tradicionais para vídeo.

---
Status: Ativo
Implementação: 2026-04-26
Arquiteto: Antigravity
