import { create } from 'zustand';
import { BoxCategory } from '../components/CreateBoxSheet';

interface DesktopBoxState {
  activeBoxId: string | null;
  activeBoxType: BoxCategory | string | null;
  openBox: (boxId: string, boxType: BoxCategory | string) => void;
  closeBox: () => void;
}

export const useDesktopBoxStore = create<DesktopBoxState>((set) => ({
  activeBoxId: null,
  activeBoxType: null,
  
  openBox: (boxId, boxType) => {
    set({ activeBoxId: boxId, activeBoxType: boxType });
  },
  
  closeBox: () => {
    set({ activeBoxId: null, activeBoxType: null });
  }
}));
