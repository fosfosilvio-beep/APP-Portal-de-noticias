import { create } from 'zustand';
import { supabase } from '../lib/supabase';

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

export const useSettingsStore = create<SettingsState>((set) => ({
  ui: {
    primaryColor: '#00AEE0',
    fontFamily: 'Inter',
    logoUrl: null,
    siteName: 'NOSSA WEB TV',
  },
  isLoading: true,
  
  fetchSettings: async () => {
    try {
      const { data, error } = await supabase
        .from('configuracao_portal')
        .select('ui_settings, nome_plataforma, logo_url')
        .limit(1)
        .single();
        
      if (data && !error) {
        const remoteUI = data.ui_settings as Partial<UISettings> || {};
        
        set((state) => ({
          ui: {
            ...state.ui,
            ...remoteUI,
            siteName: data.nome_plataforma || state.ui.siteName,
            logoUrl: data.logo_url || state.ui.logoUrl,
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
