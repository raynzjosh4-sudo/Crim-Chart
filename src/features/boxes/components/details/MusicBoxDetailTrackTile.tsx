import { AnimatedDisk } from '@/components/AnimatedDisk';
import UserAvatar from '@/components/avatar/UserAvatar';
import { DownloadButton } from '@/components/buttons/DownloadButton';
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface CommentPreview {
  id: string;
  user: { id: string; name: string; avatarUrl: string; };
  text: string;
}

export interface AddedBy {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface MusicBoxDetailTrackTileProps {
  key?: string;
  song: {
    hasLyrics: any;
    id: string;
    postId?: string;
    boxId?: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    audioUrl: string;
    downloadsCount?: number;
    likes: number;
    dislikes: number;
    commentsCount: number;
    addedBy: AddedBy;
    linkedFrom?: AddedBy;
    recentComments?: CommentPreview[];
  };
  isPlaying?: boolean;
}

export const MusicBoxDetailTrackTile = ({ song, isPlaying }: MusicBoxDetailTrackTileProps) => {
  const router = useRouter();
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadingPromiseRef = useRef<Promise<Audio.Sound | null> | null>(null);

  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    if (song.postId) {
      useInteractionStore.getState().seedPost(
        song.postId,
        song.likes,
        0,
        false,
        song.downloadsCount || 0,
        song.boxId
      );
    }
  }, [song.postId, song.boxId, song.likes, song.downloadsCount]);

  const currentDownloads = useInteractionStore(state => {
    if (song.postId) {
      const key = song.boxId ? `${song.boxId}_${song.postId}` : song.postId;
      return state.downloadsCount[key] ?? song.downloadsCount ?? 0;
    }
    return song.downloadsCount || 0;
  });

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => { });
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setIsManuallyPaused(false);
    }
  }, [isPlaying]);

  const effectiveIsPlaying = isPlaying && !isManuallyPaused;

  useEffect(() => {
    if (!song.audioUrl) return;

    const handlePlayState = async () => {
      try {
        if (effectiveIsPlaying) {
          if (!soundRef.current && !loadingPromiseRef.current) {
            loadingPromiseRef.current = (async () => {
              await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
              });
              const { sound } = await Audio.Sound.createAsync(
                { uri: song.audioUrl! },
                { shouldPlay: true, isLooping: true }
              );
              if (!isMounted.current) {
                await sound.unloadAsync().catch(() => { });
                return null;
              }
              soundRef.current = sound;
              return sound;
            })();
            await loadingPromiseRef.current;
          } else if (soundRef.current) {
            try {
              await soundRef.current.playAsync();
            } catch (err) {
              console.log('Failed to play existing sound, reloading...', err);
              await soundRef.current.unloadAsync().catch(() => { });
              if (!isMounted.current) return;
              const { sound } = await Audio.Sound.createAsync(
                { uri: song.audioUrl! },
                { shouldPlay: true, isLooping: true }
              );
              if (!isMounted.current) {
                await sound.unloadAsync().catch(() => { });
                return;
              }
              soundRef.current = sound;
            }
          } else if (loadingPromiseRef.current) {
            const sound = await loadingPromiseRef.current;
            if (sound && isMounted.current) await sound.playAsync();
          }
        } else {
          if (soundRef.current) {
            await soundRef.current.pauseAsync();
          } else if (loadingPromiseRef.current) {
            const sound = await loadingPromiseRef.current;
            if (sound && isMounted.current) await sound.pauseAsync();
          }
        }
      } catch (e) {
        console.log('Audio playback error:', e);
      }
    };

    handlePlayState();
  }, [effectiveIsPlaying, song.audioUrl]);

  return (
    <View style={styles.container}>
      {/* Facebook-style Post Header */}
      <View style={styles.postHeader}>
        {song.addedBy ? (
          <View style={styles.headerLeft}>
            <UserAvatar
              userId={song.addedBy.id}
              fallbackUrl={song.addedBy.avatarUrl}
              name={song.addedBy.name}
              size={36}
            />
            <View style={styles.postHeaderText}>
              <Text style={styles.postHeaderName}>{song.addedBy.name}</Text>
              <Text style={styles.postHeaderSub}>Added a track</Text>
            </View>
            <TouchableOpacity style={styles.followBtn}>
              <Text style={styles.followBtnText}>Follow</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerLeft} />
        )}

        <MediaDownloadWrapper
          mediaUrl={song.audioUrl || ''}
          title={song.title}
          coverUrl={song.thumbnailUrl || ''}
          mediaType="audio"
          onDownloadSuccess={() => {
            if (song.postId) {
              const incrementDownload = useInteractionStore.getState().incrementDownload;
              incrementDownload(song.postId, song.boxId);
            }
          }}
        >
          {({ download, isDownloading }) => (
            <DownloadButton
              onPress={download}
              isDownloading={isDownloading}
              color="rgba(255,255,255,0.8)"
              size={20}
              count={currentDownloads}
            />
          )}
        </MediaDownloadWrapper>
      </View>

      {/* Track Info Header */}
      <TouchableOpacity
        style={styles.mainRow}
        onPress={() => router.push({
          pathname: '/now-playing',
          params: {
            title: song.title,
            artist: song.artist,
            coverUrl: song.thumbnailUrl,
            audioUrl: song.audioUrl || '',
          }
        })}
        activeOpacity={0.7}
      >
        <View style={styles.thumbnailContainer}>
          <AnimatedDisk
            imageUrl={song.thumbnailUrl || undefined}
            size={180}
            isPlaying={effectiveIsPlaying || false}
            onPress={() => setIsManuallyPaused(!isManuallyPaused)}
            showOverlayIcons={true}
            placeholderText=""
          />

          {/* Owner of the track overlapping the disk */}
          {song.linkedFrom && (
            <View style={styles.linkedFromBadge}>
              <UserAvatar
                userId={song.linkedFrom.id}
                fallbackUrl={song.linkedFrom.avatarUrl}
                name={song.linkedFrom.name}
                size={40}
              />
            </View>
          )}
        </View>

        <View style={styles.songInfo}>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songArtist}>{song.artist}</Text>

          {/* View Lyrics Button */}
          {song.hasLyrics && (
            <TouchableOpacity style={styles.lyricsBtn}>
              <Text style={styles.lyricsBtnText}>View Lyrics</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Inline Comments Preview (Before Action Bar) */}
      {song.recentComments && song.recentComments.length > 0 && (
        <View style={styles.commentsContainer}>
          {song.recentComments.slice(0, 2).map(comment => (
            <View key={comment.id} style={styles.commentRow}>
              <UserAvatar
                userId={comment.user.id}
                fallbackUrl={comment.user.avatarUrl}
                name={comment.user.name}
                size={20}
              />
              <Text style={styles.commentText} numberOfLines={2}>
                <Text style={styles.commentUser}>{comment.user.name} </Text>
                {comment.text}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Facebook-style Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn}>
          <ThumbsUp size={24} color="#FFF" />
          <Text style={styles.actionText}>{song.likes > 0 ? song.likes : 'Like'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <ThumbsDown size={24} color="#FFF" />
          <Text style={styles.actionText}>{song.dislikes > 0 ? song.dislikes : 'Dislike'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <MessageCircle size={24} color="#FFF" />
          <Text style={styles.actionText}>{song.commentsCount ? `${song.commentsCount} Comments` : 'Comment'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 180,
    height: 180,
    marginRight: 0,
    borderRadius: 90,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 90, // Half of 180 for a perfect circle
    position: 'absolute',
  },
  playOverlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    transform: [{ scale: 1.1 }],
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postHeaderText: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  postHeaderName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  postHeaderSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  followBtn: {
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  followBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkedFromBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#000',
    backgroundColor: '#000',
  },
  songInfo: {
    flex: 1,
    marginRight: 8,
  },
  songTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  songArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  lyricsBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  lyricsBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  commentsContainer: {
    marginTop: 4,
    paddingHorizontal: 8,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  commentUser: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  commentText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: 8,
  }
});
