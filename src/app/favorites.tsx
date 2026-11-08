import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Share, StyleSheet, Text } from 'react-native';

import { QuoteListItem } from '@/components/quote-list-item';
import { Screen } from '@/components/screen';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { getFavoriteQuotes, toggleFavorite } from '@/storage/quoteStorage';
import type { Quote } from '@/types/quote';

export default function FavoritesScreen() {
  const { colors, fonts } = useDailyTheme();
  const [favorites, setFavorites] = useState<Quote[]>([]);
  const load = useCallback(() => { getFavoriteQuotes().then(setFavorites); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return <Screen><Text style={[styles.title, { color: colors.text }]}>Favorites</Text><Text style={[styles.subtitle, { color: colors.muted }]}>The words you chose to keep close.</Text>{favorites.length ? favorites.map((quote) => <QuoteListItem key={quote.id} quote={quote} favorite onFavorite={async () => { await toggleFavorite(quote); load(); }} onShare={() => Share.share({ message: `“${quote.quote}” — ${quote.author}` })} colors={colors} serif={fonts?.serif} />) : <Text style={[styles.empty, { color: colors.muted }]}>Save a quote from Today or History and it will live here.</Text>}</Screen>;
}
const styles = StyleSheet.create({ title: { fontSize: 34, fontWeight: '700', marginTop: 12 }, subtitle: { fontSize: 14, marginBottom: 8 }, empty: { textAlign: 'center', marginTop: 80, lineHeight: 22 } });
