import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Play } from 'lucide-react-native';
import { Image } from 'expo-image';
import { PreloadableVideoPlayer } from '@/video/components/PreloadableVideoPlayer';
import { pickVideoThumbnail } from '@/components/youtubethambnailexatractor/videoThumbnailHelper';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

interface ChannelVideoPostWidgetProps {
  videoUrl: string;
  thumbnail?: string | null;
  sideThumbnails?: string[] | null;
  aspectRatio?: number | null;
}

export const ChannelVideoPostWidget: React.FC<ChannelVideoPostWidgetProps> = ({
  videoUrl,
  thumbnail,
  sideThumbnails,
  aspectRatio,
}) => {
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const aspect = aspectRatio ?? 16 / 9;
  const [isPlaying, setIsPlaying] = useState(false);

  const resolvedThumbnail = React.useMemo(() => {
    return pickVideoThumbnail({
      explicitThumbnail: thumbnail,
      sideThumbnails: sideThumbnails,
      videoUrl: videoUrl,
      preferYouTubeMaxRes: true,
    });
  }, [thumbnail, sideThumbnails, videoUrl]);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={[styles.videoContainer, { aspectRatio: aspect }]}
        onPress={() => setIsPlaying(!isPlaying)}
      >
        {resolvedThumbnail && !isPlaying && (
          <Image source={{ uri: resolvedThumbnail }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        )}
        
        {isPlaying ? (
          <PreloadableVideoPlayer
            videoUrl={videoUrl}
            preloadStatus="playing"
            isMuted={false}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={styles.playButtonContainer}>
            <Play size={32} color={theme.colors.text} fill={theme.colors.text} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    paddingHorizontal: 0,
    marginBottom: 12 * scale,
  },
  videoContainer: {
    width: '100%',
    borderRadius: 0,
    overflow: 'hidden' as const,
    position: 'relative' as const,
    backgroundColor: colors.surfaceVariant,
  },
  playButtonContainer: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 * scale }, { translateY: -24 * scale }],
    width: 48 * scale,
    height: 48 * scale,
    borderRadius: 24 * scale,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
