import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ConnectorId } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { connectorNames } from '@/services/connectors';
import { colors, spacing, radii } from '@/theme';

const connectors: ConnectorId[] = ['trello', 'gmail', 'notion'];

const ConnectScreen = () => {
  const router = useRouter();
  const setAccount = useAppStore((state) => state.setAccount);

  const handleSelect = async (connector: ConnectorId) => {
    await setAccount(connector);
    router.replace('/map');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connect a workspace</Text>
      <Text style={styles.subtitle}>Pick a mock connector to start swiping.</Text>
      <FlatList
        data={connectors}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => handleSelect(item)}>
            <Text style={styles.cardTitle}>{connectorNames[item]}</Text>
            <Text style={styles.cardSubtitle}>Mock integration</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    gap: spacing.lg,
    backgroundColor: colors.background
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
  list: {
    gap: spacing.md
  },
  card: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text
  },
  cardSubtitle: {
    marginTop: spacing.xs,
    color: colors.muted
  }
});

export default ConnectScreen;
