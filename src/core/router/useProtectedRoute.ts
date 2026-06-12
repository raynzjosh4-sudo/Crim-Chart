import { useAuthStore, AuthStatus } from '@/features/auth/application/useAuthStore';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useProtectedRoute() {
  const { status, checkSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Call check session once on mount
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (status === AuthStatus.UNKNOWN) return; // Wait until we know the status

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'landing' || segments[0] === 'signup' || segments[0] === 'language';
    
    // Special Rule: Authenticated users can stay on signup-related setup pages
    const isSignupSetupRoute = 
      segments.includes('otp') ||
      segments.includes('birthday') ||
      segments.includes('profile-picture') ||
      segments.includes('channel-intro') ||
      segments.includes('channel-suggestions');

    // Rule 1: Not logged in? Stay on public/auth pages.
    if (status === AuthStatus.UNAUTHENTICATED && !inAuthGroup) {
      router.replace('/landing');
    } 
    // Rule 2: Logged in? Move from auth pages to feed, UNLESS in setup flow.
    else if (status === AuthStatus.AUTHENTICATED && inAuthGroup && !isSignupSetupRoute) {
      router.replace('/(tabs)'); // Assuming tabs index is the main feed
    }
  }, [status, segments, router]);
}
