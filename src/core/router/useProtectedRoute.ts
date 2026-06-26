import { useAuthStore, AuthStatus } from '@/features/auth/application/useAuthStore';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useProtectedRoute() {
  const { status, checkSession, pendingGoogleOnboarding } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Call check session once on mount
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    console.log('[DEBUG] useProtectedRoute evaluated. status:', status, 'pendingGoogle:', pendingGoogleOnboarding, 'segments:', segments);
    if (status === AuthStatus.UNKNOWN) return; // Wait until we know the status

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'landing' || segments[0] === 'signup' || segments[0] === 'language';
    
    // Special Rule: Authenticated users can stay on signup-related setup pages
    const isSignupSetupRoute = 
      (segments as string[]).includes('otp') ||
      (segments as string[]).includes('birthday') ||
      (segments as string[]).includes('profile-picture') ||
      (segments as string[]).includes('channel-intro') ||
      (segments as string[]).includes('channel-suggestions');

    // Rule 1: Google Onboarding (Web OAuth Redirect handling)
    if (pendingGoogleOnboarding && segments[0] !== 'signup') {
      console.log('[DEBUG] Rule 1 matched: routing to /signup/username');
      router.replace('/signup/username' as any);
      return;
    }

    // Rule 2: Not logged in? Stay on public/auth pages.
    if (status === AuthStatus.UNAUTHENTICATED && !inAuthGroup && !pendingGoogleOnboarding) {
      console.log('[DEBUG] Rule 2 matched: routing to /landing');
      router.replace('/landing');
    } 
    // Rule 3: Logged in? Move from auth pages to feed, UNLESS in setup flow.
    else if (status === AuthStatus.AUTHENTICATED && inAuthGroup && !isSignupSetupRoute) {
      console.log('[DEBUG] Rule 3 matched: routing to /(tabs)');
      router.replace('/(tabs)'); // Assuming tabs index is the main feed
    } else {
      console.log('[DEBUG] No routing rules matched. Staying on current page.');
    }
  }, [status, segments, router, pendingGoogleOnboarding]);
}
