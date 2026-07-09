import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { authRepository } from '../data/repositories/AuthRepository';
import { LoginParams, SignUpParams } from '../types/AuthTypes';

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

export enum AuthStatus {
  UNKNOWN = 'unknown',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
}

interface AuthState {
  status: AuthStatus;
  user: CrimChartUserModel | null;
  isLoading: boolean;
  errorMessage: string | null;
  pendingSignUp: SignUpParams | null;
  pendingGoogleOnboarding: boolean;
}

interface AuthActions {
  checkSession: () => Promise<void>;
  startSignUp: (countryCode: string, countryName: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setBirthday: (birthday: Date) => void;
  setGender: (gender: string) => void;
  setMusicCategory: (category: string) => void;
  setCountryName: (countryName: string) => void;
  setUsernameAndCheck: (username: string) => Promise<boolean>;
  createAccountInitial: () => Promise<boolean | 'OTP_REQUIRED'>;
  completeSignUp: () => Promise<boolean>;
  verifyOtp: (token: string) => Promise<boolean>;
  resendOtp: () => Promise<boolean>;
  updateProfile: (updates: any) => Promise<boolean>;
  login: (params: LoginParams) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  completeGoogleOnboarding: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  status: AuthStatus.UNKNOWN,
  user: null,
  isLoading: false,
  errorMessage: null,
  pendingSignUp: null,
  pendingGoogleOnboarding: false,

  checkSession: async () => {
    try {
      if (Platform.OS === 'web') {
        console.log('[AUTH] checkSession() called on web');
        console.log('[AUTH] URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');

        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[AUTH] getSession ERROR:', error);
          set({ status: AuthStatus.UNAUTHENTICATED });
          return;
        }

        const session = data?.session;
        console.log('[AUTH] session found?', !!session, '| user:', session?.user?.email);

        if (!session) {
          console.log('[AUTH] No session -> UNAUTHENTICATED');
          set({ status: AuthStatus.UNAUTHENTICATED });
          return;
        }

        const localUser = await authRepository.local.getUser();
        console.log('[AUTH] localUser from storage?', !!localUser, '| id:', localUser?.id);

        if (!localUser) {
          console.log('[AUTH] No local user -> calling handleWebOAuthSession');
          const result = await authRepository.handleWebOAuthSession(session);
          console.log('[AUTH] handleWebOAuthSession result -> isNewUser:', result.isNewUser, '| user:', result.user?.email);
          if (result.isNewUser) {
            set({
              isLoading: false,
              status: AuthStatus.UNAUTHENTICATED,
              pendingGoogleOnboarding: true,
              pendingSignUp: {
                countryCode: '',
                countryName: '',
                phoneNumber: '',
                email: result.user.email || '',
                username: result.user.username || '',
              },
            });
          } else {
            console.log('[AUTH] Existing user via OAuth -> AUTHENTICATED');
            set({ status: AuthStatus.AUTHENTICATED, user: result.user });
            authRepository.updateOnlineStatus(true);
          }
        } else {
          console.log('[AUTH] Local user exists + valid session -> AUTHENTICATED');
          set({ status: AuthStatus.AUTHENTICATED, user: localUser });
          authRepository.updateOnlineStatus(true);
        }
        return;
      }

      // Native (iOS/Android)
      console.log('[AUTH] checkSession() called on native');
      const user = await authRepository.getCurrentUser();
      console.log('[AUTH] native getCurrentUser?', !!user);
      if (user) {
        set({ status: AuthStatus.AUTHENTICATED, user });
        authRepository.updateOnlineStatus(true);
      } else {
        set({ status: AuthStatus.UNAUTHENTICATED });
      }
    } catch (e) {
      console.error('[AUTH] checkSession EXCEPTION:', e);
      set({ status: AuthStatus.UNAUTHENTICATED });
    }
  },

  startSignUp: (countryCode, countryName) => {
    const pending = { countryCode, countryName, phoneNumber: '', email: '', username: '' };
    set({ pendingSignUp: pending });
    Storage.setItemAsync('saved_pending_signup', JSON.stringify(pending));
  },

  setPhoneNumber: (phoneNumber) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, phoneNumber };
    Storage.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setEmail: (email) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, email };
    Storage.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setPassword: (password) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, password };
    Storage.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setBirthday: (birthday) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, birthday };
    Storage.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setGender: (gender) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, gender };
    Storage.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setMusicCategory: (musicCategory) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, musicCategory };
    Storage.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setCountryName: (countryName) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, countryName };
    Storage.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setUsernameAndCheck: async (username) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const available = await authRepository.checkUsernameAvailable(username);
      if (available) {
        const { pendingSignUp } = get();
        if (pendingSignUp) {
          const updated = { ...pendingSignUp, username };
          set({ isLoading: false, pendingSignUp: updated });
          Storage.setItemAsync('saved_pending_signup', JSON.stringify(updated));
        } else {
          set({ isLoading: false });
        }
        return true;
      } else {
        set({ isLoading: false, errorMessage: 'This username is already taken' });
        return false;
      }
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message });
      return false;
    }
  },

  createAccountInitial: async () => {
    const { pendingSignUp } = get();
    if (!pendingSignUp || !pendingSignUp.email || !pendingSignUp.password) {
      set({ errorMessage: 'Email and Password are required.' });
      return false;
    }
    
    set({ isLoading: true, errorMessage: null });
    try {
      const user = await authRepository.signUp({
        ...pendingSignUp,
        username: pendingSignUp.username || 'User' // Provide a placeholder for the initial creation if needed by the payload.
      });
      // We do not delete pendingSignUp yet, because we need it for subsequent screens
      set({ isLoading: false, status: AuthStatus.AUTHENTICATED, user });
      return true;
    } catch (e: any) {
      if (e.message === 'OTP_REQUIRED') {
        set({ isLoading: false });
        return 'OTP_REQUIRED';
      }
      set({ isLoading: false, errorMessage: e.message });
      return false;
    }
  },

  completeSignUp: async () => {
    const { pendingSignUp } = get();
    if (!pendingSignUp) return false;

    if (!pendingSignUp.email || !pendingSignUp.password) {
      set({ errorMessage: 'Email and Password are required.' });
      return false;
    }

    set({ isLoading: true, errorMessage: null });
    try {
      const user = await authRepository.signUp(pendingSignUp);
      await Storage.deleteItemAsync('saved_pending_signup');
      set({ isLoading: false, status: AuthStatus.AUTHENTICATED, user, pendingSignUp: null });
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message });
      return false;
    }
  },

  verifyOtp: async (token: string) => {
    const { pendingSignUp } = get();
    if (!pendingSignUp) return false;

    set({ isLoading: true, errorMessage: null });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: pendingSignUp.email,
        token,
        type: 'signup',
      });

      if (error) throw error;
      if (data.session && data.user) {
        try {
          // Explicitly create profile to ensure it exists for subsequent updates,
          // in case the database trigger isn't installed.
          const defaultName = pendingSignUp.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
          await supabase.from('profiles').insert([{
            id: data.user.id,
            display_name: defaultName || 'User',
            username: defaultName + '_' + Math.floor(Math.random() * 10000)
          }]);
        } catch (e) {
          console.log("Profile insert skipped (likely already created by trigger):", e);
        }

        const user = new CrimChartUserModel({
          id: data.user.id,
          displayName: pendingSignUp.username ?? '',
          createdAt: new Date(),
        });

        await authRepository.local.saveUser(user, data.session.access_token, data.session.refresh_token);
        await Storage.deleteItemAsync('saved_pending_signup');
        
        set({ isLoading: false, status: AuthStatus.AUTHENTICATED, user, pendingSignUp: null });
        return true;
      } else {
        set({ isLoading: false, errorMessage: 'Invalid or expired code.' });
        return false;
      }
    } catch (e: any) {
      set({ isLoading: false, errorMessage: 'Verification failed. Please check the code and try again.' });
      return false;
    }
  },

  resendOtp: async () => {
    const { pendingSignUp } = get();
    if (!pendingSignUp) return false;

    set({ isLoading: true, errorMessage: null });
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingSignUp.email,
      });

      if (error) throw error;
      
      set({ isLoading: false });
      return true;
    } catch (e: any) {
      console.log('Resend OTP Error:', e);
      set({ isLoading: false, errorMessage: e.message || 'Failed to resend code.' });
      return false;
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const user = await authRepository.updateProfile(updates);
      set({ isLoading: false, user });
      return true;
    } catch (e: any) {
      console.error('[useAuthStore] Error updating profile:', e);
      set({ isLoading: false, errorMessage: e.message });
      return false;
    }
  },

  login: async (params) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const user = await authRepository.login(params);
      set({ isLoading: false, status: AuthStatus.AUTHENTICATED, user });
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message });
      return false;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      if (Platform.OS === 'web') {
        // On web, GoogleAuthService.signIn() opens a popup and waits for SIGNED_IN
        // The popup causes Supabase to set the session in storage
        await authRepository.loginWithGoogle();
        // After popup closes with a session, call checkSession to hydrate the store
        await get().checkSession();
        return get().status === AuthStatus.AUTHENTICATED;
      }

      const result = await authRepository.loginWithGoogle();
      if (result.isNewUser) {
        set({ 
          isLoading: false, 
          pendingGoogleOnboarding: true,
          pendingSignUp: { 
            countryCode: '', 
            countryName: '', 
            phoneNumber: '', 
            email: result.user.email || '', 
            username: result.user.username || '' 
          } 
        });
        return true;
      } else {
        set({ isLoading: false, status: AuthStatus.AUTHENTICATED, user: result.user, pendingGoogleOnboarding: false });
        return true;
      }
    } catch (e: any) {
      console.warn('Raw Google Signin error:', e);
      set({ isLoading: false, errorMessage: e?.message || e?.code || String(e) || 'Unknown error' });
      return false;
    }
  },

  completeGoogleOnboarding: async () => {
    const { pendingSignUp } = get();
    if (!pendingSignUp) return false;

    set({ isLoading: true, errorMessage: null });
    try {
      const user = await authRepository.createGoogleUserProfile(pendingSignUp);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await authRepository.local.saveUser(user, session.access_token, session.refresh_token);
      }

      await Storage.deleteItemAsync('saved_pending_signup');
      set({ isLoading: false, status: AuthStatus.AUTHENTICATED, user, pendingSignUp: null, pendingGoogleOnboarding: false });
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message });
      return false;
    }
  },

  signOut: async () => {
    if (get().status === AuthStatus.UNAUTHENTICATED) return;
    // Set status early to prevent infinite loops from Supabase onAuthStateChange listener
    set({ status: AuthStatus.UNAUTHENTICATED, isLoading: true });
    try {
      await authRepository.updateOnlineStatus(false);
      await authRepository.signOut();
    } catch {} finally {
      useProfileCacheStore.getState().clearAll();
      set({ isLoading: false, user: null });
    }
  },

  clearError: () => set({ errorMessage: null }),
}));

// Setup listener outside
if (supabase.auth) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    const store = useAuthStore.getState();
    if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
      if (store.status === AuthStatus.AUTHENTICATED) {
        await store.signOut();
      }
    }
  });
}
