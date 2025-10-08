import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import SwipeDeck from '@/components/SwipeDeck';
import { useAppStore } from '@/store/useAppStore';
import { colors, spacing, radii } from '@/theme';
import { describeConnectorAction } from '@/services/connectors';

const DeckScreen = () => {
  const router = useRouter();
  const account = useAppStore((state) => state.account);
  const deck = useAppStore((state) => state.deck);
  const loadPage = useAppStore((state) => state.loadPage);
  const swipe = useAppStore((state) => state.swipe);
  const undo = useAppStore((state) => state.undo);
  const swipeMap = useAppStore((state) => state.swipeMap);
  const hasMore = useAppStore((state) => state.hasMore);
  const loading = useAppStore((state) => state.loading);
  const hapticsEnabled = useAppStore((state) => state.hapticsEnabled);

  useFocusEffect(
    useCallback(() => {
      if (!account) {
        router.replace('/connect');
        return () => {};
      }
      if (!deck.length) {
        loadPage().catch(() => undefined);
      }
      return () => {};
    }, [account, deck.length, loadPage, router])
  );

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (hapticsEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await swipe(direction);
  };

  const leftLabel = useMemo(() => {
    if (!account) return 'Left';
    return describeConnectorAction(account.connector, swipeMap.left);
  }, [account, swipeMap.left]);

  const rightLabel = useMemo(() => {
    if (!account) return 'Right';
    return describeConnectorAction(account.connector, swipeMap.right);
  }, [account, swipeMap.right]);

  if (!account) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>SwipeFlow</Text>
          <Text style={styles.subtitle}>Connected to {account.connector.toUpperCase()}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={() => router.push('/activity')}>
            <Text style={styles.headerButtonText}>Activity</Text>
          </Pressable>
          <Pressable style={styles.headerButton} onPress={() => router.push('/settings')}>
            <Text style={styles.headerButtonText}>Settings</Text>
          </Pressable>
        </View>
      </View>

      <SwipeDeck
        items={deck}
        onSwipe={handleSwipe}
        leftLabel={leftLabel}
        rightLabel={rightLabel}
        onLeftPress={() => handleSwipe('left')}
        onRightPress={() => handleSwipe('right')}
      />

      <View style={styles.footer}>
        <Pressable style={styles.undoButton} onPress={() => undo()}>
          <Text style={styles.undoText}>Undo</Text>
        </Pressable>
        {loading ? <ActivityIndicator color={colors.primary} /> : null}
        {!loading && !deck.length && hasMore ? (
          <Pressable style={styles.loadMore} onPress={() => loadPage()}>
            <Text style={styles.loadMoreText}>Load more</Text>
          </Pressable>
        ) : null}
        {!hasMore && !deck.length ? (
          <Text style={styles.endText}>You reached the end of the queue.</Text>
        ) : null}
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
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    color: colors.muted,
    marginTop: spacing.xs
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm
  },
  headerButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  headerButtonText: {
    color: colors.text,
    fontWeight: '600'
  },
  footer: {
    gap: spacing.sm
  },
  undoButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary
  },
  undoText: {
    color: colors.primary,
    fontWeight: '600'
  },
  loadMore: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  loadMoreText: {
    color: colors.text
  },
  endText: {
    color: colors.muted
  }
});

export default DeckScreen;
