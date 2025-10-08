import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T>(key: string): Promise<T | undefined> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return undefined;
      return JSON.parse(raw) as T;
    } catch (error) {
      console.warn('Failed to read storage', error);
      return undefined;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('Failed to write storage', error);
    }
  },
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove storage', error);
    }
  }
};
