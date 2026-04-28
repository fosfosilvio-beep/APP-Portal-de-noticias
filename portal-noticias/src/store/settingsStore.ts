import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface UISettings {
  primaryColor: string;
  fontFamily: 'Inter' | 'Anton' | 'Montserrat';
  logoUrl: string | null;
  logoTextoUrl: string | null;
  siteName: string;
  // Institucional
  enderecoRodape?: string;
  emailContato?: string;
  telefoneContato?: string;
  copyrightTexto?: string;
}

interface SettingsState {
  ui: UISettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateUI: (newUI: Partial<UISettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  ui: {
    primaryColor: '#00AEE0',
    fontFamily: 'Inter',
    logoUrl: null,
    logoTextoUrl: null,
    siteName: 'NOSSA WEB TV',
  },
  isLoading: true,
  
  fetchSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('configuracao_portal')
        .select(`
          ui_settings, 
          nome_plataforma, 
          logo_url, 
          endereco_rodape, 
          email_contato, 
          telefone_contato, 
          copyright_texto
        `)
        .limit(1)
        .maybeSingle();
        
        if (data && !error) {
          const rawUI = data.ui_settings as any || {};
          
          set((state) => ({
            ui: {
              ...state.ui,
              primaryColor: rawUI.primary_color || rawUI.primaryColor || state.ui.primaryColor,
              fontFamily: rawUI.font_family || rawUI.fontFamily || state.ui.fontFamily,
              logoUrl: data.logo_url || rawUI.logo_url || rawUI.logoUrl || state.ui.logoUrl,
              logoTextoUrl: rawUI.logo_texto_url || rawUI.logoTextoUrl || null,
              siteName: data.nome_plataforma || rawUI.brand_name || rawUI.siteName || state.ui.siteName,
              enderecoRodape: data.endereco_rodape,
              emailContato: data.email_contato,
              telefoneContato: data.telefone_contato,
              copyrightTexto: data.copyright_texto,
            },
            isLoading: false
          }));
        }
    } catch (e) {
      console.error('Zustand Error fetching settings', e);
      set({ isLoading: false });
    }
  },

  updateUI: (newUI) => set((state) => ({ ui: { ...state.ui, ...newUI } }))
}));
