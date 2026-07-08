import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, useColorScheme, ActivityIndicator, Image } from 'react-native';
import { Heart, Star, Download } from 'lucide-react-native';
import { AnimatedDisk } from '@/components/AnimatedDisk';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';
import { LikeButtonWrapper } from '@/components/wrappers/LikeButtonWrapper';
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';
import { MusicTrackItem } from '@/features/boxes/components/music_posting/tiles/MusicListTile';
import { SkeletonBox } from '@/components/skeletons/SkeletonBox';
import { AudioProgressBar } from '@/components/musicPlayer/AudioProgressBar';

interface TopRatedCardProps {
  key?: string | number;
  track: MusicTrackItem;
}

export const TopRatedCard: React.FC<TopRatedCardProps> = ({ track }) => {
  const isWeb = Platform.OS === 'web';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { isPlaying, currentTrackId, toggleTrack, position, duration, seekTo, pauseCurrent, resumeCurrent } = useGlobalAudioPlayer();
  const isActiveTrack = currentTrackId === track.id;
  const isThisTrackPlaying = isPlaying && isActiveTrack;

  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPosition, setScrubPosition] = useState(0);

  // Git Theme Colors
  const cardBgColor = isDark ? '#161b22' : '#ffffff';
  const titleColor = isDark ? '#c9d1d9' : '#24292f';
  const artistColor = isDark ? '#8b949e' : '#57606a';
  const cardInfoBgColor = isDark ? '#0d1117' : '#f6f8fa';
  const primaryColor = isDark ? '#238636' : '#2da44e';

  const handlePlayToggle = () => {
    if (track.audioUrl) {
      toggleTrack(track.id, track.audioUrl, { 
        title: track.title, 
        artist: track.artist, 
        coverUrl: track.coverUrl 
      });
    }
  };

  const handleScrubStart = () => {
    setIsScrubbing(true);
  };
  const handleScrubMove = (seekMillis: number) => {
    setScrubPosition(seekMillis);
  };
  const handleScrubRelease = async (seekMillis: number) => {
    setIsScrubbing(false);
    await seekTo(seekMillis);
  };

  const currentPos = isScrubbing ? scrubPosition : position;

  return (
    <View style={[styles.musicCard, { backgroundColor: cardBgColor }]}>
      <Pressable 
        style={({ hovered }: any) => [
          styles.pressableArea,
          isWeb && hovered && styles.musicCardHovered
        ]}
        onPress={handlePlayToggle}
      >
        <View style={styles.diskContainer}>
          <AnimatedDisk 
            imageUrl={track.coverUrl || track.owner?.avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80'}
            size={160}
            isPlaying={isThisTrackPlaying}
            onPress={handlePlayToggle}
          />
        </View>
        <View style={[styles.cardInfo, { backgroundColor: cardInfoBgColor }]}>
          
          {/* User attribution */}
          {track.owner && (
            <View style={styles.userRow}>
              <Image 
                source={{ uri: track.owner.avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80' }} 
                style={styles.userAvatar} 
              />
              <Text style={[styles.userName, { color: artistColor }]} numberOfLines={1}>
                {track.owner.name}'s favorite song
              </Text>
            </View>
          )}

          <Text style={[styles.trackTitle, { color: titleColor }]} numberOfLines={1}>{track.title}</Text>
          <Text style={[styles.trackArtist, { color: artistColor }]} numberOfLines={1}>{track.artist}</Text>
          
          {isActiveTrack && (
            <View style={styles.progressContainer}>
               <AudioProgressBar
                position={currentPos}
                duration={duration}
                primaryColor={primaryColor}
                onScrubStart={handleScrubStart}
                onScrubMove={handleScrubMove}
                onScrubRelease={handleScrubRelease}
                compact={true}
              />
            </View>
          )}

          <View style={styles.statsRow}>
            <LikeButtonWrapper
              postId={track.id}
              sourceTable={track.sourceTable}
              initialLikesCount={track.likesCount}
              initialIsLiked={false}
            />
            
            <View style={styles.statItem}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={[styles.statText, { color: titleColor }]}>4.8</Text>
            </View>

            <View style={{ flex: 1 }} />
            
            {track.audioUrl ? (
              <MediaDownloadWrapper
                mediaUrl={track.audioUrl}
                coverUrl={track.coverUrl}
                title={track.title}
                mediaType="audio"
              >
                {({ download, isDownloading }) => (
                  <Pressable onPress={download} style={styles.downloadBtn}>
                    {isDownloading ? (
                      <ActivityIndicator size="small" color={titleColor} />
                    ) : (
                      <Download size={18} color={titleColor} />
                    )}
                  </Pressable>
                )}
              </MediaDownloadWrapper>
            ) : null}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export const TopRatedCardShimmer = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const cardBgColor = isDark ? '#161b22' : '#ffffff';
  const cardInfoBgColor = isDark ? '#0d1117' : '#f6f8fa';

  return (
    <View style={[styles.musicCard, { backgroundColor: cardBgColor }]}>
      <View style={styles.diskContainer}>
        <SkeletonBox width={160} height={160} borderRadius={80} />
      </View>
      <View style={[styles.cardInfo, { backgroundColor: cardInfoBgColor, gap: 8 }]}>
        <SkeletonBox width="80%" height={16} />
        <SkeletonBox width="60%" height={14} />
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
          <SkeletonBox width={40} height={20} />
          <SkeletonBox width={40} height={20} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  musicCard: {
    width: 250, // Slightly wider to accommodate new UI elements
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        transition: 'transform 0.2s ease, box-shadow 0.2s ease' as any,
      },
      default: {
        elevation: 4,
      }
    }),
  },
  pressableArea: {
    alignItems: 'center',
    paddingTop: 20,
    width: '100%',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {})
  },
  musicCardHovered: {
    transform: [{ translateY: -4 }],
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)' as any,
  },
  diskContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingLeft: 16, // to counter AnimatedDisk margin
  },
  cardInfo: {
    padding: 16,
    width: '100%',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333',
  },
  userName: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
    marginTop: -20, // AudioProgressBar has a default marginTop: 40, so let's adjust it
    marginHorizontal: -16, // AudioProgressBar has paddingHorizontal 30, we want it flush
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  downloadBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  }
});
