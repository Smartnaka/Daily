import '@/tasks/quoteBackgroundTask';

import { Lora_400Regular, Lora_500Medium, Lora_600SemiBold, useFonts } from '@expo-google-fonts/lora';
import { SymbolView } from 'expo-symbols';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DailyThemeProvider, useDailyTheme } from '@/hooks/use-daily-theme';
import { getBackgroundSyncEnabled } from '@/storage/quoteStorage';
import * as QuoteTasks from '@/tasks/quoteBackgroundTask';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <DailyThemeProvider>
      <RootTabs />
    </DailyThemeProvider>
  );
}

function RootTabs() {
  const { theme } = useDailyTheme();

  useEffect(() => {
    getBackgroundSyncEnabled().then((enabled) => {
      if (!enabled) return;
      return QuoteTasks.registerQuoteBackgroundTask();
    }).catch((error) => {
      if (__DEV__) console.warn('Could not register background quote task', error);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme === 'dark' ? '#B6CBB9' : '#263D32', tabBarLabelStyle: { fontSize: 11 } }}>
          <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color }) => <SymbolView tintColor={color} name={{ ios: 'sun.max', android: 'wb_sunny', web: 'light' }} size={22} /> }} />
          <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color }) => <SymbolView tintColor={color} name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={22} /> }} />
          <Tabs.Screen name="saved" options={{ title: 'Saved', tabBarIcon: ({ color }) => <SymbolView tintColor={color} name={{ ios: 'bookmark', android: 'bookmark_border', web: 'bookmark' }} size={22} /> }} />
          <Tabs.Screen name="history" options={{ href: null }} />
          <Tabs.Screen name="favorites" options={{ href: null }} />
          <Tabs.Screen name="settings" options={{ href: null }} />
        </Tabs>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
