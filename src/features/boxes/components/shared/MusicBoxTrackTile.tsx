import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Play, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

export interface MusicBoxTrackTileProps {
  key?: string;
  song: {
    id: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    likes: number;
    dislikes: number;
    lyric?: string;
  };
}

export const MusicBoxTrackTile = ({ song }: MusicBoxTrackTileProps) => {
  const router = useRouter();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  return (
    <TouchableOpacity 
      style={styles.songRow}
      onPress={() => router.push('/now-playing')}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: song.thumbnailUrl }} style={styles.songThumbnail as any} contentFit="cover" />
        <View style={styles.playOverlay}>
          <Play size={12} color={theme.colors.text} fill={theme.colors.text} />
        </View>
      </View>
      
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
      </View>

      <View style={styles.trackActions}>
        <TouchableOpacity activeOpacity={0.7} style={styles.trackActionBtn}>
          <ThumbsUp size={14} color={theme.colors.textSecondary} />
          <Text style={styles.trackActionText}>{song.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.7} style={styles.trackActionBtn}>
          <ThumbsDown size={14} color={theme.colors.textSecondary} />
          <Text style={styles.trackActionText}>{song.dislikes}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  songRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 16 * scale,
  },
  thumbnailContainer: {
    width: 48 * scale,
    height: 48 * scale,
    marginRight: 12 * scale,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },
  songThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8 * scale,
    position: 'absolute' as const,
  },
  playOverlay: {
    width: 24 * scale,
    height: 24 * scale,
    borderRadius: 12 * scale,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  songInfo: {
    flex: 1,
    marginRight: 8 * scale,
  },
  songTitle: {
    color: colors.text,
    fontSize: 15 * scale,
    fontWeight: '700' as const,
  },
  songArtist: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    marginTop: 2 * scale,
  },
  trackActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  trackActionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 8 * scale,
    paddingVertical: 6 * scale,
    borderRadius: 12 * scale,
    marginLeft: 6 * scale,
  },
  trackActionText: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    fontWeight: '600' as const,
    marginLeft: 4 * scale,
  },
});
