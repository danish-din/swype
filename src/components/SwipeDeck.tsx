import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Item } from '@/types';
import Card from './Card';
import { colors, radii, spacing } from '@/theme';

const SWIPE_THRESHOLD = 120;

const AnimatedView = Animated.createAnimatedComponent(View);

interface SwipeDeckProps {
  items: Item[];
  onSwipe: (direction: 'left' | 'right') => void;
  renderCard?: (item: Item) => React.ReactNode;
  leftLabel: string;
  rightLabel: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  items,
  onSwipe,
  renderCard,
  leftLabel,
  rightLabel,
  onLeftPress,
  onRightPress
}) => {
  const topItem = items[0];
  const nextItem = items[1];

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);


  React.useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [topItem, translateX, translateY]);
  const resetPosition = () => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  const completeSwipe = (direction: 'left' | 'right') => {
    runOnJS(onSwipe)(direction);
    translateX.value = 0;
    translateY.value = 0;
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: { startX: number; startY: number }) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: (event) => {
      const velocityX = event.velocityX;
      const shouldSwipeLeft = translateX.value < -SWIPE_THRESHOLD || velocityX < -600;
      const shouldSwipeRight = translateX.value > SWIPE_THRESHOLD || velocityX > 600;

      if (shouldSwipeLeft) {
        translateX.value = withTiming(-400, { duration: 200 }, () => {
          completeSwipe('left');
        });
        translateY.value = withTiming(translateY.value, { duration: 200 });
        return;
      }

      if (shouldSwipeRight) {
        translateX.value = withTiming(400, { duration: 200 }, () => {
          completeSwipe('right');
        });
        translateY.value = withTiming(translateY.value, { duration: 200 });
        return;
      }

      resetPosition();
    }
  });

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = `${translateX.value / 20}deg`;
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate }
      ]
    };
  });

  const leftOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.min(1, Math.max(0, -translateX.value / SWIPE_THRESHOLD))
    };
  });

  const rightOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: Math.min(1, Math.max(0, translateX.value / SWIPE_THRESHOLD))
    };
  });

  const renderTopCard = useMemo(() => {
    if (!topItem) return null;
    return renderCard ? renderCard(topItem) : <Card item={topItem} />;
  }, [topItem, renderCard]);

  const renderNextCard = useMemo(() => {
    if (!nextItem) return null;
    return renderCard ? renderCard(nextItem) : <Card item={nextItem} />;
  }, [nextItem, renderCard]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.deckArea}>
        {nextItem ? (
          <AnimatedView style={[styles.card, styles.nextCard]}>{renderNextCard}</AnimatedView>
        ) : null}
        {topItem ? (
          <PanGestureHandler onGestureEvent={gestureHandler}>
            <AnimatedView style={[styles.card, animatedCardStyle]}>
              {renderTopCard}
              <Animated.View style={[styles.overlay, styles.leftOverlay, leftOverlayStyle]}>
                <Text style={styles.overlayText}>{leftLabel}</Text>
              </Animated.View>
              <Animated.View style={[styles.overlay, styles.rightOverlay, rightOverlayStyle]}>
                <Text style={styles.overlayText}>{rightLabel}</Text>
              </Animated.View>
            </AnimatedView>
          </PanGestureHandler>
        ) : (
          <View style={[styles.card, styles.emptyCard]}>
            <Text style={styles.emptyText}>No more items</Text>
          </View>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Swipe left (${leftLabel})`}
          onPress={onLeftPress}
          style={[styles.actionButton, styles.leftButton]}
        >
          <Text style={styles.buttonText}>Left</Text>
          <Text style={styles.buttonHint}>{leftLabel}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Swipe right (${rightLabel})`}
          onPress={onRightPress}
          style={[styles.actionButton, styles.rightButton]}
        >
          <Text style={styles.buttonText}>Right</Text>
          <Text style={styles.buttonHint}>{rightLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    gap: spacing.lg
  },
  deckArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: '100%',
    maxWidth: 360,
    position: 'absolute'
  },
  nextCard: {
    transform: [{ scale: 0.95 }, { translateY: 16 }],
    opacity: 0.6
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: colors.muted,
    fontSize: 16
  },
  overlay: {
    position: 'absolute',
    top: spacing.lg,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 2
  },
  leftOverlay: {
    left: spacing.lg,
    borderColor: colors.danger
  },
  rightOverlay: {
    right: spacing.lg,
    borderColor: colors.success
  },
  overlayText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.muted
  },
  leftButton: {
    backgroundColor: '#fee2e2'
  },
  rightButton: {
    backgroundColor: '#dcfce7'
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: colors.text
  },
  buttonHint: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4
  }
});

export default SwipeDeck;
