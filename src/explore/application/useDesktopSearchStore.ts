import { create } from 'zustand';
import { GlobalSearchResult } from '../models/GlobalSearchResult';

interface DesktopSearchState {
  activeResult: GlobalSearchResult | null;
  openResult: (item: GlobalSearchResult) => void;
  closeResult: () => void;
}

export const useDesktopSearchStore = create<DesktopSearchState>((set) => ({
  activeResult: null,
  openResult: (item) => set({ activeResult: item }),
  closeResult: () => set({ activeResult: null }),
}));
