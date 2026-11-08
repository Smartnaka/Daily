import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { QuoteCard } from '@/components/quote-card';
import { Screen } from '@/components/screen';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { ensureDailyQuote } from '@/services/quoteManager';
import { getFavoriteQuotes, getLastFetchTime, getCurrentQuote, toggleFavorite } from '@/storage/quoteStorage';
import { isQuoteBackgroundTaskRegistered } from '@/tasks/quoteBackgroundTask';
import type { Quote } from '@/types/quote';
import { formatDate, formatTime, greeting } from '@/utils/dates';

export default function TodayScreen() {
  const { colors, fonts } = useDailyTheme();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    const saved = await getCurrentQuote();
    if (saved) {
      setQuote(saved);
      setFavorite((await getFavoriteQuotes()).some((item) => item.id === saved.id));
    }
    const result = await ensureDailyQuote(force);
    if (result.quote) {
      setQuote(result.quote);
      setFavorite((await getFavoriteQuotes()).some((item) => item.id === result.quote!.id));
    }
    setLastFetch(await getLastFetchTime());
    setRegistered(await isQuoteBackgroundTaskRegistered());
  }, []);

  useFocusEffect(useCallback(() => { load().catch(() => undefined); }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
  };

  const share = () => quote && Share.share({ message: `“${quote.quote}” — ${quote.author}` });
  const save = async () => {
    if (!quote) return;
    setFavorite(await toggleFavorite(quote));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <View><Text style={[styles.brand, { color: colors.text }]}>Daily</Text><Text style={[styles.eyebrow, { color: colors.muted }]}>{greeting()}</Text></View>
        <Text style={[styles.date, { color: colors.muted }]}>{formatDate(new Date().toISOString(), { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
      </View>
      <View style={styles.intro}><Text style={[styles.title, { color: colors.text, fontFamily: fonts?.serif }]}>A thought to carry{'\n'}with you today.</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Pause. Read. Let it settle.</Text></View>
      {quote ? <QuoteCard quote={quote} favorite={favorite} onFavorite={save} onShare={share} colors={colors} serif={fonts?.serif} /> : <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}><ActivityIndicator color={colors.accent} /><Text style={{ color: colors.muted }}>Finding today’s thought…</Text></View>}
      <View style={[styles.status, { backgroundColor: colors.accentSoft }]}>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        <Text style={[styles.statusText, { color: colors.text }]}>{registered ? 'Background sync is on' : 'Background sync is unavailable here'}</Text>
        <Text style={[styles.updated, { color: colors.muted }]}>{lastFetch ? `Updated ${formatTime(lastFetch)}` : 'Waiting for first sync'}</Text>
      </View>
      <Pressable onPress={refresh} disabled={refreshing} style={[styles.refresh, { borderColor: colors.border }]}>
        {refreshing ? <ActivityIndicator size="small" color={colors.accent} /> : <Text style={{ color: colors.accent, fontWeight: '700' }}>Refresh today’s quote ↗</Text>}
      </Pressable>
      <Text style={[styles.note, { color: colors.muted }]}>Quotes are refreshed automatically when your device allows background work.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 8 },
  brand: { fontSize: 28, fontWeight: '700', letterSpacing: -1 },
  eyebrow: { fontSize: 12, marginTop: 3, letterSpacing: 0.5 },
  date: { fontSize: 12, marginTop: 8 },
  intro: { marginTop: 22, gap: 8 },
  title: { fontSize: 31, lineHeight: 36, letterSpacing: -0.8 },
  subtitle: { fontSize: 14 },
  emptyCard: { minHeight: 310, borderRadius: 28, justifyContent: 'center', alignItems: 'center', gap: 14 },
  status: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 7 },
  statusText: { fontSize: 12, fontWeight: '600', flex: 1 },
  updated: { fontSize: 11 },
  refresh: { borderWidth: 1, borderRadius: 14, padding: 15, alignItems: 'center' },
  note: { fontSize: 12, lineHeight: 18, textAlign: 'center', paddingHorizontal: 20 },
});
