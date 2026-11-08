import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Spacing, Typography, type ThemeColors } from '@/constants/theme';

export function SectionHeader({
  title,
  actionLabel,
  onAction,
  colors,
  style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  colors: ThemeColors;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {actionLabel && onAction && (
        <Text
          accessibilityRole="button"
          onPress={onAction}
          style={[styles.action, { color: colors.accent }]}>
          {actionLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.four },
  title: { ...Typography.title },
  action: { ...Typography.label },
});
