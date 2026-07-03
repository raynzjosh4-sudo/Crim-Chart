import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ViewedStatusState {
  viewedStatusIds: Record<string, boolean>;
  markViewed: (statusId: string) => void;
}

export const useViewedStatusStore = create<ViewedStatusState>()(
  persist(
    (set) => ({
      viewedStatusIds: {},
      markViewed: (statusId) => 
        set((state) => {
          if (state.viewedStatusIds[statusId]) return state; // optimize to prevent unnecessary renders
          return {
            viewedStatusIds: { ...state.viewedStatusIds, [statusId]: true }
          };
        }),
    }),
    {
      name: 'crimchart-viewed-status-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
