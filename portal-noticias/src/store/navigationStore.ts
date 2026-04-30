import { create } from 'zustand';

interface NavigationState {
  categoriaAtiva: string;
  setCategoriaAtiva: (cat: string) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  categoriaAtiva: 'Início',
  setCategoriaAtiva: (cat) => set({ categoriaAtiva: cat }),
}));
