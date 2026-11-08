import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Animated, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StateView } from '@/components/ui/state-view';
import { StatusSurface, Surface } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Fonts, Radii, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { fetchDiscoveryQuotes } from '@/services/quoteService';
import { getFavoriteQuotes, getQuoteHistory, toggleFavorite } from '@/storage/quoteStorage';
import type { Quote } from '@/types/quote';

function uniqueQuotes(quotes: Quote[]): Quote[] {
  return quotes.filter((quote, index, items) => items.findIndex((item) => item.id === quote.id) === index);
}

function matchesSearch(quote: Quote, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return `${quote.quote} ${quote.author}`.toLowerCase().includes(query);
}

function DiscoveryCard({
  quote,
  colors,
  favorite,
  onFavorite,
  onShare,
}: {
  quote: Quote;
  colors: ThemeColors;
  favorite: boolean;
  onFavorite: () => void;
  onShare: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Surface colors={colors} padding="five" style={styles.card}>
        <Pressable
          accessibilityHint="Double tap to show or hide quote actions"
          accessibilityLabel={`Quote by ${quote.author}`}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((current) => !current)}
          onPressIn={() => Animated.spring(scale, { toValue: 0.985, useNativeDriver: true }).start()}
          onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}>
          <Text style={[styles.mark, { color: colors.accent }]}>“</Text>
          <Text style={[styles.quote, { color: colors.text, fontFamily: Fonts?.serif }]}>{quote.quote}</Text>
          <Text style={[styles.author, { color: colors.muted }]}>— {quote.author}</Text>
        </Pressable>

        {expanded && (
          <View style={[styles.details, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.detailLabel, { color: colors.accent }]}>DISCOVERED QUOTE</Text>
            <Text style={[styles.detailText, { color: colors.muted }]}>
              Save it for later or share it with someone who needs it.
            </Text>
          </View>
        )}

        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <Pressable
            accessibilityLabel={favorite ? 'Remove quote from favorites' : 'Add quote to favorites'}
            accessibilityRole="button"
            accessibilityState={{ selected: favorite }}
            hitSlop={8}
            onPress={onFavorite}
            style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.actionIcon, { color: favorite ? colors.accent : colors.muted }]}>
              {favorite ? '♥' : '♡'}
            </Text>
            <Text style={[styles.actionText, { color: favorite ? colors.accent : colors.muted }]}>
              {favorite ? 'Saved' : 'Save'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Share discovered quote"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onShare}
            style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.actionIcon, { color: colors.muted }]}>↗</Text>
            <Text style={[styles.actionText, { color: colors.muted }]}>Share</Text>
          </Pressable>
        </View>
      </Surface>
    </Animated.View>
  );
}

export default function ExploreScreen() {
  const { colors } = useDailyTheme();
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [animation] = useState(() => new Animated.Value(0));

  const load = useCallback(async (append = false) => {
    if (append) setRefreshing(true);
    else setLoading(true);
    setError(false);

    try {
      const [history, saved] = await Promise.all([getQuoteHistory(), getFavoriteQuotes()]);
      setFavorites(saved);
      const localQuotes = uniqueQuotes([...saved, ...history]);
      try {
        const freshQuotes = await fetchDiscoveryQuotes(6, localQuotes.map((quote) => quote.id));
        setQuotes((current) => uniqueQuotes(append ? [...current, ...freshQuotes] : [...freshQuotes, ...localQuotes]));
      } catch (fetchError) {
        if (__DEV__) console.warn('Discovery API unavailable; using saved quotes', fetchError);
        if (localQuotes.length === 0) throw fetchError;
        setQuotes((current) => (append ? current : localQuotes));
      }
      Animated.timing(animation, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    } catch (loadError) {
      if (__DEV__) console.warn('Could not load Explore', loadError);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [animation]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const results = useMemo(() => quotes.filter((quote) => matchesSearch(quote, search)), [quotes, search]);

  const updateFavorite = useCallback(async (quote: Quote) => {
    try {
      const isSaved = await toggleFavorite(quote);
      setFavorites((current) =>
        isSaved ? [quote, ...current.filter((item) => item.id !== quote.id)] : current.filter((item) => item.id !== quote.id),
      );
    } catch (favoriteError) {
      if (__DEV__) console.warn('Could not update discovery favorite', favoriteError);
    }
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.accent }]}>BEYOND TODAY</Text>
        <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Find a thought that meets you where you are.
        </Text>
      </View>

      <TextField
        accessibilityLabel="Search discovered quotes"
        autoCapitalize="none"
        autoCorrect={false}
        colors={colors}
        onChangeText={setSearch}
        placeholder="Search quotes or authors"
        returnKeyType="search"
        value={search}
      />

      <StatusSurface colors={colors}>
        <Text style={[styles.summaryLabel, { color: colors.accent }]}>REAL-TIME DISCOVERY</Text>
        <Text style={[styles.summary, { color: colors.text }]}>
          {search ? `${results.length} matching ${results.length === 1 ? 'quote' : 'quotes'}` : 'Fresh thoughts from the quote library'}
        </Text>
      </StatusSurface>

      {loading ? (
        <StateView colors={colors} kind="loading" title="Finding a few good thoughts…" />
      ) : error ? (
        <StateView
          colors={colors}
          kind="error"
          title="Explore is unavailable right now."
          message="Check your connection and try again. Saved quotes remain available in History and Favorites."
          actionLabel="Try again"
          onAction={() => load()}
        />
      ) : results.length === 0 ? (
        <StateView
          colors={colors}
          title="Nothing matches that search."
          message="Try a different word, author, or clear the search to browse more quotes."
          actionLabel="Clear search"
          onAction={() => setSearch('')}
        />
      ) : (
        <Animated.View
          style={{
            opacity: animation,
            transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          }}>
          <View style={styles.resultsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {search ? 'Search results' : 'A thought to consider'}
            </Text>
            <Text style={[styles.resultCount, { color: colors.muted }]}>{results.length}</Text>
          </View>
          <View style={styles.collection}>
            {results.map((quote) => (
              <DiscoveryCard
                key={quote.id}
                quote={quote}
                colors={colors}
                favorite={favorites.some((item) => item.id === quote.id)}
                onFavorite={() => updateFavorite(quote)}
                onShare={() => Share.share({ message: `“${quote.quote}” — ${quote.author}` })}
              />
            ))}
          </View>
          {!search && (
            <Button
              colors={colors}
              label="Discover more"
              loading={refreshing}
              onPress={() => load(true)}
              variant="secondary"
              style={styles.moreButton}
            />
          )}
        </Animated.View>
      )}

      {search.length === 0 && !loading && quotes.length === 0 && (
        <Button colors={colors} label="Return to today's quote" onPress={() => router.replace('/')} variant="tertiary" />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: Spacing.two, gap: Spacing.one },
  eyebrow: { ...Typography.overline },
  title: { ...Typography.display },
  subtitle: { ...Typography.body, maxWidth: 330, marginTop: Spacing.one },
  summaryLabel: { ...Typography.overline },
  summary: { ...Typography.bodyMedium, marginTop: Spacing.one },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.two },
  sectionTitle: { ...Typography.title, fontSize: 22, lineHeight: 28 },
  resultCount: { ...Typography.caption },
  collection: { gap: Spacing.four, marginTop: Spacing.three },
  card: { borderRadius: Radii.medium, gap: Spacing.three },
  mark: { fontSize: 52, lineHeight: 50, fontFamily: 'Georgia', marginBottom: Spacing.one },
  quote: { ...Typography.bodyMedium, fontSize: 21, lineHeight: 30 },
  author: { ...Typography.caption, marginTop: Spacing.four },
  details: { borderRadius: Radii.small, padding: Spacing.three, gap: Spacing.one },
  detailLabel: { ...Typography.overline },
  detailText: { ...Typography.caption },
  actions: { flexDirection: 'row', gap: Spacing.six, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three },
  action: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 44 },
  actionIcon: { fontSize: 21 },
  actionText: { ...Typography.label },
  moreButton: { marginTop: Spacing.five },
});
