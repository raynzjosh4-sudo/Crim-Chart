import React from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LoginModalWidget } from '@/signing/components/LoginModalWidget';
import MobileLoginPage from '@/signing/LoginPage';

export default function LoginRoute() {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768 && Platform.OS === 'web';
  const router = useRouter();

  if (isDesktop) {
    // Return just the widget. It uses its own Modal and overlay internally.
    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <LoginModalWidget
          visible={true}
          onClose={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/landing' as any);
            }
          }}
        />
      </View>
    );
  }

  return <MobileLoginPage />;
}