import '@/tasks/quoteBackgroundTask';

import { DarkTheme, DefaultTheme, Tabs, ThemeProvider } from 'expo-router';
import { useEffect } from 'react';
import { Text, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as QuoteTasks from '@/tasks/quoteBackgroundTask';

export default function RootLayout() {
  const scheme = useColorScheme();

  useEffect(() => {
    QuoteTasks.registerQuoteBackgroundTask().catch((error) => {
      if (__DEV__) console.warn('Could not register background quote task', error);
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
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
