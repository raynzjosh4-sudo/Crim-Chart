import { AuthLocalSource } from '../sources/AuthLocalSource';
import { AuthRemoteSource } from '../sources/AuthRemoteSource';
import { GoogleAuthService } from '../../services/GoogleAuthService';
import { SignUpParams, LoginParams } from '../../types/AuthTypes';
import { supabase } from '@/core/supabase/supabaseConfig';

export class AuthRepository {
  local = new AuthLocalSource();

  async signUp(params: SignUpParams) {
    const result = await AuthRemoteSource.signUp(params);
    await this.local.saveUser(result.user, result.tokens.accessToken, result.tokens.refreshToken);
    return result.user;
  }

  async login(params: LoginParams) {
    const result = await AuthRemoteSource.login(params);
    await this.local.saveUser(result.user, result.tokens.accessToken, result.tokens.refreshToken);
    return result.user;
  }

  async loginWithGoogle() {
    const tokens = await GoogleAuthService.signIn();
    const result = await AuthRemoteSource.loginWithGoogle(tokens.idToken, tokens.accessToken);
    if (!result.isNewUser) {
      await this.local.saveUser(result.user, result.tokens.accessToken, result.tokens.refreshToken);
    }
    return result;
  }

  async createGoogleUserProfile(params: any) {
    return AuthRemoteSource.createGoogleUserProfile(params);
  }

  async signOut() {
    try {
      await GoogleAuthService.signOut();
    } catch (e) {
      // Ignore if not signed in with Google or if module is unavailable
    }
    await supabase.auth.signOut({ scope: 'local' });
    await this.local.clearAll();
  }

  async checkUsernameAvailable(username: string) {
    return AuthRemoteSource.checkUsernameAvailable(username);
  }

  async getCurrentUser() {
    const user = await this.local.getUser();
    if (!user) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }
    return user;
  }

  async updateProfile(updates: any) {
    const user = await AuthRemoteSource.updateProfile(updates);
    await this.local.saveUser(user);
    return user;
  }

  // Convenience passthrough to static methods
  async updateOnlineStatus(isOnline: boolean) {
    return AuthRemoteSource.updateOnlineStatus(isOnline);
  }

  async handleWebOAuthSession(session: any) {
    const authUser = session.user;
    let profile: any = null;
    const { data } = await supabase
      .from('profiles')
      .select()
      .eq('id', authUser.id)
      .maybeSingle();

    if (data) {
      profile = data;
      const userModel = CrimChartUserModel.fromMap(profile).copyWith({
        id: authUser.id,
        email: authUser.email,
        displayName: profile.username ?? authUser.email?.split('@')[0] ?? 'User',
        profileImageUrl: CrimChartUserModel.correctImageUrl(profile.profile_image_url ?? authUser.user_metadata?.avatar_url ?? ''),
        createdAt: new Date(),
      });
      await this.local.saveUser(userModel, session.access_token, session.refresh_token);
      return { isNewUser: false, user: userModel };
    } else {
      const userModel = CrimChartUserModel.empty().copyWith({
        id: authUser.id,
        displayName: authUser.user_metadata?.full_name || 'User',
        username: authUser.email?.split('@')[0] || 'user',
        email: authUser.email,
        profileImageUrl: CrimChartUserModel.correctImageUrl(authUser.user_metadata?.avatar_url || ''),
        createdAt: new Date(),
      });
      return { isNewUser: true, user: userModel };
    }
  }
}

export const authRepository = new AuthRepository();
