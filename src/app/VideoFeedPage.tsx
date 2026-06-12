import React from 'react';
import { useRoute } from '@react-navigation/native';
import { VideoFeedPage } from '@/video/pages/VideoFeedPage';

export default function VideoFeedScreen() {
  const route = useRoute() as any;
  const params = route.params || {};

  return (
    <VideoFeedPage
      initialIndex={params.initialIndex}
      initialVideos={params.initialVideos}
      showBack={params.showBack}
      channelId={params.channelId}
    />
  );
}
