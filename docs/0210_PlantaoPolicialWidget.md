# Plantão Policial Widget

## Propósito
Exibir ocorrências policiais e de segurança pública em formato de lista ágil com apelo visual de urgência. Projetado com estética de "Breaking News", apresentando gradiente animado, sirene pulsante e listagem simplificada de incidentes diários.

## Responsabilidade Única (Arquitetura)
O componente deve isolar toda a parte visual e de renderização de listas referentes ao plantão. No momento atual (V1) utiliza instâncias assíncronas *mockadas*. Futuramente, a lógica de obtenção real-time será repassada do Hook global.

## Ficha Visual
*   **Aparência**: Box limpo (`bg-white`), bordas avermelhadas.
*   **Animação**: Sirene pulsante usando classes de *pulse* e *ping* nativas do Tailwind.
*   **Tipografia**: Destacada em fontes monoespaçadas para timestamps.

## Arquivos Relacionados
*   **Localização**: `src/components/PlantaoPolicialWidget.tsx`
*   **Integração**: Incorporado à `aside` nativamente no layout principal da malha (`src/app/page.tsx`).
