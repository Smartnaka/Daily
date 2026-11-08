import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StateView } from '@/components/ui/state-view';
import { Fonts, Radii, Spacing, Typography } from '@/constants/theme';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { clearQuoteHistory, getFavoriteQuotes, getQuoteHistory, toggleFavorite } from '@/storage/quoteStorage';
import type { Quote } from '@/types/quote';
import { formatDate } from '@/utils/dates';

type Mode = 'favorites' | 'history';

export default function SavedScreen() {
  const { colors } = useDailyTheme();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('favorites');
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const [history, setHistory] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [saved, archive] = await Promise.all([getFavoriteQuotes(), getQuoteHistory()]);
      setFavorites(saved);
      setHistory(archive);
    } catch (caught) {
      if (__DEV__) console.warn('Could not load saved quotes', caught);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const removeFavorite = async (quote: Quote) => {
    try {
      await toggleFavorite(quote);
      setFavorites((current) => current.filter((item) => item.id !== quote.id));
    } catch (caught) {
      if (__DEV__) console.warn('Could not remove favorite quote', caught);
    }
  };

  const clearHistory = () => Alert.alert('Clear history?', 'Your favorites will be kept.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear history', style: 'destructive', onPress: async () => {
      try { await clearQuoteHistory(); setHistory([]); } catch (caught) { if (__DEV__) console.warn('Could not clear history', caught); }
    } },
  ]);

  const items = mode === 'favorites' ? favorites : history;

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Saved</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>Thoughts worth returning to.</Text>
        </View>
        <Pressable accessibilityLabel="Open settings" accessibilityRole="button" onPress={() => router.push('/settings')} hitSlop={10}>
          <Text style={[styles.settings, { color: colors.muted }]}>Settings</Text>
        </Pressable>
      </View>
      <View style={[styles.switcher, { borderColor: colors.border }]}>
        {(['favorites', 'history'] as Mode[]).map((option) => (
          <Pressable key={option} accessibilityRole="tab" accessibilityState={{ selected: mode === option }} onPress={() => setMode(option)} style={[styles.tab, mode === option && { backgroundColor: colors.backgroundSelected }]}>
            <Text style={[styles.tabText, { color: mode === option ? colors.accent : colors.muted }]}>{option === 'favorites' ? 'Favorites' : 'History'}</Text>
          </Pressable>
        ))}
      </View>
      {mode === 'history' && history.length > 0 && <Pressable onPress={clearHistory} accessibilityRole="button"><Text style={[styles.clear, { color: colors.danger }]}>Clear history</Text></Pressable>}
      {loading ? <StateView colors={colors} kind="loading" title="Opening your saved quotes…" /> :
        error ? <StateView colors={colors} kind="error" title="Saved quotes are unavailable." actionLabel="Try again" onAction={load} /> :
        items.length === 0 ? <StateView colors={colors} title={mode === 'favorites' ? 'Save a quote to keep it close.' : 'Your reading history is empty.'} message={mode === 'favorites' ? 'Use Save on Today or Explore to build your collection.' : 'Quotes you receive will appear here.'} actionLabel="Read today’s quote" onAction={() => router.replace('/')} /> :
        <View style={styles.list}>{items.map((quote) => (
          <View key={`${quote.id}-${quote.fetchedAt}`} style={[styles.item, { borderBottomColor: colors.border }]}>
            <Text style={[styles.quote, { color: colors.text, fontFamily: Fonts?.serif }]}>{quote.quote}</Text>
            <Text style={[styles.author, { color: colors.muted }]}>— {quote.author}</Text>
            <View style={styles.actions}>
              <Text style={[styles.date, { color: colors.muted }]}>{formatDate(quote.fetchedAt, { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
              <Pressable onPress={() => Share.share({ message: `“${quote.quote}” — ${quote.author}` })} accessibilityRole="button"><Text style={[styles.action, { color: colors.accent }]}>Share</Text></Pressable>
              {mode === 'favorites' && <Pressable onPress={() => removeFavorite(quote)} accessibilityRole="button"><Text style={[styles.action, { color: colors.terracotta }]}>Remove</Text></Pressable>}
            </View>
          </View>
        ))}</View>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: Spacing.two },
  title: { ...Typography.display },
  subtitle: { ...Typography.body, marginTop: Spacing.one },
  settings: { ...Typography.caption, paddingTop: Spacing.two },
  switcher: { flexDirection: 'row', borderWidth: StyleSheet.hairlineWidth, borderRadius: Radii.small, padding: Spacing.one },
  tab: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.small },
  tabText: { ...Typography.label },
  clear: { ...Typography.label, alignSelf: 'flex-end' },
  list: { gap: Spacing.five },
  item: { paddingBottom: Spacing.five, borderBottomWidth: StyleSheet.hairlineWidth, gap: Spacing.two },
  quote: { ...Typography.quote, fontSize: 20 },
  author: { ...Typography.caption },
  actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four, marginTop: Spacing.one },
  date: { ...Typography.caption, flex: 1 },
  action: { ...Typography.label },
});
