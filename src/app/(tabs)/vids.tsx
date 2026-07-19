import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { VideoFeedPage } from '@/video/pages/VideoFeedPage';
import { AuthPlaceholderPage } from '@/components/wrappers/AuthPlaceholderPage';
import { useAuthStore } from '@/features/auth/application/useAuthStore';

export default function VidsTabScreen() {
  const params = useLocalSearchParams();
  const user = useAuthStore(state => state.user);

  if (!user) {
    return <AuthPlaceholderPage title="Vids" featureName="short videos" />;
  }

  return (
    <VideoFeedPage
      initialIndex={params.initialIndex ? Number(params.initialIndex) : undefined}
      showBack={false} // Because it's a root tab, we don't show the back button
      channelId={params.channelId as string}
    />
  );
}
