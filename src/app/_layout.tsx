import '@/tasks/quoteBackgroundTask';

import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';
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
        <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#5D765F', tabBarLabelStyle: { fontSize: 11 } }}>
          <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>◒</Text> }} />
          <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>≡</Text> }} />
          <Tabs.Screen name="favorites" options={{ title: 'Favorites', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>♡</Text> }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⚙</Text> }} />
          <Tabs.Screen name="explore" options={{ href: null }} />
        </Tabs>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
