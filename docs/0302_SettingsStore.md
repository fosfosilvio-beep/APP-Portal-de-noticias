# SettingsStore (Zustand Global State)

## Propósito
Gerenciar e distribuir o estado global das configurações de Interface e Branding (cores, logos, tipografia, exibição de widgets) do Portal de Notícias. Substitui o prop drilling e permite atualizações em tempo real entre o painel Admin e a visualização do usuário sem necessidade de *refresh*.

## Tecnologias e Paradigmas
*   **Gerenciamento de Estado**: Zustand (`create`).
*   **Hidratação Inicial**: Assíncrona via Supabase fetch na tabela `configuracao_portal`.
*   **Providers**: Inicializado uma única vez via `Providers.tsx` no Root Layout, dispensando um `<Provider>` em cascata para leitura de propriedades.

## Contratos de Dados (Interfaces)
```typescript
interface UISettings {
  primaryColor: string;
  fontFamily: 'Inter' | 'Anton' | 'Montserrat';
  logoUrl: string | null;
  siteName: string;
}

interface SettingsState {
  ui: UISettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateUI: (newUI: Partial<UISettings>) => void;
}
```

## Arquivos Relacionados
*   **Origem**: `src/store/settingsStore.ts`
*   **Carregamento**: `src/components/Providers.tsx`
*   **Consumo Frontend**: `src/components/Header.tsx`, `src/components/AudioPlayer.tsx`
*   **Ponto de Atualização (Admin)**: `src/app/admin/page.tsx`
