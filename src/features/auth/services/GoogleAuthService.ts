import { GoogleSignin } from './googleSigninShim';

export class GoogleAuthService {
  static initialized = false;

  static initialize() {
    if (this.initialized) return;
    // Replace webClientId with your actual Google Client ID if different
    GoogleSignin.configure({
      webClientId: '959127069942-l6ikv8q6umcnee9k7kj0e2s85k70j2es.apps.googleusercontent.com',
      offlineAccess: true,
    });
    this.initialized = true;
  }

  static async signIn() {
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
