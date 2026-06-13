import React from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { NowPlayingScreen } from '@/components/musicPlayer/NowPlayingScreen';

export default function NowPlayingRoute() {
  const params = useLocalSearchParams();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <NowPlayingScreen
        title={params.title as string}
        artist={params.artist as string}
        coverUrl={params.coverUrl as string}
        audioUrl={params.audioUrl as string}
        lyrics={params.lyrics as string}
        onBack={() => router.back()}
      />
    </>
  );
}
