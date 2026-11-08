import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F6F4EF',
    surface: '#FFFDF8',
    text: '#20231F',
    muted: '#74766E',
    border: '#E6E2D9',
    backgroundElement: '#EEECE5',
    backgroundSelected: '#E4EBDD',
    textSecondary: '#74766E',
    accent: '#5D765F',
    accentSoft: '#E4EBDD',
    danger: '#A25D4B',
    warning: '#9A743D',
    success: '#5D765F',
  },
  dark: {
    background: '#171A17',
    surface: '#222722',
    text: '#F5F2E9',
    muted: '#A5AA9F',
    border: '#343B34',
    backgroundElement: '#2A302A',
    backgroundSelected: '#354535',
    textSecondary: '#A5AA9F',
    accent: '#A8C39C',
    accentSoft: '#2D3C2E',
    danger: '#E19A83',
    warning: '#D5B277',
    success: '#A8C39C',
  },
} as const;

export type ThemeColors = (typeof Colors)[keyof typeof Colors];

export const Fonts = Platform.select({
  ios: { sans: 'System', serif: 'Georgia', rounded: 'System', mono: 'Menlo' },
  android: { sans: 'sans-serif', serif: 'serif', rounded: 'sans-serif-medium', mono: 'monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
});

export const Typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '600' as const, letterSpacing: -0.8 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '600' as const, letterSpacing: -0.5 },
  quote: { fontSize: 29, lineHeight: 38, fontWeight: '400' as const, letterSpacing: -0.5 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const, letterSpacing: 0.1 },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' as const, letterSpacing: 0.1 },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 1.1 },
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
export const Radii = { small: 10, medium: 16, large: 24, pill: 999 } as const;
export const Elevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  subtle: { shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
} as const;
export const Motion = { fast: 160, standard: 240, slow: 360 } as const;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
