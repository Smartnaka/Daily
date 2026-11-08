import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Surface } from '@/components/ui/surface';
import { Radii, Spacing, Typography, type ThemeColors } from '@/constants/theme';
import { useDailyTheme } from '@/hooks/use-daily-theme';
import { clearQuoteHistory, type ThemePreference } from '@/storage/quoteStorage';

function Row({ colors, label, description, children }: { colors: ThemeColors; label: string; description?: string; children: React.ReactNode }) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <View style={styles.copy}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {description && <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>}
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useDailyTheme();
  const router = useRouter();

  const confirmClearHistory = () => Alert.alert('Clear history?', 'Your favorites will be kept.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Clear history', style: 'destructive', onPress: () => clearQuoteHistory().catch((error) => __DEV__ && console.warn('Could not clear history', error)) },
  ]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button">
          <Text style={[styles.back, { color: colors.accent }]}>‹ Back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={styles.headerSpace} />
      </View>

      <Section colors={colors} title="Appearance">
        <View style={styles.themeControl}>
          <Text style={[styles.label, { color: colors.text }]}>Theme</Text>
          <View style={[styles.themeOptions, { borderColor: colors.border }]}>
            {(['system', 'light', 'dark'] as ThemePreference[]).map((option) => (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: preference === option }}
                onPress={() => setPreference(option)}
                style={[styles.themeOption, preference === option && { backgroundColor: colors.backgroundSelected }]}>
                <Text style={[styles.optionText, { color: preference === option ? colors.accent : colors.muted }]}>{option[0].toUpperCase() + option.slice(1)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Section>

      <Section colors={colors} title="Data">
        <Row colors={colors} label="Saved quotes" description="Review the quotes you have kept.">
          <Pressable onPress={() => router.replace('/saved')} accessibilityRole="button"><Text style={[styles.action, { color: colors.accent }]}>Open</Text></Pressable>
        </Row>
        <Row colors={colors} label="Clear history" description="Remove history while keeping favorites.">
          <Pressable onPress={confirmClearHistory} accessibilityRole="button"><Text style={[styles.action, { color: colors.danger }]}>Clear</Text></Pressable>
        </Row>
      </Section>

      <Section colors={colors} title="About">
        <Row colors={colors} label="Version" description="A quiet daily reading ritual.">
          <Text style={[styles.value, { color: colors.muted }]}>{Constants.expoConfig?.version ?? '1.0.0'}</Text>
        </Row>
        <Text style={[styles.about, { color: colors.muted }]}>Quotes are provided by DummyJSON. Your saved quotes stay on this device.</Text>
      </Section>
    </Screen>
  );
}

function Section({ colors, title, children }: { colors: ThemeColors; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>{title.toUpperCase()}</Text>
      <Surface colors={colors} padding="none" style={styles.surface}>{children}</Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.two },
  back: { ...Typography.label },
  headerSpace: { width: 52 },
  title: { ...Typography.title },
  section: { gap: Spacing.two },
  sectionTitle: { ...Typography.overline, marginLeft: Spacing.two },
  surface: { borderRadius: Radii.medium, overflow: 'hidden' },
  row: { minHeight: 68, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth },
  copy: { flex: 1, gap: Spacing.one },
  label: { ...Typography.bodyMedium },
  description: { ...Typography.caption },
  action: { ...Typography.label },
  value: { ...Typography.label },
  themeControl: { padding: Spacing.four, gap: Spacing.three },
  themeOptions: { flexDirection: 'row', borderWidth: 1, borderRadius: Radii.small, padding: Spacing.one, gap: Spacing.one },
  themeOption: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.small },
  optionText: { ...Typography.label },
  about: { ...Typography.caption, padding: Spacing.four },
});
