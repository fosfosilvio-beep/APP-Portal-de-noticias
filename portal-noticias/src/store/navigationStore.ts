import { create } from 'zustand';

interface NavigationState {
  categoriaAtiva: string;
  setCategoriaAtiva: (cat: string) => void;
  showNavigation: boolean;
  setShowNavigation: (show: boolean) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  categoriaAtiva: 'Início',
  setCategoriaAtiva: (cat) => set({ categoriaAtiva: cat }),
  showNavigation: true,
  setShowNavigation: (show) => set({ showNavigation: show }),
}));
