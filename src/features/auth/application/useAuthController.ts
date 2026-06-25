import { create } from 'zustand';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { AuthRemoteSource } from '../data/sources/AuthRemoteSource';
import { LoginParams, SignUpParams } from '../domain/entities/AuthParams';
import { supabase } from '@/core/supabase/supabaseConfig';

export enum AuthStatus {
  unknown = 'unknown',
  authenticated = 'authenticated',
  unauthenticated = 'unauthenticated',
}

interface AuthState {
  status: AuthStatus;
  user: CrimChartUserModel | null;
  isLoading: boolean;
  errorMessage: string | null;
  pendingSignUp: Partial<SignUpParams> | null;
  pendingGoogleOnboarding: boolean;

  checkSession: () => Promise<void>;
  
  // Signup Flow
  startSignUp: (countryCode: string, countryName: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setBirthday: (birthday: Date) => void;
  setGender: (gender: string) => void;
  setUsernameAndCheck: (username: string) => Promise<boolean>;
  completeSignUp: () => Promise<boolean>;
  
  // Login Flow
  login: (params: LoginParams) => Promise<boolean>;
  loginWithGoogle: (idToken: string, accessToken: string) => Promise<boolean>;
  completeGoogleOnboarding: () => Promise<boolean>;
  
  // Signout
  signOut: () => Promise<void>;
  
  clearError: () => void;
}

export const useAuthController = create<AuthState>((set, get) => ({
  status: AuthStatus.unknown,
  user: null,
  isLoading: false,
  errorMessage: null,
  pendingSignUp: null,
  pendingGoogleOnboarding: false,

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        set({ status: AuthStatus.unauthenticated, user: null });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select()
        .eq('id', session.user.id)
        .maybeSingle();

      const user = CrimChartUserModel.empty().copyWith({
        id: session.user.id,
        displayName: profile?.username ?? session.user.email?.split('@')[0] ?? 'User',
        profileImageUrl: CrimChartUserModel.correctImageUrl(profile?.profile_image_url ?? ''),
        birthday: profile?.birthday ? new Date(profile.birthday) : undefined,
        gender: profile?.gender,
        followersCount: profile?.followers_count ?? 0,
        followingCount: profile?.following_count ?? 0,
        channelsCreatedCount: profile?.charts_count ?? 0,
        createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
      });

      set({ status: AuthStatus.authenticated, user });
      AuthRemoteSource.updateOnlineStatus(true);
    } catch (e) {
      set({ status: AuthStatus.unauthenticated, user: null });
    }
  },

  startSignUp: (countryCode, countryName) => {
    set({
      pendingSignUp: { countryCode, countryName }
    });
  },

  setPhoneNumber: (phoneNumber) => {
    const { pendingSignUp } = get();
    if (pendingSignUp) set({ pendingSignUp: { ...pendingSignUp, phoneNumber } });
  },

  setEmail: (email) => {
    const { pendingSignUp } = get();
    if (pendingSignUp) set({ pendingSignUp: { ...pendingSignUp, email } });
  },

  setPassword: (password) => {
    const { pendingSignUp } = get();
    if (pendingSignUp) set({ pendingSignUp: { ...pendingSignUp, password } });
  },

  setBirthday: (birthday) => {
    const { pendingSignUp } = get();
    if (pendingSignUp) set({ pendingSignUp: { ...pendingSignUp, birthday } });
  },

  setGender: (gender) => {
    const { pendingSignUp } = get();
    if (pendingSignUp) set({ pendingSignUp: { ...pendingSignUp, gender } });
  },

  setUsernameAndCheck: async (username: string) => {
    const { pendingSignUp } = get();
    if (!pendingSignUp) return false;

    set({ isLoading: true, errorMessage: null });
    const isAvailable = await AuthRemoteSource.checkUsernameAvailable(username);

    if (isAvailable) {
      set({ isLoading: false, pendingSignUp: { ...pendingSignUp, username } });
      return true;
    } else {
      set({ isLoading: false, errorMessage: 'This username is already taken' });
      return false;
    }
  },

  completeSignUp: async () => {
    const { pendingSignUp } = get();
    if (!pendingSignUp || !pendingSignUp.email || !pendingSignUp.password || !pendingSignUp.username) {
      set({ errorMessage: 'Email, Username, and Password are required.' });
      return false;
    }

    set({ isLoading: true, errorMessage: null });
    try {
      const { user } = await AuthRemoteSource.signUp(pendingSignUp as SignUpParams);
      set({
        isLoading: false,
        status: AuthStatus.authenticated,
        user,
        pendingSignUp: null
      });
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message || 'Signup failed' });
      return false;
    }
  },

  login: async (params: LoginParams) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const { user } = await AuthRemoteSource.login(params);
      set({
        isLoading: false,
        status: AuthStatus.authenticated,
        user
      });
      AuthRemoteSource.updateOnlineStatus(true);
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message || 'Login failed' });
      return false;
    }
  },

  loginWithGoogle: async (idToken: string, accessToken: string) => {
    set({ isLoading: true, errorMessage: null });
    try {
      const result = await AuthRemoteSource.loginWithGoogle(idToken, accessToken);
      if (result.isNewUser) {
        set({ 
          isLoading: false, 
          status: AuthStatus.unauthenticated, 
          user: result.user, 
          pendingGoogleOnboarding: true 
        });
        return true;
      }

      set({
        isLoading: false,
        status: AuthStatus.authenticated,
        user: result.user,
        pendingGoogleOnboarding: false
      });
      AuthRemoteSource.updateOnlineStatus(true);
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message || 'Google Login failed' });
      return false;
    }
  },

  completeGoogleOnboarding: async () => {
    const { user, pendingSignUp } = get();
    if (!user) {
      set({ errorMessage: 'No user available for onboarding.' });
      return false;
    }
    set({ isLoading: true, errorMessage: null });
    try {
      await AuthRemoteSource.createGoogleUserProfile({
        username: pendingSignUp?.username,
        birthday: pendingSignUp?.birthday?.toISOString(),
        gender: pendingSignUp?.gender
      });
      set({
        isLoading: false,
        status: AuthStatus.authenticated,
        user,
        pendingGoogleOnboarding: false
      });
      AuthRemoteSource.updateOnlineStatus(true);
      return true;
    } catch (e: any) {
      set({ isLoading: false, errorMessage: e.message || 'Failed to complete profile' });
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await AuthRemoteSource.updateOnlineStatus(false);
      await AuthRemoteSource.signOut();
    } catch (e) {
      console.error('Sign out failed', e);
    } finally {
      set({
        isLoading: false,
        status: AuthStatus.unauthenticated,
        user: null,
        pendingSignUp: null,
        pendingGoogleOnboarding: false
      });
    }
  },

  clearError: () => set({ errorMessage: null }),
}));
