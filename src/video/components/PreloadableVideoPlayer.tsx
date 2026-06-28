import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect } from 'react';
import { StyleProp, ViewStyle, View, Platform } from 'react-native';
import { VideoBufferingSpinner } from './VideoBufferingSpinner';

export type PreloadStatus = 'playing' | 'preloading' | 'idle';

export interface PreloadableVideoPlayerProps {
  videoUrl: string;
  preloadStatus: PreloadStatus;
  isMuted: boolean;
  style?: StyleProp<ViewStyle>;
  contentFit?: 'cover' | 'contain' | 'fill';
  isDesktop?: boolean;
}

/**
 * A wrapper around expo-video that manages preloading.
 * - 'playing': The video is active and playing.
 * - 'preloading': The player is initialized with the URL but paused. The native OS will buffer it in the background.
 * - 'idle': The player source is set to null, destroying the native instance and freeing memory.
 */
export const PreloadableVideoPlayer: React.FC<PreloadableVideoPlayerProps> = ({
  videoUrl,
  preloadStatus,
  isMuted,
  style,
  contentFit = 'cover',
  isDesktop = false,
}) => {
  // Fallback to raw mp4 on Web because Chrome/Firefox do not natively support HLS (.m3u8)
  let activeUrl = videoUrl;
  if (Platform.OS === 'web' && activeUrl?.includes('.m3u8')) {
    // Attempt to parse out the clean name to construct the raw mp4 URL
    const match = activeUrl.match(/\/processed\/([^/]+)\/videos\/([^/]+)\/hls\/playlist\.m3u8/);
    if (match) {
      const baseUrl = activeUrl.split('/processed/')[0];
      const cleanName = match[2];
      activeUrl = `${baseUrl}/raw/${cleanName}.mp4`;
      console.log('[PreloadableVideoPlayer] Web HLS fallback applied. Using raw mp4:', activeUrl);
    }
  }

  // Pass null to useVideoPlayer when idle to completely free up memory
  const player = useVideoPlayer(preloadStatus === 'idle' ? null : activeUrl, (p) => {
    p.loop = true;
    p.muted = isMuted;
  });

  useEffect(() => {
    if (!player) return;

    if (preloadStatus === 'playing') {
      player.play();
    } else if (preloadStatus === 'preloading') {
      player.pause(); // Initializing the URL buffers it natively, pausing prevents playback
    }
  }, [preloadStatus, player]);

  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  if (preloadStatus === 'idle' || !player) {
    return null; // Render nothing when idle to save GPU memory on top of CPU/RAM
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      <VideoView
        player={player}
        style={[{ flex: 1, backgroundColor: 'transparent' }]}
        contentFit={contentFit}
        allowsFullscreen={isDesktop}
        allowsPictureInPicture={isDesktop}
        nativeControls={isDesktop}
      />
      <VideoBufferingSpinner player={player} />
    </View>
  );
};
