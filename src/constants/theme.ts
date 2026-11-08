import { Platform } from 'react-native';

export const Colors = {
  light: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#1C1C1E',
    muted: '#8E8E93',
    border: '#C6C6C8',
    backgroundElement: '#E5E5EA',
    backgroundSelected: '#D1D1D6',
    textSecondary: '#636366',
    accent: '#007AFF',
    accentSoft: '#E5F1FF',
    danger: '#FF3B30',
    warning: '#FF9500',
    success: '#34C759',
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    text: '#F2F2F7',
    muted: '#8E8E93',
    border: '#38383A',
    backgroundElement: '#2C2C2E',
    backgroundSelected: '#48484A',
    textSecondary: '#AEAEB2',
    accent: '#0A84FF',
    accentSoft: '#102A44',
    danger: '#FF453A',
    warning: '#FF9F0A',
    success: '#30D158',
  },
} as const;

export type ThemeColors = (typeof Colors)[keyof typeof Colors];

export const Fonts = Platform.select({
  ios: { sans: 'System', serif: 'System', rounded: 'System', mono: 'Menlo' },
  android: { sans: 'sans-serif', serif: 'sans-serif', rounded: 'sans-serif-medium', mono: 'monospace' },
  default: { sans: 'normal', serif: 'normal', rounded: 'normal', mono: 'monospace' },
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
