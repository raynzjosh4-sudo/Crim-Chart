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

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'landing' || segments[0] === 'signup' || segments[0] === 'language' || segments[0] === 'recover' || segments[0] === 'welcome';
    
    // Special Rule: Authenticated users can stay on onboarding
    const isSignupSetupRoute = segments[0] === 'onboarding';

    // Rule 1: Google Onboarding (Web OAuth Redirect handling)
    if (pendingGoogleOnboarding && segments[0] !== 'onboarding') {
      router.replace('/onboarding' as any);
      return;
    }

    // Rule 2: Not logged in? Stay on public/auth pages.
    if (status === AuthStatus.UNAUTHENTICATED && !inAuthGroup && !pendingGoogleOnboarding) {
      router.replace('/welcome');
    } 
    // Rule 3: Logged in? Enforce onboarding completion.
    if (status === AuthStatus.AUTHENTICATED && user) {
      let missingRoute: string | null = null;
      if (!user.country) missingRoute = '/onboarding';
      else if (!user.birthday) missingRoute = '/onboarding';
      else if (!user.bio) missingRoute = '/onboarding';
      else if (!user.crownTitle) missingRoute = '/onboarding';
      else if (!user.profileImageUrl) missingRoute = '/onboarding';

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
