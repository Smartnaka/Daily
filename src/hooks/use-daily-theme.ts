import { createContext, createElement, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { getThemePreference, saveThemePreference, type ThemePreference } from '@/storage/quoteStorage';

type DailyThemeContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const DailyThemeContext = createContext<DailyThemeContextValue | null>(null);

export function DailyThemeProvider({ children }: PropsWithChildren) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    getThemePreference().then(setPreferenceState).catch((error) => {
      if (__DEV__) console.warn('Could not load theme preference', error);
    });
  }, []);

  const value = useMemo<DailyThemeContextValue>(() => ({
    preference,
    setPreference: async (nextPreference) => {
      setPreferenceState(nextPreference);
      try {
        await saveThemePreference(nextPreference);
      } catch (error) {
        if (__DEV__) console.warn('Could not save theme preference', error);
      }
    },
  }), [preference]);

  return createElement(DailyThemeContext.Provider, { value }, children);
}

export function useDailyTheme() {
  const scheme = useColorScheme();
  const context = useContext(DailyThemeContext);
  const preference = context?.preference ?? 'system';
  const theme = preference === 'system' ? (scheme === 'dark' ? 'dark' : 'light') : preference;
  return {
    colors: Colors[theme],
    fonts: Fonts,
    theme,
    preference,
    setPreference: context?.setPreference ?? (async () => undefined),
  };
}
