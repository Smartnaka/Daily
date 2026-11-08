import { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Elevation, Radii, Spacing, type ThemeColors } from '@/constants/theme';

type SurfaceProps = PropsWithChildren<ViewProps> & {
  colors: ThemeColors;
  elevated?: boolean;
  padding?: keyof typeof Spacing | 'none';
};

export function Surface({ children, colors, elevated = false, padding = 'six', style, ...props }: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: padding === 'none' ? 0 : Spacing[padding],
        },
        elevated && Elevation.subtle,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

export function StatusSurface({ children, colors, ...props }: PropsWithChildren<{ colors: ThemeColors }>) {
  return (
    <View style={[styles.status, { backgroundColor: colors.accentSoft }]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radii.medium },
  status: { borderRadius: 0, paddingVertical: Spacing.three, paddingHorizontal: 0 },
});
