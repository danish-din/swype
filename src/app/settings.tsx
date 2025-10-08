import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { describeConnectorAction } from '@/services/connectors';
import { colors, spacing, radii } from '@/theme';

const SettingsScreen = () => {
  const router = useRouter();
  const account = useAppStore((state) => state.account);
  const swipeMap = useAppStore((state) => state.swipeMap);
  const clearCache = useAppStore((state) => state.clearCache);
  const hapticsEnabled = useAppStore((state) => state.hapticsEnabled);
  const setHaptics = useAppStore((state) => state.setHaptics);

  if (!account) {
    router.replace('/connect');
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Swipe mappings</Text>
        <View style={styles.mappingRow}>
          <Text style={styles.mappingLabel}>Left</Text>
          <Text style={styles.mappingValue}>
            {describeConnectorAction(account.connector, swipeMap.left)}
          </Text>
        </View>
        <View style={styles.mappingRow}>
          <Text style={styles.mappingLabel}>Right</Text>
          <Text style={styles.mappingValue}>
            {describeConnectorAction(account.connector, swipeMap.right)}
          </Text>
        </View>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/map')}>
          <Text style={styles.primaryText}>Change mappings</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Haptics</Text>
        <View style={styles.mappingRow}>
          <Text style={styles.mappingLabel}>Enable haptic feedback</Text>
          <Switch value={hapticsEnabled} onValueChange={(value) => setHaptics(value)} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage</Text>
        <Pressable style={styles.secondaryButton} onPress={() => clearCache()}>
          <Text style={styles.secondaryText}>Clear undo history</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.xl,
    gap: spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  backText: {
    color: colors.text
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  mappingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mappingLabel: {
    color: colors.muted,
    fontSize: 14
  },
  mappingValue: {
    color: colors.text,
    fontWeight: '600'
  },
  primaryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center'
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600'
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.danger,
    paddingVertical: spacing.sm,
    alignItems: 'center'
  },
  secondaryText: {
    color: colors.danger,
    fontWeight: '600'
  }
});

export default SettingsScreen;
