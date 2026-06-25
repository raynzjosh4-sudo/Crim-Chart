import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const Storage = {
  setItemAsync: async (key: string, value: string) => {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value);
    return SecureStore.setItemAsync(key, value);
  },
  getItemAsync: async (key: string) => {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  deleteItemAsync: async (key: string) => {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(key);
    return SecureStore.deleteItemAsync(key);
  }
};
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { NativeDB } from '@/core/db/NativeDB';

export class AuthLocalSource {
  async saveUser(user: CrimChartUserModel, accessToken?: string, refreshToken?: string) {
    // In React Native, Supabase automatically handles local token storage securely.
    // We store the active user id to match the Native C++ DB logic in your Flutter app.
    await Storage.setItemAsync('active_user_id', user.id);
    await Storage.setItemAsync(`user_data_${user.id}`, JSON.stringify(user));
    await NativeDB.upsertUser(user);
  }

  async getUser(): Promise<CrimChartUserModel | null> {
    const activeId = await Storage.getItemAsync('active_user_id');
    if (!activeId) return null;
    
    const data = await Storage.getItemAsync(`user_data_${activeId}`);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    if (parsed.birthday) parsed.birthday = new Date(parsed.birthday);
    if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
    
    return parsed as CrimChartUserModel;
  }

  async getTokens() {
    // Supabase handles tokens natively. This is a stub for the Native DB flow.
    return null;
  }

  async clearAll() {
    await Storage.deleteItemAsync('active_user_id');
  }
}
