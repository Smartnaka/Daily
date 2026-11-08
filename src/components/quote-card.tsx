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
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.quote, { color: colors.text, fontFamily: serif }]}>{quote.quote}</Text>
      <Text style={[styles.author, { color: colors.muted }]}>— {quote.author}</Text>
      <View style={[styles.actions, { borderTopColor: colors.border }]}>
        <Pressable
          accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityRole="button"
          accessibilityState={{ selected: favorite }}
          hitSlop={8}
          onPress={onFavorite}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.5 : 1 }]}>
          <Text style={[styles.actionText, { color: favorite ? colors.accent : colors.text }]}>
            {favorite ? '♥  Saved' : '♡  Save'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Share quote"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onShare}
          style={({ pressed }) => [styles.action, { opacity: pressed ? 0.5 : 1 }]}>
          <Text style={[styles.actionText, { color: colors.accent }]}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radii.medium, padding: Spacing.five },
  quote: { ...Typography.quote },
  author: { ...Typography.body, marginTop: Spacing.five },
  actions: { flexDirection: 'row', gap: Spacing.six, marginTop: Spacing.six, paddingTop: Spacing.three, borderTopWidth: StyleSheet.hairlineWidth },
  action: { minHeight: 44, justifyContent: 'center' },
  actionText: { ...Typography.label },
});
