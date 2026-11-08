import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F7F4ED',
    surface: '#FFFFFF',
    text: '#292A26',
    muted: '#73766F',
    border: '#D9D5CC',
    backgroundElement: '#ECE8DF',
    backgroundSelected: '#DDE6D9',
    textSecondary: '#62645E',
    accent: '#263D32',
    accentSoft: '#E7EEE4',
    terracotta: '#C77D61',
    danger: '#B65F4A',
    warning: '#B67A36',
    success: '#486B50',
  },
  dark: {
    background: '#171D19',
    surface: '#222B25',
    text: '#F4F1E9',
    muted: '#A7B5A0',
    border: '#3A463C',
    backgroundElement: '#2C372F',
    backgroundSelected: '#405344',
    textSecondary: '#C2CBC0',
    accent: '#B6CBB9',
    accentSoft: '#2A3A2D',
    terracotta: '#D89579',
    danger: '#D89579',
    warning: '#D5A76A',
    success: '#9CC3A3',
  },
} as const;

export type ThemeColors = (typeof Colors)[keyof typeof Colors];

export const Fonts = Platform.select({
  ios: { sans: 'System', serif: 'Lora_400Regular', rounded: 'System', mono: 'Menlo' },
  android: { sans: 'sans-serif', serif: 'Lora_400Regular', rounded: 'sans-serif-medium', mono: 'monospace' },
  default: { sans: 'normal', serif: 'Lora_400Regular', rounded: 'normal', mono: 'monospace' },
});

export const Typography = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const, letterSpacing: 0.3 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const, letterSpacing: 0.2 },
  quote: { fontSize: 22, lineHeight: 30, fontWeight: '400' as const, letterSpacing: 0 },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 17, lineHeight: 24, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, letterSpacing: 0 },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const, letterSpacing: 0 },
  overline: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0 },
} as const;

export type Theme = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light;
export const Spacing = {
  hairline: 1,
  half: 2,
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 20,
  six: 24,
  seven: 32,
  eight: 40,
  nine: 48,
  ten: 64,
} as const;
export const Radii = { small: 8, medium: 12, large: 14, pill: 999 } as const;
export const Elevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  subtle: { shadowOpacity: 0, elevation: 0 },
} as const;
export const Motion = { fast: 120, standard: 180, slow: 240 } as const;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
