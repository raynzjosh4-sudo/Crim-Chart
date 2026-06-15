import { create } from 'zustand';
import { supabase } from '@/core/supabase/supabaseConfig';
import { authRepository } from '../data/repositories/AuthRepository';
import { SignUpParams, LoginParams } from '../types/AuthTypes';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import * as SecureStore from 'expo-secure-store';
import { useProfileCacheStore } from '@/core/store/useProfileCacheStore';

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
}

interface AuthActions {
  checkSession: () => Promise<void>;
  startSignUp: (countryCode: string, countryName: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setBirthday: (birthday: Date) => void;
  setGender: (gender: string) => void;
  setUsernameAndCheck: (username: string) => Promise<boolean>;
  completeSignUp: () => Promise<boolean>;
  verifyOtp: (token: string) => Promise<boolean>;
  updateProfile: (updates: any) => Promise<boolean>;
  login: (params: LoginParams) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  status: AuthStatus.UNKNOWN,
  user: null,
  isLoading: false,
  errorMessage: null,
  pendingSignUp: null,

  checkSession: async () => {
    try {
      const user = await authRepository.getCurrentUser();
      if (user) {
        set({ status: AuthStatus.AUTHENTICATED, user });
        authRepository.updateOnlineStatus(true);
      } else {
        set({ status: AuthStatus.UNAUTHENTICATED });
      }
    } catch {
      set({ status: AuthStatus.UNAUTHENTICATED });
    }
  },

  startSignUp: (countryCode, countryName) => {
    const pending = { countryCode, countryName, phoneNumber: '', email: '', username: '' };
    set({ pendingSignUp: pending });
    SecureStore.setItemAsync('saved_pending_signup', JSON.stringify(pending));
  },

  setPhoneNumber: (phoneNumber) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, phoneNumber };
    SecureStore.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setEmail: (email) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, email };
    SecureStore.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setPassword: (password) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, password };
    SecureStore.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setBirthday: (birthday) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, birthday };
    SecureStore.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setGender: (gender) => set((state) => {
    if (!state.pendingSignUp) return state;
    const updated = { ...state.pendingSignUp, gender };
    SecureStore.setItemAsync('saved_pending_signup', JSON.stringify(updated));
    return { pendingSignUp: updated };
  }),

  setUsernameAndCheck: async (username) => {
    const { pendingSignUp } = get();
    if (!pendingSignUp) return false;

    set({ isLoading: true, errorMessage: null });
    try {
      const available = await authRepository.checkUsernameAvailable(username);
      if (available) {
        const updated = { ...pendingSignUp, username };
        set({ isLoading: false, pendingSignUp: updated });
        SecureStore.setItemAsync('saved_pending_signup', JSON.stringify(updated));
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
      await SecureStore.deleteItemAsync('saved_pending_signup');
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
          await supabase.from('profiles').insert([{
            id: data.user.id,
            username: pendingSignUp.username,
            birthday: pendingSignUp.birthday?.toISOString(),
            gender: pendingSignUp.gender,
          }]);
        } catch {}

        const user = new CrimChartUserModel({
          id: data.user.id,
          displayName: pendingSignUp.username ?? '',
          createdAt: new Date(),
        });

        await authRepository.local.saveUser(user, data.session.access_token, data.session.refresh_token);
        await SecureStore.deleteItemAsync('saved_pending_signup');
        
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
      const user = await authRepository.loginWithGoogle();
      set({ isLoading: false, status: AuthStatus.AUTHENTICATED, user });
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message });
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authRepository.updateOnlineStatus(false);
      await authRepository.signOut();
    } catch {} finally {
      useProfileCacheStore.getState().clearAll();
      set({ status: AuthStatus.UNAUTHENTICATED, isLoading: false, user: null });
    }
  },

  clearError: () => set({ errorMessage: null }),
}));

// Setup listener outside
if (supabase.auth) {
  supabase.auth.onAuthStateChange(async (event, session) => {
    // Update internal tokens/status if needed automatically
  });
}
