import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useDailyTheme } from '@/hooks/use-daily-theme';

export function Screen({ children }: PropsWithChildren) {
  const { colors } = useDailyTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Divider() {
  const { colors } = useDailyTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 22, paddingBottom: 36, gap: 18 },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
});
