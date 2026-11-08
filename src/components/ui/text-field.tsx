import { StyleSheet, Text, TextInput, type TextInputProps } from 'react-native';

import { Radii, Spacing, Typography, type ThemeColors } from '@/constants/theme';

export function TextField({
  label,
  colors,
  error,
  ...props
}: TextInputProps & { label?: string; colors: ThemeColors; error?: string }) {
  return (
    <>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[styles.input, { backgroundColor: colors.surface, borderColor: error ? colors.danger : colors.border, color: colors.text }]}
        {...props}
      />
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </>
  );
}

const styles = StyleSheet.create({
  label: { ...Typography.label, marginBottom: Spacing.two },
  input: { minHeight: 48, borderWidth: 1, borderRadius: Radii.medium, paddingHorizontal: Spacing.four, ...Typography.body },
  error: { ...Typography.caption, marginTop: Spacing.one },
});
