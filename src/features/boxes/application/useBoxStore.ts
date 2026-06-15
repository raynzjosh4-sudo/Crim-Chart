import { create } from 'zustand';
import { BoxModel } from '../components/BoxCard';

interface BoxState {
  boxesByUserId: Record<string, BoxModel[]>;
  isLoadingByUserId: Record<string, boolean>;
  
  setBoxes: (userId: string, boxes: BoxModel[]) => void;
  addBox: (userId: string, box: BoxModel) => void;
  removeBox: (userId: string, boxId: string) => void;
  setLoading: (userId: string, isLoading: boolean) => void;
}

export const useBoxStore = create<BoxState>((set) => ({
  boxesByUserId: {},
  isLoadingByUserId: {},

  setBoxes: (userId, boxes) => set((state) => ({
    boxesByUserId: { ...state.boxesByUserId, [userId]: boxes }
  })),

  addBox: (userId, box) => set((state) => {
    const existingBoxes = state.boxesByUserId[userId] || [];
    return {
      boxesByUserId: { ...state.boxesByUserId, [userId]: [box, ...existingBoxes] }
    };
  }),

  removeBox: (userId, boxId) => set((state) => {
    const existingBoxes = state.boxesByUserId[userId] || [];
    return {
      boxesByUserId: { ...state.boxesByUserId, [userId]: existingBoxes.filter(b => b.id !== boxId) }
    };
  }),

  setLoading: (userId, isLoading) => set((state) => ({
    isLoadingByUserId: { ...state.isLoadingByUserId, [userId]: isLoading }
  })),
}));
