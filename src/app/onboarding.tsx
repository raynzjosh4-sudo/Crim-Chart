import { colors } from '@/core/theme/colors';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { SignupModalWidget } from '@/signing/components/SignupModalWidget';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);

  let initialStep = 'country';
  if (user) {
    if (!user.country) initialStep = 'country';
    else if (!user.birthday) initialStep = 'birthday';
    else if (!user.profileImageUrl) initialStep = 'profile-picture';
    else if (!user.bio) initialStep = 'bio';
    else if (!user.crownTitle) initialStep = 'crown-title';
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SignupModalWidget
        visible={true}
        initialStep={initialStep}
        onClose={() => {
          // If they close without finishing, log them out
          useAuthStore.getState().signOut();
          router.replace('/landing');
        }}
        onFinish={() => {
          // If they successfully complete a step, re-evaluate or go to tabs
          const updatedUser = useAuthStore.getState().user;
          if (updatedUser && updatedUser.country && updatedUser.birthday && updatedUser.bio && updatedUser.crownTitle && updatedUser.profileImageUrl) {
            router.replace('/(tabs)');
          }
          // If something is still missing, useProtectedRoute will automatically redirect them back here,
          // and initialStep will correctly pick up the next missing field.
        }}
        onGoToLogin={() => {
          router.replace('/login' as any);
        }}
      />
    </View>
  );
}
