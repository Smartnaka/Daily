import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, SafeAreaView, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { QuoteCard } from '@/components/quote-card';
import { StateView } from '@/components/ui/state-view';
import { Fonts, Spacing, Typography } from '@/constants/theme';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { ensureDailyQuote } from '@/services/quoteManager';
import { getCurrentQuote, getFavoriteQuotes, toggleFavorite } from '@/storage/quoteStorage';
import type { Quote, QuoteSyncFailure } from '@/types/quote';
import { formatDate } from '@/utils/dates';

function getErrorMessage(reason: QuoteSyncFailure): string {
  if (reason === 'timeout' || reason === 'network') return 'Check your connection and try again.';
  if (reason === 'storage') return 'Daily could not save this quote on your device.';
  return 'We could not load a quote right now.';
}

export default function TodayScreen() {
  const { colors } = useDailyTheme();
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<QuoteSyncFailure | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const saved = await getCurrentQuote();
      if (saved) {
        setQuote(saved);
        setFavorite((await getFavoriteQuotes()).some((item) => item.id === saved.id));
        setLoading(false);
      }
      const result = await ensureDailyQuote();
      if (result.quote) {
        setQuote(result.quote);
        setFavorite((await getFavoriteQuotes()).some((item) => item.id === result.quote!.id));
      }
      if (result.status === 'failed' && !result.quote) setError(result.reason);
    } catch (caught) {
      if (__DEV__) console.warn('Today screen failed to load quote', caught);
      setError('unknown');
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  useFocusEffect(useCallback(() => {
    load().catch(() => undefined);
  }, [load]));

  const save = async () => {
    if (!quote) return;
    try {
      setFavorite(await toggleFavorite(quote));
    } catch (caught) {
      if (__DEV__) console.warn('Could not update favorite', caught);
      setError('storage');
    }
  };

  const share = () => quote && Share.share({ message: `“${quote.quote}” — ${quote.author}` }).catch(() => undefined);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        alwaysBounceVertical
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.text }]}>Daily</Text>
          <Pressable accessibilityLabel="Open settings" accessibilityRole="button" onPress={() => router.push('/settings')} hitSlop={10}>
            <SymbolView tintColor={colors.muted} name={{ ios: 'gearshape', android: 'settings', web: 'settings' }} size={22} />
          </Pressable>
        </View>
        <Text style={[styles.date, { color: colors.muted }]}>
          {formatDate(new Date().toISOString(), { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        <View style={styles.quoteArea}>
          {loading && !quote ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : quote ? (
            <QuoteCard quote={quote} favorite={favorite} onFavorite={save} onShare={share} colors={colors} serif={Fonts?.serif} />
          ) : (
            <StateView
              colors={colors}
              kind="error"
              title="Today’s quote is taking a moment."
              message={error ? getErrorMessage(error) : 'Try again when you are ready.'}
              actionLabel="Try again"
              onAction={load}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.five, paddingBottom: Spacing.ten },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { ...Typography.title },
  date: { ...Typography.caption, marginTop: Spacing.three },
  quoteArea: { width: '100%', maxWidth: 560, alignSelf: 'center', marginTop: Spacing.eight },
  loading: { minHeight: 320, justifyContent: 'center', alignItems: 'center' },
});
