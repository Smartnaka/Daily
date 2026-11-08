import '@/tasks/quoteBackgroundTask';

import { SymbolView } from 'expo-symbols';
import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DailyThemeProvider, useDailyTheme } from '@/hooks/use-daily-theme';
import { getBackgroundSyncEnabled } from '@/storage/quoteStorage';
import * as QuoteTasks from '@/tasks/quoteBackgroundTask';

export default function RootLayout() {
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
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: theme === 'dark' ? '#0A84FF' : '#007AFF', tabBarLabelStyle: { fontSize: 11 } }}>
          <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color }) => <SymbolView tintColor={color} name={{ ios: 'sun.max', android: 'wb_sunny', web: 'light' }} size={22} /> }} />
          <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color }) => <SymbolView tintColor={color} name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }} size={22} /> }} />
          <Tabs.Screen name="favorites" options={{ title: 'Favorites', tabBarIcon: ({ color }) => <SymbolView tintColor={color} name={{ ios: 'star', android: 'star_border', web: 'star' }} size={22} /> }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <SymbolView tintColor={color} name={{ ios: 'gearshape', android: 'settings', web: 'settings' }} size={22} /> }} />
          <Tabs.Screen name="explore" options={{ title: 'Explore', tabBarIcon: ({ color }) => <SymbolView tintColor={color} name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={22} /> }} />
        </Tabs>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
