import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuoteCard } from '@/components/quote-card';
import { StateView } from '@/components/ui/state-view';
import { StatusSurface } from '@/components/ui/surface';
import { Fonts, Motion, Spacing, Typography } from '@/constants/theme';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { ensureDailyQuote } from '@/services/quoteManager';
import { getCurrentQuote, getFavoriteQuotes, getLastFetchTime, toggleFavorite } from '@/storage/quoteStorage';
import { isQuoteBackgroundTaskRegistered } from '@/tasks/quoteBackgroundTask';
import type { Quote, QuoteSyncFailure } from '@/types/quote';
import { formatDate, formatTime, greeting } from '@/utils/dates';

function getErrorMessage(reason: QuoteSyncFailure): string {
  if (reason === 'timeout' || reason === 'network') return 'Check your connection and try again.';
  if (reason === 'invalid-response') return 'The quote service returned something unexpected.';
  if (reason === 'storage') return 'Daily could not save this quote on your device.';
  return 'We could not load a new quote right now.';
}

export default function TodayScreen() {
  const { colors } = useDailyTheme();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<QuoteSyncFailure | null>(null);
  const [quoteOpacity] = useState(() => new Animated.Value(0));

  const load = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    setError(null);
    try {
      const saved = await getCurrentQuote();
      if (saved) {
        setQuote(saved);
        setFavorite((await getFavoriteQuotes()).some((item) => item.id === saved.id));
        setLoading(false);
      }

      const result = await ensureDailyQuote(force);
      if (result.quote) {
        setQuote(result.quote);
        setFavorite((await getFavoriteQuotes()).some((item) => item.id === result.quote!.id));
      }
      if (result.status === 'failed') setError(result.reason);
      setLastFetch(await getLastFetchTime());
      setRegistered(await isQuoteBackgroundTaskRegistered());
    } catch (caught) {
      if (__DEV__) console.warn('Today screen failed to load quote', caught);
      setError('unknown');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!quote) return;
    quoteOpacity.setValue(0);
    Animated.timing(quoteOpacity, { toValue: 1, duration: Motion.standard, useNativeDriver: true }).start();
  }, [quote, quoteOpacity]);

  useFocusEffect(useCallback(() => {
    load().catch(() => undefined);
  }, [load]));

  const share = () => quote && Share.share({ message: `“${quote.quote}” — ${quote.author}` }).catch(() => undefined);

  const save = async () => {
    if (!quote) return;
    try {
      setFavorite(await toggleFavorite(quote));
    } catch (caught) {
      if (__DEV__) console.warn('Could not update favorite', caught);
      setError('storage');
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.brand, { color: colors.text }]}>Daily</Text>
          <Text style={[styles.greeting, { color: colors.muted }]}>{greeting()}</Text>
        </View>
        <Text style={[styles.date, { color: colors.muted }]}>
          {formatDate(new Date().toISOString(), { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      </View>

      <View style={styles.intro}>
        <Text style={[styles.title, { color: colors.text, fontFamily: Fonts?.serif }]}>
          A thought to carry{'\n'}with you today.
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Pause. Read. Let it settle.</Text>
      </View>

      {loading && !quote ? (
        <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>Finding today&apos;s thought…</Text>
        </View>
      ) : quote ? (
        <Animated.View style={{ opacity: quoteOpacity }}>
          <QuoteCard quote={quote} favorite={favorite} onFavorite={save} onShare={share} colors={colors} serif={Fonts?.serif} />
        </Animated.View>
      ) : (
        <StateView
          colors={colors}
          kind="error"
          title="Today's thought is taking a moment."
          message={error ? getErrorMessage(error) : 'Try again when you are ready.'}
          actionLabel="Try again"
          onAction={() => load(true)}
        />
      )}

      {quote && error && (
        <StatusSurface colors={colors}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
            <View style={styles.statusCopy}>
              <Text style={[styles.statusText, { color: colors.text }]}>Showing your saved quote</Text>
              <Text style={[styles.statusDetail, { color: colors.muted }]}>{getErrorMessage(error)}</Text>
            </View>
          </View>
        </StatusSurface>
      )}

      <StatusSurface colors={colors}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: registered ? colors.success : colors.warning }]} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {registered ? 'Background sync is on' : 'Background sync is unavailable here'}
          </Text>
          <Text style={[styles.updated, { color: colors.muted }]}>
            {lastFetch ? `Updated ${formatTime(lastFetch)}` : 'Waiting for first sync'}
          </Text>
        </View>
      </StatusSurface>

      <Pressable
        accessibilityLabel="Refresh today’s quote"
        accessibilityRole="button"
        accessibilityState={{ busy: refreshing }}
        disabled={refreshing}
        onPress={() => load(true)}
        style={({ pressed }) => [styles.refresh, { borderColor: colors.border, opacity: pressed || refreshing ? 0.65 : 1 }]}>
        {refreshing ? <ActivityIndicator size="small" color={colors.accent} /> : <Text style={[styles.refreshText, { color: colors.accent }]}>Refresh today&apos;s quote ↗</Text>}
      </Pressable>
      <Text style={[styles.note, { color: colors.muted }]}>
        Quotes refresh automatically when your device allows background work.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: Spacing.five, paddingTop: Spacing.four, paddingBottom: Spacing.seven, gap: Spacing.five },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { ...Typography.title },
  greeting: { ...Typography.caption, marginTop: Spacing.one },
  date: { ...Typography.caption, marginTop: Spacing.two },
  intro: { gap: Spacing.two, marginTop: Spacing.four },
  title: { ...Typography.display },
  subtitle: { ...Typography.body },
  loadingCard: { minHeight: 320, borderWidth: 1, borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: Spacing.four },
  loadingText: { ...Typography.body },
  statusDot: { width: 8, height: 8, borderRadius: 8, marginRight: Spacing.two },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusCopy: { flex: 1 },
  statusText: { ...Typography.label },
  statusDetail: { ...Typography.caption, marginTop: Spacing.one },
  updated: { ...Typography.caption, marginLeft: 'auto' },
  refresh: { minHeight: 48, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  refreshText: { ...Typography.label },
  note: { ...Typography.caption, textAlign: 'center', paddingHorizontal: Spacing.five },
});
