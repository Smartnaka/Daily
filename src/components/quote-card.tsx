import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Quote } from '@/types/quote';

type Props = {
  quote: Quote;
  favorite: boolean;
  onFavorite: () => void;
  onShare: () => void;
  colors: Record<string, string>;
  serif?: string;
};

export function QuoteCard({ quote, favorite, onFavorite, onShare, colors, serif }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.mark, { color: colors.accent }]}>“</Text>
      <Text style={[styles.quote, { color: colors.text, fontFamily: serif }]}>{quote.quote}</Text>
      <Text style={[styles.author, { color: colors.muted }]}>— {quote.author}</Text>
      <View style={styles.actions}>
        <Pressable accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'} onPress={onFavorite} style={styles.action}>
          <Text style={[styles.actionIcon, { color: favorite ? colors.accent : colors.muted }]}>{favorite ? '♥' : '♡'}</Text>
          <Text style={[styles.actionLabel, { color: colors.muted }]}>{favorite ? 'Saved' : 'Save'}</Text>
        </Pressable>
        <Pressable accessibilityLabel="Share quote" onPress={onShare} style={styles.action}>
          <Text style={[styles.actionIcon, { color: colors.muted }]}>↗</Text>
          <Text style={[styles.actionLabel, { color: colors.muted }]}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 28, padding: 26, minHeight: 310, justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 18, elevation: 2 },
  mark: { fontSize: 64, lineHeight: 62, fontFamily: 'Georgia', marginBottom: 8 },
  quote: { fontSize: 29, lineHeight: 38, letterSpacing: -0.5 },
  author: { fontSize: 14, marginTop: 24, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', gap: 24, marginTop: 28, paddingTop: 18, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E6E2D9' },
  action: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  actionIcon: { fontSize: 24 },
  actionLabel: { fontSize: 13, fontWeight: '600' },
});
