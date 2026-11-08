import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radii, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import type { Quote } from '@/types/quote';

type Props = {
  quote: Quote;
  favorite: boolean;
  onFavorite: () => void;
  onShare: () => void;
  colors: ThemeColors;
  serif?: string;
};

export function QuoteCard({ quote, favorite, onFavorite, onShare, colors, serif }: Props) {
  return (
    <View
      accessibilityRole="summary"
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.mark, { color: colors.accent }]}>“</Text>
      <Text style={[styles.quote, { color: colors.text, fontFamily: serif }]}>{quote.quote}</Text>
      <Text style={[styles.author, { color: colors.muted }]}>— {quote.author}</Text>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          hitSlop={6}
          onPress={onFavorite}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={[styles.actionIcon, { color: favorite ? colors.accent : colors.muted }]}>{favorite ? '♥' : '♡'}</Text>
          <Text style={[styles.actionLabel, { color: colors.muted }]}>{favorite ? 'Saved' : 'Save'}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Share quote"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onShare}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.6 : 1 }]}>
          <Text style={[styles.actionIcon, { color: colors.muted }]}>↗</Text>
          <Text style={[styles.actionLabel, { color: colors.muted }]}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radii.large, padding: Spacing.seven, minHeight: 320, justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 2 },
  mark: { fontSize: 62, lineHeight: 60, fontFamily: 'Georgia', marginBottom: Spacing.two },
  quote: { ...Typography.quote },
  author: { ...Typography.caption, marginTop: Spacing.six, letterSpacing: 0.3 },
  actions: { flexDirection: 'row', gap: Spacing.seven, marginTop: Spacing.seven, paddingTop: Spacing.five, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E6E2D9' },
  action: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, minHeight: 44 },
  actionIcon: { fontSize: 24 },
  actionLabel: { ...Typography.label },
});
