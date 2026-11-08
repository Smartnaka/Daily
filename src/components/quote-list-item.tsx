import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Quote } from '@/types/quote';
import { formatDate } from '@/utils/dates';

export function QuoteListItem({ quote, favorite, onFavorite, onShare, colors, serif }: {
  quote: Quote; favorite: boolean; onFavorite: () => void; onShare?: () => void; colors: Record<string, string>; serif?: string;
}) {
  return (
    <View style={[styles.item, { borderBottomColor: colors.border }]}>
      <Text style={[styles.quote, { color: colors.text, fontFamily: serif }]}>“{quote.quote}”</Text>
      <Text style={[styles.author, { color: colors.muted }]}>— {quote.author} · {formatDate(quote.fetchedAt, { month: 'short', day: 'numeric' })}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onFavorite}><Text style={[styles.button, { color: favorite ? colors.accent : colors.muted }]}>{favorite ? '♥ Saved' : '♡ Save'}</Text></Pressable>
        {onShare && <Pressable onPress={onShare}><Text style={[styles.button, { color: colors.muted }]}>Share ↗</Text></Pressable>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { paddingVertical: 18, borderBottomWidth: StyleSheet.hairlineWidth },
  quote: { fontSize: 18, lineHeight: 27 },
  author: { fontSize: 12, marginTop: 10 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 12 },
  button: { fontSize: 13, fontWeight: '600' },
});
