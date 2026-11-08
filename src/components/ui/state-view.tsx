import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Spacing, Typography, type ThemeColors } from '@/constants/theme';

type StateViewProps = {
  colors: ThemeColors;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  kind?: 'loading' | 'empty' | 'error';
};

export function StateView({
  colors,
  title,
  message,
  actionLabel,
  onAction,
  kind = 'empty',
}: StateViewProps) {
  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {kind === 'loading' && <ActivityIndicator color={colors.accent} size="small" />}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {message && <Text style={[styles.message, { color: colors.muted }]}>{message}</Text>}
      {actionLabel && onAction && (
        <Button label={actionLabel} colors={colors} variant="secondary" onPress={onAction} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: Spacing.three, paddingVertical: Spacing.eight, paddingHorizontal: Spacing.six },
  title: { ...Typography.bodyMedium, textAlign: 'center' },
  message: { ...Typography.caption, textAlign: 'center', maxWidth: 300 },
});
