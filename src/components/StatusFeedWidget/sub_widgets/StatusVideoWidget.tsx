import React from 'react';
const { useMemo } = React;
import { View, StyleSheet, useWindowDimensions, Image } from 'react-native';
import { PreloadableVideoPlayer, PreloadStatus } from '@/video/components/PreloadableVideoPlayer';
import { useDesktopVidsStore } from '@/mainFeed/pages/main_page_widgets/useDesktopVidsStore';
import { pickVideoThumbnail } from '@/components/youtubethambnailexatractor/videoThumbnailHelper';

export interface StatusVideoWidgetProps {
  videoUrl: string;
  thumbnailUrl?: string;
  aspectRatio?: number;
  isActive?: boolean;
}

export const StatusVideoWidget: React.FC<StatusVideoWidgetProps> = ({
  videoUrl,
  thumbnailUrl,
  aspectRatio,
  isActive
}) => {
  const isMuted = useDesktopVidsStore(state => state.isGlobalMuted);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const aspect = aspectRatio ?? 16 / 9;

  // If active, it plays. If not, it idles (unloads player to save memory).
  const preloadStatus: PreloadStatus = isActive ? 'playing' : 'idle';

  const resolvedThumbnail = useMemo(() => {
    return pickVideoThumbnail({
      explicitThumbnail: thumbnailUrl,
      videoUrl: videoUrl,
      preferYouTubeMaxRes: true,
    });
  }, [thumbnailUrl, videoUrl]);

  return (
    <View style={{ width: '100%', aspectRatio: aspect, backgroundColor: '#000', overflow: 'hidden' }}>
      <PreloadableVideoPlayer
        videoUrl={videoUrl}
        preloadStatus={preloadStatus}
        isMuted={isMuted}
        style={StyleSheet.absoluteFillObject}
        isDesktop={isDesktop}
      />
      {(!isActive && resolvedThumbnail) ? (
        <Image 
          source={{ uri: resolvedThumbnail }} 
          style={StyleSheet.absoluteFillObject} 
          resizeMode="cover" 
        />
      ) : null}
    </View>
  );
};
