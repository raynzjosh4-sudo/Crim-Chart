import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { THEMES, AppTheme } from '../theme/themes';

interface ThemeState {
  scale: number;
  themeId: string;
  setScale: (scale: number) => void;
  setThemeId: (themeId: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      scale: 1.0, // Default scale
      themeId: 'crimchart-dark', // Default theme
      setScale: (scale: number) => set({ scale }),
      setThemeId: (themeId: string) => set({ themeId }),
    }),
    {
      name: 'crimchart-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useCurrentTheme = (): AppTheme => {
  const themeId = useThemeStore((state) => state.themeId);
  return THEMES[themeId] || THEMES['crimchart-dark'];
};
