import { create } from 'zustand';

interface ExploreState {
  isOpen: boolean;
  openExplore: () => void;
  closeExplore: () => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  isOpen: false,
  openExplore: () => set({ isOpen: true }),
  closeExplore: () => set({ isOpen: false }),
}));
