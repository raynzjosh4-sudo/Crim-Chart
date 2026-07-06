export interface ThemeTokens {
  primary: string;
  onPrimary: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceDark: string;
  text: string;
  textSecondary: string;
  error: string;
  accent: string;
  muted: string;
}

export interface AppTheme {
  id: string;
  name: string;
  isDark: boolean;
  colors: ThemeTokens;
}

export const THEMES: Record<string, AppTheme> = {
  'crimchart-light': {
    id: 'crimchart-light',
    name: 'Light (White)',
    isDark: false,
    colors: {
      primary: '#000000',
      onPrimary: '#FFFFFF',
      background: '#FFFFFF',
      surface: '#F2F2F7',
      surfaceVariant: '#E5E5EA',
      surfaceDark: '#FFFFFF',
      text: '#000000',
      textSecondary: 'rgba(0, 0, 0, 0.6)',
      error: '#FF3B30',
      accent: '#FACD11',
      muted: 'rgba(0, 0, 0, 0.3)',
    }
  },
  'crimchart-dark': {
    id: 'crimchart-dark',
    name: 'Dark (Black)',
    isDark: true,
    colors: {
      primary: '#FACD11',
      onPrimary: '#000000',
      background: '#000000',
      surface: '#1C1C1E',
      surfaceVariant: '#2C2C2E',
      surfaceDark: '#0A0A0C',
      text: '#FFFFFF',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
      error: '#FF5252',
      accent: '#FACD11',
      muted: 'rgba(255, 255, 255, 0.4)',
    }
  }
};
