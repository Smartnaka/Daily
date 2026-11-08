import { StyleSheet, View, type ViewProps } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export function Divider({ colors, inset = false, ...props }: ViewProps & { colors: ThemeColors; inset?: boolean }) {
  return <View style={[styles.line, { backgroundColor: colors.border }, inset && styles.inset]} {...props} />;
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, width: '100%' },
  inset: { marginHorizontal: 16 },
});
