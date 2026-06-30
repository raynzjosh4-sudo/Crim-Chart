import { AuthStatus, useAuthStore } from '@/features/auth/application/useAuthStore';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useProtectedRoute() {
  const { status, checkSession, pendingGoogleOnboarding, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Call check session once on mount
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (status === AuthStatus.UNKNOWN) return; // Wait until we know the status

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'landing' || segments[0] === 'signup' || segments[0] === 'language' || segments[0] === 'recover';
    
    // Special Rule: Authenticated users can stay on signup-related setup pages
    const isSignupSetupRoute = 
      (segments as string[]).includes('otp') ||
      (segments as string[]).includes('country') ||
      (segments as string[]).includes('username') ||
      (segments as string[]).includes('birthday') ||
      (segments as string[]).includes('gender') ||
      (segments as string[]).includes('bio') ||
      (segments as string[]).includes('crown-title') ||
      (segments as string[]).includes('profile-picture') ||
      (segments as string[]).includes('user-suggestions') ||
      (segments as string[]).includes('channel-intro') ||
      (segments as string[]).includes('channel-suggestions');

    // Rule 1: Google Onboarding (Web OAuth Redirect handling)
    if (pendingGoogleOnboarding && segments[0] !== 'signup') {
      router.replace('/signup/country' as any);
      return;
    }

    // Rule 2: Not logged in? Stay on public/auth pages.
    if (status === AuthStatus.UNAUTHENTICATED && !inAuthGroup && !pendingGoogleOnboarding) {
      router.replace('/landing');
    } 
    // Rule 3: Logged in? Enforce onboarding completion.
    if (status === AuthStatus.AUTHENTICATED && user) {
      let missingRoute: string | null = null;
      if (!user.country) missingRoute = '/signup/country';
      else if (!user.birthday) missingRoute = '/signup/username';
      else if (!user.bio) missingRoute = '/signup/bio';
      else if (!user.crownTitle) missingRoute = '/signup/crown-title';
      else if (!user.profileImageUrl) missingRoute = '/signup/profile-picture';

      if (missingRoute) {
        if (!isSignupSetupRoute) {
          router.replace(missingRoute as any);
        }
      } else {
        // Fully onboarded. If they try to go to login/signup pages, push them to the feed.
        if (inAuthGroup && !isSignupSetupRoute) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [status, segments, router, pendingGoogleOnboarding, user]);
}
