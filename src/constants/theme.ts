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
  },
} as const;

export const Fonts = Platform.select({
  ios: { sans: 'System', serif: 'Georgia', rounded: 'System', mono: 'Menlo' },
  android: { sans: 'sans-serif', serif: 'serif', rounded: 'sans-serif-medium', mono: 'monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
});

export type Theme = keyof typeof Colors;
export type ThemeColor = keyof typeof Colors.light;
export const Spacing = { half: 2, one: 4, two: 8, three: 16, four: 24, five: 32, six: 64 } as const;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
