import { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Radii, Spacing, type ThemeColors } from '@/constants/theme';

export function Sheet({
  visible,
  onClose,
  colors,
  children,
}: PropsWithChildren<{ visible: boolean; onClose: () => void; colors: ThemeColors }>) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable accessibilityLabel="Close" accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: '#00000066' },
  content: { borderTopLeftRadius: Radii.large, borderTopRightRadius: Radii.large, padding: Spacing.six, paddingBottom: Spacing.nine, gap: Spacing.four },
  handle: { alignSelf: 'center', width: 36, height: 4, borderRadius: Radii.pill, marginBottom: Spacing.two },
});
