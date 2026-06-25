export interface ThemeTokens {
  primary: string;
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
  'crimchart-dark': {
    id: 'crimchart-dark',
    name: 'CrimChart Dark',
    isDark: true,
    colors: {
      primary: '#FACD11',
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
  },
  dracula: {
    id: 'dracula',
    name: 'Dracula',
    isDark: true,
    colors: {
      primary: '#ff79c6',
      background: '#282a36',
      surface: '#44475a',
      surfaceVariant: '#6272a4',
      surfaceDark: '#191A21',
      text: '#f8f8f2',
      textSecondary: '#8be9fd',
      error: '#ff5555',
      accent: '#bd93f9',
      muted: '#6272a4',
    }
  },
  nord: {
    id: 'nord',
    name: 'Nordic Frost',
    isDark: true,
    colors: {
      primary: '#88c0d0',
      background: '#2e3440',
      surface: '#3b4252',
      surfaceVariant: '#434c5e',
      surfaceDark: '#242933',
      text: '#e5e9f0',
      textSecondary: '#d8dee9',
      error: '#bf616a',
      accent: '#81a1c1',
      muted: '#4c566a',
    }
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    isDark: true,
    colors: {
      primary: '#f3e600',
      background: '#001219',
      surface: '#0a9396',
      surfaceVariant: '#94d2bd',
      surfaceDark: '#00080B',
      text: '#ee9b00',
      textSecondary: '#e9d8a6',
      error: '#ae2012',
      accent: '#ca6702',
      muted: '#9b2226',
    }
  }
};
