import { Platform } from 'react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import { GoogleSignin } from './googleSigninShim';

export class GoogleAuthService {
  static initialized = false;

  static initialize() {
    if (this.initialized) return;
    if (Platform.OS === 'web') return; // Skip configure on web
    // Initialize with environment variable for credentials
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'your-client-id.apps.googleusercontent.com',
      offlineAccess: true,
    });
    this.initialized = true;
  }

  static async signIn() {
    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      // On Web, this will redirect the browser. Return a never-resolving promise.
      return new Promise<{ idToken: string; accessToken: string }>(() => {});
    }

    this.initialize();

    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data?.idToken) {
      throw new Error('No ID token present!');
    }

    return {
      idToken: userInfo.data.idToken,
      accessToken: '', // Not strictly needed for Supabase if idToken is present
    };
  }

  static async signOut() {
    if (Platform.OS === 'web') return;
    try {
      await GoogleSignin.revokeAccess();
    } catch (e) {
      // Ignore revoke errors (might already be revoked)
    }
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore sign out errors
    }
  }
}
