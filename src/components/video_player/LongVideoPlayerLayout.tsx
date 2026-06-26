import UserAvatar from '@/components/avatar/UserAvatar';
import { CommentSheet } from '@/components/comments/CommentSheet';
import { FollowUserButton } from '@/components/FollowUserButton';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme, useThemeStore } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { CommentAction } from '@/features/feed/components/CommentAction';
import { LikeAction } from '@/features/feed/components/LikeAction';
import { useRouter } from 'expo-router';
import { createVideoPlayer, VideoPlayer, VideoView } from 'expo-video';
import { ArrowLeft, Eye, MessageCircle, Search, Tag } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ListRenderItemInfo, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UpNextVideoFeed } from './UpNextVideoFeed';

// ─── Isolated video player ────────────────────────────────────────────────────
// Wrapped in React.memo so it NEVER re-renders when listData / renderItem change.
// On Android, even re-calling useVideoPlayer with the same URL can interrupt
// hardware codec playback, so we must ensure this sub-tree is completely stable.
interface VideoPlayerSectionProps {
  videoUrl: string;
  style: any;
  containerStyle: any;
  shouldPlay: boolean;
}
const VideoPlayerSection = React.memo(({ videoUrl, style, containerStyle, shouldPlay }: VideoPlayerSectionProps) => {
  const playerRef = useRef<VideoPlayer | null>(null);
  if (!playerRef.current) {
    const p = createVideoPlayer(videoUrl);
    p.loop = true;
    // Do NOT call p.play() here — the Modal animation hasn't finished yet.
    // Play is triggered by shouldPlay becoming true (via Modal onShow).
    playerRef.current = p;
  }

  // Start/stop playback based on whether the modal is fully open
  useEffect(() => {
    if (shouldPlay) {
      playerRef.current?.play();
    } else {
      playerRef.current?.pause();
    }
  }, [shouldPlay]);

  // Pause when unmounted (modal closed)
  useEffect(() => {
    return () => { playerRef.current?.pause(); };
  }, []);

  return (
    <View style={containerStyle}>
      <VideoView
        player={playerRef.current!}
        style={style}
        contentFit="contain"
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
});
// ─────────────────────────────────────────────────────────────────────────────

export interface LongVideoPlayerLayoutProps {
  videoUrl: string;
  title: string;
  director: string;
  description: string;
  isLocal: boolean;
  onClose: () => void;
  // Raw data + renderer — avoids passing a JSX element that remounts on every parent re-render
  listData: any[];
  renderItem: (info: ListRenderItemInfo<any>) => React.ReactElement | null;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;

  // New Interactive Props
  videoId?: string;
  directorId?: string;
  directorAvatarUrl?: string;
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isAdded?: boolean; // For tags
  tagsCount?: number;
  sourceTable?: string;
  onTagPress?: () => void;
}

export const LongVideoPlayerLayout = ({
  videoUrl,
  title,
  director,
  description,
  isLocal,
  onClose,
  listData,
  renderItem,
  onLoadMore,
  isLoadingMore,
  videoId,
  directorId,
  directorAvatarUrl,
  likesCount = 0,
  viewsCount = 0,
  commentsCount = 0,
  tagsCount = 0,
  isLiked: initialIsLiked = false,
  isAdded = false,
  sourceTable = 'posts',
  onTagPress,
}: LongVideoPlayerLayoutProps) => {
  const [localTitle, setLocalTitle] = useState(title);
  const [localDirector, setLocalDirector] = useState(director);
  const [localDescription, setLocalDescription] = useState(description);
  const [isLiked, setIsLiked] = useState(false);
  // Only start playback after the slide-in animation has fully completed.
  const [isReady, setIsReady] = useState(false);
  const [isCommentSheetVisible, setIsCommentSheetVisible] = useState(false);
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const { isMuted, setIsMuted } = useVideoMuteState();
  const router = useRouter();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const scale = useThemeStore((state) => state.scale);

  // useCallback ensures renderHeader reference is stable — prevents FlatList
  // from re-mounting the header on every parent re-render.
  const renderHeader = useCallback(() => (
    <View style={{ paddingBottom: 16 }}>
      {/* Video Details */}
      <View style={styles.detailsContainer}>
        {/* User Row (Avatar + Username) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ marginRight: 10 }}>
            <UserAvatar
              userId={directorId || ''}
              fallbackUrl={directorAvatarUrl || ''}
              name={director}
              size={36 * scale}
              onTap={() => {
                if (!isLocal && directorId) {
                  onClose();
                  setTimeout(() => {
                    router.push(`/profile/${directorId}`);
                  }, 300);
                }
              }}
            />
          </View>
          {isLocal ? (
            <TextInput
              style={[styles.videoTitle, styles.inputField, { flex: 1, marginTop: 0, paddingVertical: 0, borderBottomWidth: 0 }]}
              value={localDirector}
              onChangeText={setLocalDirector}
              placeholder="Username"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          ) : (
            <Text style={[styles.videoTitle, { flex: 1 }]} numberOfLines={1}>{director}</Text>
          )}
          {!isLocal && directorId && (
            <FollowUserButton targetUserId={directorId} size="small" style={{ marginLeft: 12 }} />
          )}
        </View>

        {/* Description Box */}
        <View style={styles.descriptionBox}>
          {isLocal ? (
            <TextInput
              style={[styles.descriptionText, styles.inputField]}
              value={localDescription}
              onChangeText={setLocalDescription}
              placeholder="Add a description..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
            />
          ) : (
            <Text style={styles.descriptionText}>{description}</Text>
          )}
        </View>

        {/* Actions Row */}
        {!isLocal && videoId && (
          <PostInteractionWrapper
            postId={videoId}
            initialLikesCount={likesCount}
            initialViewsCount={viewsCount}
            initialIsLiked={initialIsLiked}
            sourceTable={sourceTable}
          >
            {(interactionState) => (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsScroll}>
                <View style={styles.actionBtnWrapper}>
                  <LikeAction
                    initialLikes={interactionState.likesCount}
                    initialIsLiked={interactionState.isLiked}
                    size={20}
                    direction="row"
                    onPress={() => { }} // Wrapper handles optimistic state, LikeAction handles DB update
                  />
                </View>

                <View style={styles.actionBtnWrapper}>
                  <CommentAction
                    icon={MessageCircle}
                    label={commentsCount.toString()}
                    size={20}
                    direction="row"
                    onPress={() => setIsCommentSheetVisible(true)}
                  />
                </View>

                <View style={styles.actionBtnWrapper}>
                  {onTagPress ? (
                    <TouchableOpacity activeOpacity={0.8}
                      style={[styles.actionBadge, isAdded && { backgroundColor: theme.colors.text }]}
                      onPress={onTagPress}
                    >
                      <Tag color={isAdded ? theme.colors.background : theme.colors.text} size={18} />
                      <Text style={[styles.actionText, isAdded && { color: theme.colors.background }]}>
                        {isAdded ? "Tagged" : "Tag"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <CommentAction
                      icon={Tag}
                      label={tagsCount.toString()}
                      size={20}
                      direction="row"
                      onPress={() => setTagOverlayVisible(true)}
                    />
                  )}
                </View>

                <View style={styles.actionBtnWrapper}>
                  <CommentAction
                    icon={Eye}
                    label={interactionState.viewsCount.toString()}
                    size={20}
                    direction="row"
                  />
                </View>
              </ScrollView>
            )}
          </PostInteractionWrapper>
        )}
      </View>
    </View>
  ), [localTitle, localDirector, localDescription, isLocal, isLiked, title, director, description]);

  return (
    <Modal
      visible={true}
      animationType="slide"
      onRequestClose={onClose}
      onShow={() => setIsReady(true)}
    >
      <SafeAreaView style={styles.container}>
        {/* Top bar (Back, Search) — must sit above the collapsible header */}
        <View style={[styles.header, { zIndex: 20, backgroundColor: theme.colors.background }]}>
          <TouchableOpacity activeOpacity={0.8} style={styles.backBtn} onPress={onClose}>
            <ArrowLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}></Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.searchBtn}>
            <Search color={theme.colors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* Video Player — must sit above the collapsible header so it hides behind it */}
        <VideoPlayerSection
          videoUrl={videoUrl}
          containerStyle={[styles.videoContainer, { zIndex: 20, backgroundColor: theme.colors.background }]}
          style={styles.videoPlayer}
          shouldPlay={isReady}
        />

        {/* Stable FlatList — owned by this component so data updates don't remount it */}
        <FlatList
          data={listData}
          keyExtractor={(item: any) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={
            <>
              {(!listData || listData.length === 0) && videoId && !isLocal ? (
                <UpNextVideoFeed
                  currentVideoId={videoId}
                  onVideoPress={(params) => {
                    onClose();
                    setTimeout(() => {
                      router.push({
                        pathname: '/video-player',
                        params: {
                          videoUrl: params.videoUrl,
                          title: params.title,
                          director: params.director,
                          description: params.description,
                          isLocal: String(params.isLocal),
                        }
                      });
                    }, 300);
                  }}
                />
              ) : null}
              {isLoadingMore ? (
                <View style={{ paddingVertical: 20 }}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
              ) : null}
            </>
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.1}
        />

        {videoId && (
          <CommentSheet
            postId={videoId}
            visible={isCommentSheetVisible}
            onClose={() => setIsCommentSheetVisible(false)}
            onCommentAdded={() => {
              // Usually handled by refetching or local state. The action badge handles static updates for now
            }}
          />
        )}
        <TagOverlay
          visible={tagOverlayVisible}
          onClose={() => setTagOverlayVisible(false)}
          postId={videoId ?? ''}
          sourceChannelId={sourceTable === 'channel_posts' ? '' : ''}
          linkChain={[]}
        />
      </SafeAreaView>
    </Modal>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16 * scale,
    paddingVertical: 12 * scale,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
  },
  backBtn: {
    padding: 4 * scale,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 20 * scale,
    fontWeight: '700' as const,
  },
  searchBtn: {
    padding: 4 * scale,
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.background,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16 * scale,
  },
  videoTitle: {
    color: colors.text,
    fontSize: 20 * scale,
    fontWeight: '700' as const,
    lineHeight: 28 * scale,
  },
  videoSubtitle: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    marginTop: 4 * scale,
  },
  actionsScroll: {
    paddingVertical: 16 * scale,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  actionBtnWrapper: {
    marginRight: 24 * scale,
  },
  actionBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 16 * scale,
    paddingVertical: 8 * scale,
    borderRadius: 20 * scale,
  },
  actionText: {
    color: colors.text,
    marginLeft: 6 * scale,
    fontSize: 14 * scale,
    fontWeight: '600' as const,
  },
  channelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 12 * scale,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.surfaceVariant,
    marginBottom: 16 * scale,
  },
  channelInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  channelAvatar: {
    width: 40 * scale,
    height: 40 * scale,
    borderRadius: 20 * scale,
    marginRight: 12 * scale,
    backgroundColor: colors.surfaceVariant,
  },
  channelName: {
    color: colors.text,
    fontSize: 16 * scale,
    fontWeight: '600' as const,
  },
  subCount: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    marginTop: 2 * scale,
  },
  followBtn: {
    backgroundColor: colors.text,
    paddingHorizontal: 16 * scale,
    paddingVertical: 6 * scale,
    borderRadius: 20 * scale,
    marginLeft: 12 * scale,
  },
  followText: {
    color: colors.background,
    fontWeight: '700' as const,
    fontSize: 13 * scale,
  },
  descriptionBox: {
    marginTop: 4 * scale,
    marginBottom: 8 * scale,
  },
  descriptionText: {
    color: colors.text,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceVariant,
    paddingVertical: 2 * scale,
    marginTop: 2 * scale,
  },
});
function useVideoMuteState(): { isMuted: any; setIsMuted: any; } {
  throw new Error('Function not implemented.');
}

