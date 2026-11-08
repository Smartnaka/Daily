import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Share, StyleSheet, Text } from 'react-native';

import { QuoteListItem } from '@/components/quote-list-item';
import { Screen } from '@/components/screen';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { getFavoriteQuotes, getQuoteHistory, toggleFavorite } from '@/storage/quoteStorage';
import type { Quote } from '@/types/quote';

export default function HistoryScreen() {
  const { colors, fonts } = useDailyTheme();
  const [history, setHistory] = useState<Quote[]>([]);
  const [favorites, setFavorites] = useState<Quote[]>([]);
  useFocusEffect(useCallback(() => { Promise.all([getQuoteHistory(), getFavoriteQuotes()]).then(([h, f]) => { setHistory(h); setFavorites(f); }); }, []));
  return <Screen><Text style={[styles.title, { color: colors.text }]}>History</Text><Text style={[styles.subtitle, { color: colors.muted }]}>Your archive of small, useful thoughts.</Text>{history.length ? history.map((quote) => <QuoteListItem key={`${quote.id}-${quote.fetchedAt}`} quote={quote} favorite={favorites.some((item) => item.id === quote.id)} onFavorite={async () => { await toggleFavorite(quote); setFavorites(await getFavoriteQuotes()); }} onShare={() => Share.share({ message: `“${quote.quote}” — ${quote.author}` })} colors={colors} serif={fonts?.serif} />) : <Text style={[styles.empty, { color: colors.muted }]}>Your quote history will appear here after your first sync.</Text>}</Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 34, fontWeight: '700', marginTop: 12 }, subtitle: { fontSize: 14, marginBottom: 8 }, empty: { textAlign: 'center', marginTop: 80, lineHeight: 22 } });
