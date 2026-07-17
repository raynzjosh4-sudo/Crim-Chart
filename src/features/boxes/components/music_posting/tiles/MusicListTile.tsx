import { AnimatedDisk } from '@/components/AnimatedDisk';
import UserAvatar from '@/components/avatar/UserAvatar';
import { AnimatedPostButton } from '@/components/buttons/AnimatedPostButton';
import { DownloadButton } from '@/components/buttons/DownloadButton';
import { CommentSheet } from '@/components/comments/CommentSheet';
import { FollowUserButton } from '@/components/FollowUserButton';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { LyricsSheet } from '@/components/lyrics/LyricsSheet';
import { MediaDownloadWrapper } from '@/components/wrappers/MediaDownloadWrapper';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';
import * as ImagePicker from 'expo-image-picker';
import { Check, Eye, Heart, MessageCircle, Tag } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { PostFooter } from '@/components/PostFooter/PostFooter';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(diffInSeconds)) return '';
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export interface MusicTrackItem {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string;
  duration?: string;
  owner?: {
    id: string;
    name: string;
    avatarUrl: string;
    crownTitle?: string;
  };
  likesCount?: number;
  commentsCount?: number;
  viewsCount?: number;
  downloadsCount?: number;
  lyrics?: string;
  sourceTable?: string;
  caption?: string;
  createdAt?: string;
}

interface MusicListTileProps {
  track: MusicTrackItem;
  onAddPress?: (track: MusicTrackItem) => void;
  onTagPress?: () => void;
  onDownloadPress?: () => void;
  isAdded?: boolean;
  isCurrentlyPlaying?: boolean;
  likesCount?: number;
  viewsCount?: number;
  downloadsCount?: number;
  isLiked?: boolean;
  onLikePress?: () => void;
  hideTagButton?: boolean;
  hideHeader?: boolean;
  lyricsPreview?: string;
  hideBorder?: boolean;
}

export const MusicListTile: React.FC<MusicListTileProps> = ({
  track, onAddPress, onTagPress, onDownloadPress, isAdded, isCurrentlyPlaying,
  likesCount: propsLikes, viewsCount: propsViews, downloadsCount: propsDownloads, isLiked, onLikePress,
  hideTagButton, hideHeader, lyricsPreview, hideBorder
}) => {
  const [editedTrack, setEditedTrack] = useState<MusicTrackItem>(track);
  const [isCommentSheetVisible, setIsCommentSheetVisible] = useState(false);
  const [isLyricsSheetVisible, setIsLyricsSheetVisible] = useState(false);

  // Global audio player — only one track plays at a time across the whole app
  const { currentTrackId, isPlaying: globalIsPlaying, toggleTrack } = useGlobalAudioPlayer();
  const isPlaying = currentTrackId === track.id && globalIsPlaying;

  const { startLoading, stopLoading } = useGlobalProgress();

  const likesCount = propsLikes ?? editedTrack.likesCount ?? 0;
  const downloadsCount = propsDownloads ?? editedTrack.downloadsCount ?? 0;
  const viewsCount = propsViews ?? editedTrack.viewsCount ?? 0;

  const isLocal = track.owner?.id === 'local_user';

  // When visibility-driven `isCurrentlyPlaying` changes, drive the global player
  useEffect(() => {
    if (!editedTrack.audioUrl || isLocal) return;
    if (isCurrentlyPlaying) {
      // Auto-play when scrolled into view
      useGlobalAudioPlayer.getState().playTrack(track.id, editedTrack.audioUrl, { title: editedTrack.title, artist: editedTrack.artist, coverUrl: editedTrack.coverUrl, downloadsCount });
    } else {
      // If this tile was the one playing, pause it
      if (useGlobalAudioPlayer.getState().currentTrackId === track.id) {
        useGlobalAudioPlayer.getState().pauseCurrent();
      }
    }
  }, [isCurrentlyPlaying, editedTrack.audioUrl, isLocal, track.id]);

  const trackMeta = { title: editedTrack.title, artist: editedTrack.artist, coverUrl: editedTrack.coverUrl, downloadsCount };


  const handlePickImage = async () => {
    if (!isLocal) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setEditedTrack({ ...editedTrack, coverUrl: result.assets[0].uri });
    }
  };

  return (
    <View style={[styles.container, hideBorder && { borderBottomWidth: 0 }]}>
      {/* Header Row */}
      {!hideHeader && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={{ marginRight: 10 }}>
              <UserAvatar
                size={36}
                userId={editedTrack.owner?.id || ''}
                fallbackUrl={editedTrack.owner?.avatarUrl}
                name={editedTrack.owner?.name}
              />
            </View>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.headerName} numberOfLines={1}>{editedTrack.owner?.name || 'User'}</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>Added a track</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            {!isLocal && editedTrack.owner?.id && (
              <FollowUserButton
                targetUserId={editedTrack.owner.id}
                size="small"
                style={styles.followButton}
                textStyle={styles.followButtonText}
              />
            )}
          </View>
        </View>
      )}

      {/* Main Content (Disk + Info) */}
      <View style={styles.mainContent}>
        {/* The Disk */}
        <AnimatedDisk
          imageUrl={editedTrack.coverUrl || undefined}
          size={180}
          isPlaying={isPlaying}
          onPress={() => {
            if (isLocal) {
              // local track: open image picker instead (keep original behaviour)
            } else if (editedTrack.audioUrl) {
            toggleTrack(track.id, editedTrack.audioUrl, { title: editedTrack.title, artist: editedTrack.artist, coverUrl: editedTrack.coverUrl })
            }
          }}
          placeholderText={isLocal ? "Add Image" : "No Cover"}
        />

        {/* Track Info */}
        <View style={styles.trackInfo}>
          {isLocal ? (
            <TextInput
              style={[styles.trackTitle, { padding: 0, margin: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' }]}
              value={editedTrack.title}
              onChangeText={(text) => setEditedTrack({ ...editedTrack, title: text })}
              placeholder="Song title"
              placeholderTextColor="rgba(255,255,255,0.4)"
              selectionColor="#FACD11"
            />
          ) : (
            <Text style={styles.trackTitle} numberOfLines={2}>{editedTrack.title}</Text>
          )}

          {isLocal ? (
            <TextInput
              style={[styles.trackArtist, { padding: 0, margin: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)' }]}
              value={editedTrack.artist}
              onChangeText={(text) => setEditedTrack({ ...editedTrack, artist: text })}
              placeholder="Artist"
              placeholderTextColor="rgba(255,255,255,0.4)"
              selectionColor="#FACD11"
            />
          ) : (
            <Text style={styles.trackArtist} numberOfLines={1}>{editedTrack.artist}</Text>
          )}

          {!isLocal && !hideTagButton ? (
            <TouchableOpacity activeOpacity={1}
              style={[styles.tagButton, isAdded && styles.tagButtonAdded]}
              onPress={onTagPress}
            >
              {isAdded ? (
                <>
                  <Check size={12} color="#000" style={{ marginRight: 6 }} />
                  <Text style={[styles.tagButtonText, { color: '#000' }]}>Tagged</Text>
                </>
              ) : (
                <>
                  <Tag size={12} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.tagButtonText}>Tag</Text>
                </>
              )}
            </TouchableOpacity>
          ) : isLocal && !hideTagButton ? (
            <AnimatedPostButton
              title="Post"
              style={styles.tagButton}
              textStyle={styles.tagButtonText}
              onPress={async () => {
                if (onAddPress) {
                  await onAddPress(editedTrack);
                }
              }}
            />
          ) : (
            <View style={{ marginTop: 4 }}>
              {lyricsPreview ? (
                <TouchableOpacity onPress={async () => {
                  startLoading();
                  // Simulate brief network fetch for smooth UX
                  await new Promise(r => setTimeout(r, 400));
                  setIsLyricsSheetVisible(true);
                  stopLoading();
                }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontStyle: 'italic', lineHeight: 18, marginBottom: 4 }} numberOfLines={3}>
                    {lyricsPreview}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {editedTrack.createdAt ? (
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
                  {formatRelativeTime(editedTrack.createdAt)}
                </Text>
              ) : null}
            </View>
          )}
        </View>
      </View>

      {/* Bottom Action Bar */}
      <PostFooter
        isLocal={isLocal}
        isLiked={isLiked}
        likesCount={likesCount ?? editedTrack.likesCount ?? 0}
        commentsCount={editedTrack.commentsCount ?? 0}
        viewsCount={viewsCount ?? editedTrack.viewsCount ?? 0}
        onLikePress={onLikePress}
        onCommentPress={() => setIsCommentSheetVisible(true)}
        rightContent={
          <MediaDownloadWrapper
            mediaUrl={editedTrack.audioUrl || editedTrack.coverUrl}
            mediaType={editedTrack.audioUrl ? 'audio' : 'image'}
            coverUrl={editedTrack.coverUrl}
            title={editedTrack.title}
            onDownloadSuccess={onDownloadPress}
          >
            {({ download, isDownloading }) => (
              <DownloadButton
                onPress={download}
                count={downloadsCount ?? editedTrack.downloadsCount ?? 0}
                isDownloading={isDownloading}
                disabled={isLocal}
                size={20}
                color="#FFF"
              />
            )}
          </MediaDownloadWrapper>
        }
        style={{ paddingHorizontal: 16 }}
      />

      <CommentSheet
        postId={editedTrack.id}
        visible={isCommentSheetVisible}
        onClose={() => setIsCommentSheetVisible(false)}
        onCommentAdded={() => {
          // Increment the comment count instantly
          const updatedTrack = {
            ...editedTrack,
            commentsCount: (editedTrack.commentsCount || 0) + 1
          };
          setEditedTrack(updatedTrack);
        }}
      />

      <LyricsSheet
        visible={isLyricsSheetVisible}
        onClose={() => setIsLyricsSheetVisible(false)}
        lyrics={editedTrack.lyrics || ''}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 12,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 20,
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 12,
  },
  tagButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tagButtonAdded: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  tagButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  }
});
