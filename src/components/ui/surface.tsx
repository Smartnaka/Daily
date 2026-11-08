import { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { Elevation, Radii, Spacing, type ThemeColors } from '@/constants/theme';

type SurfaceProps = PropsWithChildren<ViewProps> & {
  colors: ThemeColors;
  elevated?: boolean;
  padding?: keyof typeof Spacing;
};

export function Surface({ children, colors, elevated = false, padding = 'six', style, ...props }: SurfaceProps) {
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          padding: Spacing[padding],
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
  base: { borderWidth: 1, borderRadius: Radii.large },
  status: { borderRadius: Radii.medium, padding: Spacing.four },
});
