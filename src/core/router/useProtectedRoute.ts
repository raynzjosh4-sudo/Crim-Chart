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
    console.log('[ROUTE] status:', status, '| segments:', segments, '| pendingGoogleOnboarding:', pendingGoogleOnboarding);

    if (status === AuthStatus.UNKNOWN) {
      console.log('[ROUTE] Status UNKNOWN -> waiting...');
      return;
    }

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'landing' || segments[0] === 'signup' || segments[0] === 'language' || segments[0] === 'recover' || segments[0] === 'welcome';
    
    // Special Rule: Authenticated users can stay on onboarding
    const isSignupSetupRoute = segments[0] === 'onboarding';

    // Rule 1: Google Onboarding (Web OAuth Redirect handling)
    if (pendingGoogleOnboarding && segments[0] !== 'onboarding') {
      console.log('[ROUTE] pendingGoogleOnboarding -> /onboarding');
      router.replace('/onboarding' as any);
      return;
    }

    // Rule 2: Not logged in? Stay on public/auth pages.
    if (status === AuthStatus.UNAUTHENTICATED && !inAuthGroup && !pendingGoogleOnboarding) {
      console.log('[ROUTE] UNAUTHENTICATED + not in auth group -> /welcome');
      router.replace('/welcome');
    } 
    // Rule 3: Logged in? Enforce onboarding completion.
    if (status === AuthStatus.AUTHENTICATED && user) {
      let missingRoute: string | null = null;
      if (!user.country) missingRoute = '/onboarding';
      else if (!user.birthday) missingRoute = '/onboarding';
      else if (!user.crownTitle) missingRoute = '/onboarding';

      if (missingRoute) {
        if (!isSignupSetupRoute) {
          console.log('[ROUTE] AUTHENTICATED but missing profile fields -> /onboarding. Missing:', missingRoute, '| country:', user.country, '| birthday:', user.birthday, '| crownTitle:', user.crownTitle);
          router.replace(missingRoute as any);
        }
      } else {
        // Fully onboarded. If they try to go to login/signup pages, push them to the feed.
        if (inAuthGroup && !isSignupSetupRoute) {
          console.log('[ROUTE] AUTHENTICATED + fully onboarded + in auth group -> /(tabs)');
          router.replace('/(tabs)');
        }
      }
    }
  }, [status, segments, router, pendingGoogleOnboarding, user]);
}
