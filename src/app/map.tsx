import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { connectorActions, describeConnectorAction } from '@/services/connectors';
import { ActionConfig } from '@/types';
import { colors, spacing, radii } from '@/theme';

const MapScreen = () => {
  const router = useRouter();
  const account = useAppStore((state) => state.account);
  const swipeMap = useAppStore((state) => state.swipeMap);
  const setSwipeMap = useAppStore((state) => state.setSwipeMap);

  const actions = useMemo(() => {
    if (!account) return [];
    return connectorActions[account.connector]();
  }, [account]);

  if (!account) {
    router.replace('/connect');
    return null;
  }

  const handleSelect = (direction: 'left' | 'right', action: ActionConfig) => {
    void setSwipeMap({ [direction]: action });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Configure your swipes</Text>
      <Text style={styles.subtitle}>
        Map each direction to what should happen inside {account.connector.toUpperCase()}.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Left swipe</Text>
        <View style={styles.grid}>
          {actions.map((action) => {
            const isActive = JSON.stringify(action) === JSON.stringify(swipeMap.left);
            return (
              <Pressable
                key={`${action.type}-${action.label ?? ''}-${Object.values(action.params ?? {}).join('-')}`}
                style={[styles.actionCard, isActive && styles.actionCardActive]}
                onPress={() => handleSelect('left', action)}
              >
                <Text style={styles.cardTitle}>{action.label ?? action.type}</Text>
                <Text style={styles.cardDescription}>
                  {describeConnectorAction(account.connector, action)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Right swipe</Text>
        <View style={styles.grid}>
          {actions.map((action) => {
            const isActive = JSON.stringify(action) === JSON.stringify(swipeMap.right);
            return (
              <Pressable
                key={`right-${action.type}-${action.label ?? ''}-${Object.values(action.params ?? {}).join('-')}`}
                style={[styles.actionCard, isActive && styles.actionCardActive]}
                onPress={() => handleSelect('right', action)}
              >
                <Text style={styles.cardTitle}>{action.label ?? action.type}</Text>
                <Text style={styles.cardDescription}>
                  {describeConnectorAction(account.connector, action)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={() => router.replace('/deck')}>
        <Text style={styles.primaryText}>Start swiping</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted
  },
  section: {
    gap: spacing.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  grid: {
    gap: spacing.md
  },
  actionCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  actionCardActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text
  },
  cardDescription: {
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 14
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center'
  },
  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});

export default MapScreen;
