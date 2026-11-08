import { useColorScheme } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

export function useDailyTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  return { colors: Colors[theme], fonts: Fonts, theme };
}
