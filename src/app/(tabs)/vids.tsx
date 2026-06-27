import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { VideoFeedPage } from '@/video/pages/VideoFeedPage';
import { dummyVideos } from '@/video/data/dummyVideoData';

export default function VidsTabScreen() {
  const params = useLocalSearchParams();

  return (
    <VideoFeedPage
      initialVideos={dummyVideos}
      initialIndex={params.initialIndex ? Number(params.initialIndex) : undefined}
      showBack={false} // Because it's a root tab, we don't show the back button
      channelId={params.channelId as string}
    />
  );
}
