import Constants from 'expo-constants';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Button } from '@/components/ui/button';
import { StateView } from '@/components/ui/state-view';
import { StatusSurface, Surface } from '@/components/ui/surface';
import { Radii, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { ensureDailyQuote } from '@/services/quoteManager';
import {
  clearQuoteHistory,
  getBackgroundSyncEnabled,
  getLastFetchTime,
  saveBackgroundSyncEnabled,
  type ThemePreference,
} from '@/storage/quoteStorage';
import { isQuoteBackgroundTaskRegistered, registerQuoteBackgroundTask, unregisterQuoteBackgroundTask } from '@/tasks/quoteBackgroundTask';
import { formatDate, formatTime } from '@/utils/dates';

function SettingRow({
  colors,
  label,
  description,
  children,
}: {
  colors: ThemeColors;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {description && <Text style={[styles.rowDescription, { color: colors.muted }]}>{description}</Text>}
      </View>
      {children}
    </View>
  );
}

function Section({
  colors,
  title,
  children,
}: {
  colors: ThemeColors;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionGroup}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>{title.toUpperCase()}</Text>
      <Surface colors={colors} padding="none" style={styles.sectionSurface}>
        {children}
      </Surface>
    </View>
  );
}

function ThemeOption({
  colors,
  label,
  selected,
  onPress,
}: {
  colors: ThemeColors;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={`${label} theme`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.themeOption,
        { backgroundColor: selected ? colors.backgroundSelected : 'transparent', opacity: pressed ? 0.65 : 1 },
      ]}>
      <Text style={[styles.themeOptionText, { color: selected ? colors.accent : colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useDailyTheme();
  const router = useRouter();
  const [backgroundEnabled, setBackgroundEnabled] = useState(true);
  const [registered, setRegistered] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [enabled, taskRegistered, fetchTime] = await Promise.all([
        getBackgroundSyncEnabled(),
        isQuoteBackgroundTaskRegistered(),
        getLastFetchTime(),
      ]);
      setBackgroundEnabled(enabled);
      setRegistered(taskRegistered);
      setLastSync(fetchTime);
    } catch (loadError) {
      if (__DEV__) console.warn('Could not load settings', loadError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const updateBackgroundSync = useCallback(async (enabled: boolean) => {
    setBackgroundEnabled(enabled);
    try {
      const available = enabled
        ? await registerQuoteBackgroundTask()
        : await unregisterQuoteBackgroundTask();
      if (enabled && !available) {
        setBackgroundEnabled(false);
        Alert.alert('Background sync unavailable', 'This build cannot schedule background work in the current environment.');
        return;
      }
      await saveBackgroundSyncEnabled(enabled);
      setRegistered(enabled);
    } catch (syncError) {
      if (__DEV__) console.warn('Could not update background sync', syncError);
      setBackgroundEnabled(!enabled);
      Alert.alert('Could not update background sync', 'Please try again.');
    }
  }, []);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await ensureDailyQuote(true);
      if (result.status === 'failed') {
        Alert.alert('Sync did not complete', 'Your existing quote is still available. Please try again later.');
      }
      await load();
    } catch (syncError) {
      if (__DEV__) console.warn('Could not sync quote from settings', syncError);
      Alert.alert('Sync did not complete', 'Please check your connection and try again.');
    } finally {
      setSyncing(false);
    }
  }, [load]);

  const confirmClearHistory = useCallback(() => {
    Alert.alert('Clear quote history?', 'This removes your history but keeps your favorites and current quote.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear history',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearQuoteHistory();
            Alert.alert('History cleared', 'Your favorite quotes were kept.');
          } catch (clearError) {
            if (__DEV__) console.warn('Could not clear quote history from settings', clearError);
            Alert.alert('Could not clear history', 'Please try again.');
          }
        },
      },
    ]);
  }, []);

  if (loading) {
    return (
      <Screen>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <StateView colors={colors} kind="loading" title="Loading your settings…" />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <StateView colors={colors} kind="error" title="Settings are unavailable right now." actionLabel="Try again" onAction={load} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>MAKE IT YOURS</Text>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Keep Daily quiet, useful, and yours.</Text>
      </View>

      <StatusSurface colors={colors}>
        <Text style={[styles.summaryLabel, { color: colors.accent }]}>DAILY STATUS</Text>
        <Text style={[styles.summary, { color: colors.text }]}>
          {lastSync ? `Last synced ${formatDate(lastSync, { month: 'short', day: 'numeric' })}` : 'Waiting for your first sync'}
        </Text>
      </StatusSurface>

      <Section colors={colors} title="Appearance">
        <View style={styles.themeControl}>
          <Text style={[styles.rowLabel, { color: colors.text }]}>Theme</Text>
          <View style={[styles.themeOptions, { borderColor: colors.border }]}>
            {(['system', 'light', 'dark'] as ThemePreference[]).map((option) => (
              <ThemeOption
                key={option}
                colors={colors}
                label={option[0].toUpperCase() + option.slice(1)}
                selected={preference === option}
                onPress={() => setPreference(option)}
              />
            ))}
          </View>
        </View>
      </Section>

      <Section colors={colors} title="Background sync">
        <SettingRow colors={colors} label="Refresh in background" description="The operating system decides when background work runs.">
          <Switch
            accessibilityLabel="Enable background quote sync"
            accessibilityRole="switch"
            onValueChange={updateBackgroundSync}
            thumbColor={backgroundEnabled ? colors.surface : colors.muted}
            trackColor={{ false: colors.backgroundElement, true: colors.accent }}
            value={backgroundEnabled}
          />
        </SettingRow>
        <SettingRow
          colors={colors}
          label="Sync status"
          description={registered ? 'Scheduled when supported by this build.' : 'Not currently scheduled.'}>
          <Text style={[styles.value, { color: registered ? colors.success : colors.muted }]}>{registered ? 'On' : 'Off'}</Text>
        </SettingRow>
        <View style={styles.syncAction}>
          <Text style={[styles.rowDescription, { color: colors.muted }]}>
            {lastSync ? `Last successful sync: ${formatDate(lastSync)} at ${formatTime(lastSync)}` : 'No successful sync recorded yet.'}
          </Text>
          <Button colors={colors} label="Sync now" loading={syncing} onPress={sync} variant="secondary" />
        </View>
      </Section>

      <Section colors={colors} title="Data & privacy">
        <SettingRow colors={colors} label="Manage favorites" description="Review or remove the quotes you have saved.">
          <Pressable accessibilityRole="button" onPress={() => router.push('/favorites')} style={styles.rowAction}>
            <Text style={[styles.rowActionText, { color: colors.accent }]}>Open</Text>
          </Pressable>
        </SettingRow>
        <SettingRow colors={colors} label="Clear quote history" description="Remove history while keeping favorites and your current quote.">
          <Pressable accessibilityRole="button" onPress={confirmClearHistory} style={styles.rowAction}>
            <Text style={[styles.rowActionText, { color: colors.danger }]}>Clear</Text>
          </Pressable>
        </SettingRow>
      </Section>

      <Section colors={colors} title="About">
        <SettingRow colors={colors} label="Version" description="Daily quote reading ritual">
          <Text style={[styles.value, { color: colors.muted }]}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </SettingRow>
        <View style={styles.aboutCopy}>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Quotes are provided by DummyJSON. Daily stores your quote history and favorites locally on this device.
          </Text>
          <Text style={[styles.aboutText, { color: colors.muted }]}>
            Background fetching is separate from notifications and is never guaranteed to run at an exact time.
          </Text>
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: Spacing.two, gap: Spacing.one },
  eyebrow: { ...Typography.overline },
  title: { ...Typography.display },
  subtitle: { ...Typography.body, marginTop: Spacing.one },
  summaryLabel: { ...Typography.overline },
  summary: { ...Typography.bodyMedium, marginTop: Spacing.one },
  sectionGroup: { gap: Spacing.two },
  sectionTitle: { ...Typography.overline, marginLeft: Spacing.two },
  sectionSurface: { borderRadius: Radii.medium, overflow: 'hidden' },
  row: { minHeight: 72, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth },
  rowCopy: { flex: 1, gap: Spacing.one },
  rowLabel: { ...Typography.bodyMedium },
  rowDescription: { ...Typography.caption },
  value: { ...Typography.label },
  rowAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.two },
  rowActionText: { ...Typography.label },
  themeControl: { padding: Spacing.four, gap: Spacing.three },
  themeOptions: { flexDirection: 'row', borderWidth: 1, borderRadius: Radii.small, padding: Spacing.one, gap: Spacing.one },
  themeOption: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.small },
  themeOptionText: { ...Typography.label },
  syncAction: { padding: Spacing.four, gap: Spacing.three },
  aboutCopy: { padding: Spacing.four, gap: Spacing.three },
  aboutText: { ...Typography.caption },
});
