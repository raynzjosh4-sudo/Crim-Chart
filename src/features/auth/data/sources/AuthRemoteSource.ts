import { supabase } from '@/core/supabase/supabaseConfig';
import { AuthTokens, LoginParams, SignUpParams } from '../../domain/entities/AuthParams';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';

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
        username: params.username,
        birthday: params.birthday?.toISOString(),
        gender: params.gender,
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
          birthday: params.birthday,
          gender: params.gender,
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
        .select()
        .eq('id', authUser.id)
        .maybeSingle();

      return {
        user: CrimChartUserModel.empty().copyWith({
          id: authUser.id,
          displayName: profile?.username ?? params.identifier.split('@')[0],
          profileImageUrl: CrimChartUserModel.correctImageUrl(profile?.profile_image_url ?? ''),
          birthday: profile?.birthday ? new Date(profile.birthday) : undefined,
          gender: profile?.gender,
          followersCount: profile?.followers_count ?? 0,
          followingCount: profile?.following_count ?? 0,
          channelsCreatedCount: profile?.charts_count ?? 0,
          createdAt: profile?.created_at ? new Date(profile.created_at) : new Date(),
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

  static async loginWithGoogle(idToken: string, accessToken: string): Promise<{ user: CrimChartUserModel; tokens: AuthTokens }> {
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
      for (let i = 0; i < 3; i++) {
        const { data } = await supabase
          .from('profiles')
          .select()
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (data) {
          profile = data;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!profile) {
        throw new Error('Profile creation is taking longer than expected. Please try again.');
      }

      return {
        user: CrimChartUserModel.empty().copyWith({
          id: authUser.id,
          displayName: profile.username ?? authUser.email?.split('@')[0] ?? 'User',
          profileImageUrl: CrimChartUserModel.correctImageUrl(
            profile.profile_image_url ?? authUser.user_metadata?.avatar_url ?? ''
          ),
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
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      return !data;
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
      const payload: any = { is_online: isOnline, active: isOnline };
      
      // If they are going offline, log the exact timestamp
      if (!isOnline) {
        payload.last_seen = new Date().toISOString();
      }

      await supabase
        .from('profiles')
        .update(payload)
        .eq('id', user.id);
    } catch (e) {
      console.warn('❌ [AuthRemote] Failed to update online status:', e);
    }
  }
}
