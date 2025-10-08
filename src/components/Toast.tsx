import React from 'react';
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useToastStore } from '@/store/useToastStore';
import { colors, radii, spacing } from '@/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

export const Toast: React.FC = () => {
  const { visible, message, actionLabel, onAction } = useToastStore();
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
  }, [visible, opacity]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: withTiming(visible ? 0 : 10, { duration: 200 }) }]
  }));

  if (!message) return null;

  return (
    <AnimatedView pointerEvents={visible ? 'auto' : 'none'} style={[styles.toast, containerStyle]}>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.actionButton} accessibilityRole="button">
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: Platform.select({ ios: 80, android: 40, default: 24 }),
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  message: {
    flex: 1,
    color: colors.text,
    fontSize: 14
  },
  actionButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: colors.primary
  },
  actionText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default Toast;
