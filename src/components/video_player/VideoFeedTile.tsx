import { Image } from 'expo-image';
import { Play } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UserAvatar from '@/components/avatar/UserAvatar';

/**
 * A completely static, hook-free tile for displaying a video item in lists
 * where no video playback is needed (e.g. the "Up Next" feed inside the player modal).
 *
 * Unlike MovieListTile, this component NEVER calls useVideoPlayer — ensuring it
 * never touches Android's audio session or codec pool, so the main player above
 * keeps playing uninterrupted even as new items load.
 */
export interface VideoFeedTileProps {
  video: {
    id: string;
    title: string;
    director: string;
    thumbnailUrl: string;
    duration: string;
    description?: string;
    addedBy?: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  };
  onPress?: (params: { videoUrl: string; title: string; director: string; description: string; isLocal: boolean }) => void;
  videoUrl?: string;
}

export const VideoFeedTile = React.memo(({ video, onPress, videoUrl }: VideoFeedTileProps) => {
  const isLocal = video.addedBy?.id === 'local_user';

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.8}
      onPress={() => {
        if (onPress) {
          onPress({
            videoUrl: videoUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            title: video.title,
            director: video.director || 'Unknown',
            description: video.description || 'A short cinematic video.',
            isLocal,
          });
        }
      }}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.thumbnail} contentFit="cover" />
        <View style={styles.playOverlay}>
          <Play size={18} color="#FFF" fill="#FFF" />
        </View>
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        {video.addedBy && (
          <View style={styles.avatarRow}>
            <UserAvatar
              userId={video.addedBy.id}
              fallbackUrl={video.addedBy.avatarUrl}
              name={video.addedBy.name}
              size={28}
            />
            <Text style={styles.addedByName} numberOfLines={1}>{video.addedBy.name}</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <Text style={styles.director} numberOfLines={1}>
          {isLocal ? `${video.director}` : `Directed by ${video.director}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  thumbnailContainer: {
    width: 120,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
  },
  playOverlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addedByName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  director: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 3,
  },
});
