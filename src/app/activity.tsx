import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing, radii } from '@/theme';

const statusColors: Record<'pending' | 'success' | 'failed', string> = {
  pending: colors.primary,
  success: colors.success,
  failed: colors.danger
};

const ActivityScreen = () => {
  const router = useRouter();
  const operations = useAppStore((state) => state.queue);
  const retry = useAppStore((state) => state.retry);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Activity</Text>
      </View>
      <FlatList
        data={operations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>{item.item.title}</Text>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}
              >
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.meta}>Direction: {item.direction.toUpperCase()}</Text>
            <Text style={styles.meta}>Action: {item.action.type}</Text>
            {item.error ? <Text style={styles.error}>{item.error}</Text> : null}
            {item.status === 'failed' ? (
              <Pressable style={styles.retryButton} onPress={() => retry(item.id)}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            ) : null}
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No operations yet.</Text>
          </View>
        )}
      />
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
  list: {
    gap: spacing.md,
    paddingTop: spacing.md
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemTitle: {
    fontWeight: '600',
    color: colors.text
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  meta: {
    color: colors.muted,
    fontSize: 12
  },
  error: {
    color: colors.danger,
    fontSize: 12
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    backgroundColor: colors.primary
  },
  retryText: {
    color: '#fff',
    fontWeight: '600'
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.muted
  }
});

export default ActivityScreen;
