import React from 'react';
import { View } from 'react-native';
import { colors } from '@/core/theme/colors';
import { SignupModalWidget } from '@/signing/components/SignupModalWidget';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export default function OnboardingPage() {
  const router = useRouter();
  
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SignupModalWidget 
        visible={true} 
        onClose={() => {
          // If they close without finishing, log them out
          useAuthStore.getState().logout();
          router.replace('/landing');
        }}
        onGoToLogin={() => {
          router.replace('/login' as any);
        }}
      />
    </View>
  );
}
