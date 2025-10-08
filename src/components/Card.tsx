import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Item } from '@/types';
import { colors, spacing, radii, shadows } from '@/theme';

interface CardProps {
  item: Item;
}

export const Card: React.FC<CardProps> = ({ item }) => {
  return (
    <View style={styles.container} accessibilityLabel={`Card ${item.title}`}>
      {item.thumbnailUrl ? (
        <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        {item.preview ? <Text style={styles.preview}>{item.preview}</Text> : null}
        {item.meta ? (
          <Text style={styles.meta}>{Object.values(item.meta).join(' • ')}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: radii.md,
    backgroundColor: '#d1d5db'
  },
  content: {
    gap: spacing.sm
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text
  },
  preview: {
    fontSize: 14,
    color: colors.muted
  },
  meta: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: colors.muted
  }
});

export default Card;
