export type StatusBarStyle = 'dark' | 'light';

export interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryGlow: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  divider: string;
  indicator: string;
  statusBar: StatusBarStyle;
}

export interface ColorsType {
  light: ColorPalette;
  dark: ColorPalette;
}

export const Colors: ColorsType = {
  light: {
    primary: '#4648D4',
    primaryLight: 'rgba(70, 72, 212, 0.1)',
    primaryGlow: 'rgba(70, 72, 212, 0.5)',
    
    background: '#F6F6F8',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    
    border: '#E2E8F0',
    divider: '#F1F5F9',
    indicator: '#E2E8F0',
    
    statusBar: 'dark',
  },
  
  dark: {
    primary: '#4648D4',
    primaryLight: 'rgba(70, 72, 212, 0.2)',
    primaryGlow: 'rgba(70, 72, 212, 0.5)',
    
    background: '#111122',
    surface: '#1A1A2E',
    card: '#262636',
    
    text: '#FFFFFF',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    
    border: '#374151',
    divider: '#262636',
    indicator: '#374151',
    
    statusBar: 'light',
  },
};

export type ColorScheme = keyof typeof Colors;