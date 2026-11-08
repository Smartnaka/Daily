import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Animated, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StateView } from '@/components/ui/state-view';
import { StatusSurface, Surface } from '@/components/ui/surface';
import { Fonts, Radii, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { clearQuoteHistory, getFavoriteQuotes, getQuoteHistory, toggleFavorite } from '@/storage/quoteStorage';
import type { Quote } from '@/types/quote';
import { formatDate } from '@/utils/dates';

type HistoryGroup = {
  label: string;
  quotes: Quote[];
};

function dayKey(timestamp: string): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function groupHistory(quotes: Quote[]): HistoryGroup[] {
  const groups = new Map<string, Quote[]>();
  quotes.forEach((quote) => {
    const key = dayKey(quote.fetchedAt);
    groups.set(key, [...(groups.get(key) ?? []), quote]);
  });

  return Array.from(groups.values()).map((items) => ({
    label: formatGroupLabel(items[0].fetchedAt),
    quotes: items,
  }));
}

function formatGroupLabel(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  const difference = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);

  if (difference === 0) return 'Today';
  if (difference === 1) return 'Yesterday';
  return formatDate(timestamp, { month: 'long', day: 'numeric', year: 'numeric' });
}

function HistoryCard({
  quote,
  favorite,
  colors,
  onFavorite,
  onShare,
}: {
  quote: Quote;
  favorite: boolean;
  colors: ThemeColors;
  onFavorite: () => void;
  onShare: () => void;
}) {
  return (
    <Surface colors={colors} padding="five" style={styles.card}>
      <Text style={[styles.quote, { color: colors.text, fontFamily: Fonts?.serif }]}>“{quote.quote}”</Text>
      <Text style={[styles.author, { color: colors.muted }]}>— {quote.author}</Text>
      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        <Text style={[styles.date, { color: colors.muted }]}>
          {formatDate(quote.fetchedAt, { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={favorite ? 'Remove quote from favorites' : 'Save quote to favorites'}
            accessibilityRole="button"
            accessibilityState={{ selected: favorite }}
            hitSlop={8}
            onPress={onFavorite}
            style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.actionText, { color: favorite ? colors.accent : colors.muted }]}>
              {favorite ? '♥ Saved' : '♡ Save'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Share quote"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onShare}
            style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.actionText, { color: colors.muted }]}>Share ↗</Text>
          </Pressable>
        </View>
      </View>
    </Surface>
  );
}

export default function HistoryScreen() {
  const { colors } = useDailyTheme();
  const [history, setHistory] = useState<Quote[]>([]);
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [animation] = useState(() => new Animated.Value(0));

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [nextHistory, nextFavorites] = await Promise.all([getQuoteHistory(), getFavoriteQuotes()]);
      setHistory(nextHistory);
      setFavorites(nextFavorites);
      Animated.timing(animation, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    } catch (loadError) {
      if (__DEV__) console.warn('Could not load quote history', loadError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [animation]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const updateFavorite = useCallback(async (quote: Quote) => {
    try {
      await toggleFavorite(quote);
      setFavorites(await getFavoriteQuotes());
    } catch (favoriteError) {
      if (__DEV__) console.warn('Could not update favorite quote', favoriteError);
    }
  }, []);

  const confirmClear = useCallback(() => {
    Alert.alert('Clear history?', 'This removes your saved quote history but keeps your favorites.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear history',
        style: 'destructive',
        onPress: async () => {
          try {
            await clearQuoteHistory();
            setHistory([]);
          } catch (clearError) {
            if (__DEV__) console.warn('Could not clear quote history', clearError);
            setError(true);
          }
        },
      },
    ]);
  }, []);

  const groups = groupHistory(history);

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR ARCHIVE</Text>
          <Text style={[styles.title, { color: colors.text }]}>History</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Revisit the thoughts that met you along the way.
          </Text>
        </View>
        {history.length > 0 && (
          <Pressable
            accessibilityLabel="Clear quote history"
            accessibilityRole="button"
            onPress={confirmClear}
            style={({ pressed }) => [styles.clearButton, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.clearText, { color: colors.danger }]}>Clear</Text>
          </Pressable>
        )}
      </View>

      <StatusSurface colors={colors}>
        <Text style={[styles.summaryLabel, { color: colors.accent }]}>COLLECTED THOUGHTS</Text>
        <Text style={[styles.summary, { color: colors.text }]}>
          {history.length === 1 ? '1 quote saved' : `${history.length} quotes saved`}
        </Text>
      </StatusSurface>

      {loading ? (
        <StateView colors={colors} kind="loading" title="Opening your archive…" />
      ) : error ? (
        <StateView
          colors={colors}
          kind="error"
          title="History is unavailable right now."
          message="Your saved quotes are still safe. Try opening this page again."
          actionLabel="Try again"
          onAction={load}
        />
      ) : history.length === 0 ? (
        <StateView
          colors={colors}
          title="Your archive is waiting."
          message="Quotes you receive will be kept here so you can return to them whenever you need a little perspective."
        />
      ) : (
        <Animated.View style={{ opacity: animation, transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
          {groups.map((group) => (
            <View key={group.label} style={styles.group}>
              <Text style={[styles.groupTitle, { color: colors.text }]}>{group.label}</Text>
              {group.quotes.map((quote) => (
                <HistoryCard
                  key={`${quote.id}-${quote.fetchedAt}`}
                  quote={quote}
                  colors={colors}
                  favorite={favorites.some((item) => item.id === quote.id)}
                  onFavorite={() => updateFavorite(quote)}
                  onShare={() => Share.share({ message: `“${quote.quote}” — ${quote.author}` })}
                />
              ))}
            </View>
          ))}
        </Animated.View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: Spacing.two },
  headerCopy: { flex: 1, gap: Spacing.one },
  eyebrow: { ...Typography.overline },
  title: { ...Typography.display },
  subtitle: { ...Typography.body, maxWidth: 330, marginTop: Spacing.one },
  clearButton: { minHeight: 44, justifyContent: 'center', paddingLeft: Spacing.four },
  clearText: { ...Typography.label },
  summaryLabel: { ...Typography.overline },
  summary: { ...Typography.bodyMedium, marginTop: Spacing.one },
  group: { gap: Spacing.three, marginTop: Spacing.two },
  groupTitle: { ...Typography.label, marginBottom: Spacing.one },
  card: { borderRadius: Radii.medium, gap: Spacing.two },
  quote: { ...Typography.bodyMedium, fontSize: 20, lineHeight: 29 },
  author: { ...Typography.caption },
  cardFooter: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { ...Typography.caption },
  actions: { flexDirection: 'row', gap: Spacing.four },
  action: { minHeight: 32, justifyContent: 'center' },
  actionText: { ...Typography.label },
});
