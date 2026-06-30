import { supabase } from '@/core/supabase/supabaseConfig';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { AuthTokens, LoginParams, SignUpParams } from '../../domain/entities/AuthParams';

export class AuthRemoteSource {
  static async signUp(params: SignUpParams): Promise<{ user: CrimChartUserModel; tokens: AuthTokens }> {
    try {
      const sanitizedEmail = params.email.trim();
      const { data: res, error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: params.password || '',
      });

      if (error) throw error;

      const session = res.session;
      const authUser = res.user;

      if (!authUser) {
        throw new Error('Signup failed: No user returned.');
      }

      if (!session) {
        throw new Error('OTP_REQUIRED');
      }

      const profileData = {
        id: authUser.id,
        display_name: params.username,
        birthday: params.birthday?.toISOString(),
        gender: params.gender,
        country: params.countryName,
      };

      try {
        await supabase.from('profiles').insert(profileData);
      } catch (e) {
        console.warn('AuthRemoteSource: Profile insert failed:', e);
      }

      return {
        user: CrimChartUserModel.empty().copyWith({
          id: authUser.id,
          displayName: params.username,
          username: params.username,
          email: authUser.email,
          birthday: params.birthday,
          gender: params.gender,
          country: params.countryName,
          createdAt: new Date(),
        }),
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token ?? '',
          expiresAt: new Date(Date.now() + 3600 * 1000), // Approximate 1h
        },
      };
    } catch (e: any) {
      throw new Error(e.message || String(e));
    }
  }

  static async login(params: LoginParams): Promise<{ user: CrimChartUserModel; tokens: AuthTokens }> {
    try {
      const sanitizedIdentifier = params.identifier.trim().replace(/\s+/g, '');
      const { data: res, error } = await supabase.auth.signInWithPassword({
        email: sanitizedIdentifier,
        password: params.password || '',
      });

      if (error) throw error;

      const session = res.session;
      const authUser = res.user;

      if (!authUser || !session) {
        throw new Error('Login failed: Invalid credentials.');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*, user_connection_stats(*)')
        .eq('id', authUser.id)
        .maybeSingle();

      const baseUser = CrimChartUserModel.fromMap(profile || {});
      return {
        user: baseUser.copyWith({
          id: authUser.id,
          email: authUser.email,
          displayName: baseUser.displayName || params.identifier.split('@')[0],
          profileImageUrl: CrimChartUserModel.correctImageUrl(baseUser.profileImageUrl ?? ''),
          createdAt: baseUser.createdAt || new Date(),
        }),
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token ?? '',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        },
      };
    } catch (e: any) {
      throw new Error(e.message || String(e));
    }
  }

  static async createGoogleUserProfile(params: any): Promise<CrimChartUserModel> {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      throw new Error('No authenticated user found for profile creation.');
    }

    try {
      const profileData = {
        id: user.id,
        display_name: params.username,
        birthday: params.birthday ? new Date(params.birthday).toISOString() : undefined,
        gender: params.gender,
        crown_title: params.crownTitle,
        country: params.countryName,
        profile_image_url: user.user_metadata?.avatar_url || '',
      };

      const { data: response, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;

      return CrimChartUserModel.fromMap(response);
    } catch (e: any) {
      throw new Error(`Google profile creation failed: ${e.message || e}`);
    }
  }

  static async loginWithGoogle(idToken: string, accessToken: string): Promise<{ user: CrimChartUserModel; tokens: AuthTokens; isNewUser?: boolean }> {
    try {
      const { data: res, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        access_token: accessToken || undefined,
      });

      if (error) throw error;

      const session = res.session;
      const authUser = res.user;

      if (!authUser || !session) {
        throw new Error('Google Login failed: No session returned.');
      }

      let profile: any = null;
      const { data } = await supabase
        .from('profiles')
        .select()
        .eq('id', authUser.id)
        .maybeSingle();

      if (data && data.birthday) {
        profile = data;
      } else {
        // If no profile or incomplete profile (missing birthday), flag it as a new user
        // so the UI can redirect to the onboarding screens.
        profile = {
          id: authUser.id,
          username: authUser.email?.split('@')[0] || 'user',
          display_name: authUser.user_metadata?.full_name || 'User',
          profile_image_url: authUser.user_metadata?.avatar_url || '',
        };
        return {
          user: CrimChartUserModel.empty().copyWith({
            id: authUser.id,
            displayName: profile.display_name,
            username: profile.username,
            email: authUser.email,
            profileImageUrl: CrimChartUserModel.correctImageUrl(profile.profile_image_url),
            createdAt: new Date(),
          }),
          tokens: {
            accessToken: session.access_token,
            refreshToken: session.refresh_token ?? '',
            expiresAt: new Date(Date.now() + 3600 * 1000),
          },
          isNewUser: true,
        };
      }

      return {
        user: CrimChartUserModel.empty().copyWith({
          id: authUser.id,
          displayName: profile.username ?? authUser.email?.split('@')[0] ?? 'User',
          username: profile.username,
          email: authUser.email,
          profileImageUrl: CrimChartUserModel.correctImageUrl(
            profile.profile_image_url ?? authUser.user_metadata?.avatar_url ?? ''
          ),
          birthday: profile?.birthday ? new Date(profile.birthday) : undefined,
          gender: profile?.gender,
          country: profile?.country,
          createdAt: new Date(),
        }),
        tokens: {
          accessToken: session.access_token,
          refreshToken: session.refresh_token ?? '',
          expiresAt: new Date(Date.now() + 3600 * 1000),
        },
      };
    } catch (e: any) {
      throw new Error(e.message || String(e));
    }
  }

  static async checkUsernameAvailable(username: string): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const query = supabase
        .from('profiles')
        .select('id')
        .eq('display_name', username);
      
      const { data } = await query.maybeSingle();
      
      // It is available if no one has it, OR if the person who has it is the current user
      return !data || (userId ? data.id === userId : false);
    } catch (_) {
      return true;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e: any) {
      throw new Error(`Sign out failed: ${e.message || e}`);
    }
  }

  static async updateProfile(updates: any): Promise<CrimChartUserModel> {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      throw new Error('No authenticated user found for update.');
    }

    try {
      const { data: response, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      return CrimChartUserModel.fromMap(response);
    } catch (e: any) {
      throw new Error(`Update failed: ${e.message || e}`);
    }
  }

  static async updateOnlineStatus(isOnline: boolean): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) return;

    try {
      const payload: any = { is_online: isOnline };

      // If they are going offline, log the exact timestamp
      if (!isOnline) {
        payload.last_seen = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);
        
      if (error) {
        console.warn('❌ [AuthRemote] Failed to update online status:', error);
      }
    } catch (e) {
      console.warn('❌ [AuthRemote] Exception updating online status:', e);
    }
  }
}
