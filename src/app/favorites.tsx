import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Animated, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StateView } from '@/components/ui/state-view';
import { Surface } from '@/components/ui/surface';
import { Fonts, Radii, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { getFavoriteQuotes, toggleFavorite } from '@/storage/quoteStorage';
import type { Quote } from '@/types/quote';
import { formatDate } from '@/utils/dates';

function FavoriteCard({
  quote,
  colors,
  onRemove,
  onShare,
}: {
  quote: Quote;
  colors: ThemeColors;
  onRemove: () => void;
  onShare: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));

  const pressIn = () => {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Surface colors={colors} padding="five" style={styles.card}>
        <Pressable
          accessibilityHint="Double tap to show or hide quote details"
          accessibilityLabel={`Favorite quote by ${quote.author}`}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((current) => !current)}
          onPressIn={pressIn}
          onPressOut={pressOut}>
          <Text style={[styles.mark, { color: colors.accent }]}>“</Text>
          <Text style={[styles.quote, { color: colors.text, fontFamily: Fonts?.serif }]}>{quote.quote}</Text>
          <Text style={[styles.author, { color: colors.muted }]}>— {quote.author}</Text>
        </Pressable>

        {expanded && (
          <View style={[styles.details, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.detailLabel, { color: colors.accent }]}>SAVED QUOTE</Text>
            <Text style={[styles.detailText, { color: colors.muted }]}>
              Added {formatDate(quote.fetchedAt, { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
        )}

        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <Pressable
            accessibilityLabel="Remove quote from favorites"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onRemove}
            style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[styles.actionIcon, { color: colors.accent }]}>♥</Text>
            <Text style={[styles.actionText, { color: colors.text }]}>Saved</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Share favorite quote"
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

export default function FavoritesScreen() {
  const { colors } = useDailyTheme();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [animation] = useState(() => new Animated.Value(0));

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const savedQuotes = await getFavoriteQuotes();
      setFavorites(savedQuotes);
      Animated.timing(animation, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    } catch (loadError) {
      if (__DEV__) console.warn('Could not load favorite quotes', loadError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [animation]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const removeFavorite = useCallback(async (quote: Quote) => {
    setFavorites((current) => current.filter((item) => item.id !== quote.id));
    try {
      await toggleFavorite(quote);
    } catch (removeError) {
      if (__DEV__) console.warn('Could not remove favorite quote', removeError);
      setFavorites((current) => [quote, ...current]);
    }
  }, []);

  const shareQuote = useCallback(async (quote: Quote) => {
    try {
      await Share.share({ message: `“${quote.quote}” — ${quote.author}` });
    } catch (shareError) {
      if (__DEV__) console.warn('Could not share favorite quote', shareError);
    }
  }, []);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          The words you chose to carry with you.
        </Text>
      </View>

      {loading ? (
        <StateView colors={colors} kind="loading" title="Opening your collection…" />
      ) : error ? (
        <StateView
          colors={colors}
          kind="error"
          title="Favorites are unavailable right now."
          message="Your saved quotes are still safe. Try opening this page again."
          actionLabel="Try again"
          onAction={load}
        />
      ) : favorites.length === 0 ? (
        <StateView
          colors={colors}
          title="Keep a thought close."
          message="Save a quote from Today or History and it will appear here whenever you need a little encouragement."
          actionLabel="Discover today's quote"
          onAction={() => router.replace('/')}
        />
      ) : (
        <Animated.View
          style={{
            opacity: animation,
            transform: [{ translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          }}>
          <View style={styles.collection}>
            {favorites.map((quote) => (
              <FavoriteCard
                key={quote.id}
                quote={quote}
                colors={colors}
                onRemove={() => removeFavorite(quote)}
                onShare={() => shareQuote(quote)}
              />
            ))}
          </View>
        </Animated.View>
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
  collection: { gap: Spacing.four },
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
});
