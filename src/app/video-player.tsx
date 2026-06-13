import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VideoPlayerScreen } from '@/components/video/VideoPlayerScreen';

export default function VideoPlayerPage() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const router = useRouter();

  if (!url) return null;

  return (
    <VideoPlayerScreen 
      url={url} 
      onClose={() => router.back()} 
    />
  );
}
