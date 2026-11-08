import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Radii, Spacing, Typography, type ThemeColors } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  colors: ThemeColors;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  colors,
  variant = 'primary',
  loading = false,
  icon,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const textColor = isPrimary ? colors.surface : colors.accent;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: disabled || loading }}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isPrimary ? colors.accent : isSecondary ? colors.surface : 'transparent',
          borderColor: isPrimary ? colors.accent : colors.border,
          opacity: pressed || disabled ? 0.72 : 1,
        },
        variant === 'tertiary' && styles.tertiary,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>
          {icon ? `${icon} ` : ''}
          {label}
        </Text>
      )}
    </Pressable>
  );
}

export function IconButton({
  accessibilityLabel,
  children,
  colors,
  style,
  ...props
}: Omit<PressableProps, 'children' | 'style'> & {
  accessibilityLabel: string;
  children: string;
  colors: ThemeColors;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [styles.icon, { borderColor: colors.border, opacity: pressed ? 0.6 : 1 }, style]}
      {...props}>
      <Text style={[styles.iconText, { color: colors.text }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.six,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiary: { borderWidth: 0, paddingHorizontal: Spacing.two },
  label: { ...Typography.label },
  icon: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 21, lineHeight: 24 },
});
