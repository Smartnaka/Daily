import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { ensureDailyQuote } from '@/services/quoteManager';
import { getLastFetchTime } from '@/storage/quoteStorage';
import { isQuoteBackgroundTaskRegistered } from '@/tasks/quoteBackgroundTask';
import { formatDate, formatTime } from '@/utils/dates';

export default function SettingsScreen() {
  const { colors } = useDailyTheme();
  const [registered, setRegistered] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const load = useCallback(async () => { setRegistered(await isQuoteBackgroundTaskRegistered()); setLastSync(await getLastFetchTime()); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const sync = async () => { setSyncing(true); await ensureDailyQuote(true); await load(); setSyncing(false); };
  return <Screen><Text style={[styles.title, { color: colors.text }]}>Settings</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Keep Daily quiet, useful, and yours.</Text><View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.section, { color: colors.text }]}>Background sync</Text><Text style={[styles.body, { color: colors.muted }]}>{registered ? 'Daily can refresh quotes in the background.' : 'Background execution is not available in this environment.'}</Text><Text style={[styles.small, { color: colors.muted }]}>Last successful sync: {lastSync ? `${formatDate(lastSync)} at ${formatTime(lastSync)}` : 'Not yet synced'}</Text><Pressable onPress={sync} disabled={syncing} style={[styles.button, { backgroundColor: colors.accent }]}>{syncing ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sync now</Text>}</Pressable></View><View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}><Text style={[styles.section, { color: colors.text }]}>Appearance</Text><Text style={[styles.body, { color: colors.muted }]}>Daily follows your device light or dark theme automatically.</Text></View><View style={styles.about}><Text style={[styles.section, { color: colors.text }]}>About Daily</Text><Text style={[styles.body, { color: colors.muted }]}>A small daily reading ritual. Quotes come from DummyJSON. Background work is scheduled by iOS and Android and is never guaranteed to run at an exact time.</Text></View></Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 34, fontWeight: '700', marginTop: 12 }, subtitle: { fontSize: 14, marginBottom: 10 }, card: { borderWidth: 1, borderRadius: 20, padding: 20, gap: 12 }, section: { fontSize: 17, fontWeight: '700' }, body: { fontSize: 14, lineHeight: 21 }, small: { fontSize: 12 }, button: { borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 4 }, buttonText: { color: '#FFF', fontWeight: '700' }, about: { padding: 4, gap: 10 } });
