import CommentInputField from '@/commentingsheets/widgets/CommentInputField';
import { CommentSheet } from '@/components/comments/CommentSheet';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { ChartLinearLoader } from '@/components/loader/ChartLinearLoader';
import { MediaData } from '@/components/media/types';
import { VideoCardSkeleton } from '@/components/skeletons/Skeletons';
import { ShortVideoPlayerCard } from '@/components/video_player/ShortVideoPlayerCard';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { useStyles } from '@/core/hooks/useStyles';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { usePostingStore } from '@/core/store/usePostingStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { ThemeTokens } from '@/core/theme/themes';
import { useNetInfo } from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { Camera, ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedScrollList } from '../components/FeedScrollList';
import { VideoNetworkWidget } from '../components/VideoNetworkWidget';
import { useLocalGalleryVideos } from '../hooks/useLocalGalleryVideos';
import { VideoPost } from '../models/VideoPost';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

enum VideoFeedTab { explore = 'Explore', channel = 'Channel', friends = 'Friends' }

interface VideoFeedPageProps {
  initialIndex?: number;
  initialVideos?: VideoPost[];
  showBack?: boolean;
  channelId?: string;
  initialTab?: VideoFeedTab;
  onBack?: () => void;
  disableInteractions?: boolean;
  disablePagination?: boolean;
  onLoadMore?: () => void;
}

import { useRealtimePostInteractions } from '@/hooks/useRealtimePostInteractions';

export const VideoFeedPage: React.FC<VideoFeedPageProps> = ({
  initialIndex = 0,
  initialVideos,
  showBack = true,
  channelId,
  initialTab = VideoFeedTab.explore,
  onBack,
  disableInteractions = false,
  disablePagination = false,
  onLoadMore,
}) => {
  useRealtimePostInteractions();

  const router = useAppRouter();
  const navigation = useNavigation();
  const { startLoading, stopLoading, activeRequests } = useGlobalProgress();
  const [videos, setVideos] = useState<VideoPost[]>(initialVideos ?? []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialVideos?.length);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaData[]>([]);
  const insets = useSafeAreaInsets();
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();
  const [isReady, setIsReady] = useState(false);
  const [containerHeight, setContainerHeight] = useState(SCREEN_H);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const offsetRef = useRef(0);
  const seedRef = useRef(Math.random());

  const netInfo = useNetInfo();
  const isOffline = netInfo.isConnected === false || netInfo.isInternetReachable === false;
  const { localVideos, fetchLocalVideos, isFetchingLocal } = useLocalGalleryVideos();
  const pendingPosts = usePostingStore(s => s.pendingPosts);

  // Map pending video posts to VideoPost so they appear instantly in the feed
  const pendingVideos: VideoPost[] = React.useMemo(() => {
    return pendingPosts
      .filter(p => p.isPending && p.isVideo)
      .map((p): VideoPost => ({
        id: p.id,
        postId: p.id,
        videoUrl: p.videoUrl || '',
        caption: p.title || '',
        authorId: p.addedBy?.id || '',
        authorName: p.addedBy?.name || 'You',
        authorAvatarUrl: p.addedBy?.avatarUrl || '',
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        createdAt: new Date(p.createdAt || Date.now()),
        isCompetition: false,
        chartPoints: 0,
        isCharted: false,
        sharesCount: 0,
        tagsCount: 0,
        sourceType: p.sourceTable === 'channel_posts' ? 'channel_post' : 'post',
        isPending: true,
      }));
  }, [pendingPosts]);

  console.log(`[VideoFeedPage] 🔄 Render cycle! isReady=${isReady}, isLoading=${isLoading}`);

  React.useEffect(() => {
    console.log('[VideoFeedPage] ⏳ Component mounted. Starting 100ms timer for isReady...');
    const timer = setTimeout(() => {
      console.log('[VideoFeedPage] ⏰ Timer finished, setting isReady to true');
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (initialVideos && initialVideos.length > 0) {
      setVideos(initialVideos);
    }
  }, [initialVideos]);

  const openImagePicker = () => {
    setIsInputModalOpen(false);
    navigation.navigate('FirstPostMainPage', {
      isManifestoContext: true,
      onMediaSelected: (items: MediaData[]) => {
        setSelectedMedia([...selectedMedia, ...items]);
        setIsInputModalOpen(true);
      }
    });
  };

  const flatListRef = useRef<any>(null);
  const shrinkAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(shrinkAnim, {
      toValue: isCommentsOpen ? 1 : 0,
      duration: 450,
      useNativeDriver: false, // Animating width/height
    }).start();
  }, [isCommentsOpen]);

  const loadVideos = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) {
      if (isFetchingMore) return;
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
      offsetRef.current = 0;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        return;
      }

      const { data, error } = await supabase.rpc('get_short_video_feed_with_data', {
        p_user_id: session.user.id,
        p_limit: 30,
        p_offset: offsetRef.current,
        p_seed: Math.random(),
      });

      if (error) {
        throw error;
      }

      const mapped = (data ?? []).map((row: any, index: number): VideoPost => {
        // 1. Safely determine the real post ID regardless of the RPC column name
        const realPostId = row.entity_id || row.post_id || row.id;

        // 2. Guarantee a strictly unique ID for the FlatList key
        const uniqueListKey = row.pointer_id || `${realPostId}-${offsetRef.current + index}`;

        // Safely parse videoUrls for Web MP4 fallback
        let videoUrls: string[] | undefined = undefined;
        if (row.video_urls) {
          try {
            videoUrls = typeof row.video_urls === 'string' ? JSON.parse(row.video_urls) : row.video_urls;
          } catch (e) { }
        }

        return {
          id: uniqueListKey,
          postId: realPostId,
          videoUrl: row.video_url ?? '',
          videoUrls: videoUrls,
          caption: row.caption,
          authorId: row.profiles?.id ?? '',
          authorName: row.profiles?.display_name ?? 'User',
          authorAvatarUrl: row.profiles?.profile_image_url,
          channelId: row.channels?.id,
          channelName: row.channels?.name,
          likesCount: row.likes_count ?? 0,
          commentsCount: row.comments_count ?? 0,
          isLiked: false,
          createdAt: new Date(row.created_at || Date.now()),
          isCompetition: false,
          chartPoints: 0,
          isCharted: false,
          sharesCount: 0,
          tagsCount: row.tags_count ?? 0,
          sourceType: row.source_type || 'post',
        };
      });

      offsetRef.current += mapped.length;

      setVideos(((prevVideos: VideoPost[]) => {
        const combined = isLoadMore ? [...prevVideos, ...mapped] : mapped;
        // Create a clean array where duplicate postIds are ignored
        return combined.filter((item, index, self) =>
          index === self.findIndex((t) => t.postId === item.postId)
        );
      }) as any);

      const postIds = mapped.map(v => v.postId);

      // Fetch missing video_urls for Web MP4 fallback
      if (postIds.length > 0) {
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, video_urls')
          .in('id', postIds);

        if (postsData) {
          const postsMap = new Map(postsData.map((p: any) => [p.id, p]));
          mapped.forEach(m => {
            const p = postsMap.get(m.postId) as any;
            if (p && p.video_urls && !m.videoUrls) {
              try {
                m.videoUrls = typeof p.video_urls === 'string' ? JSON.parse(p.video_urls) : p.video_urls;
              } catch (e) { }
            }
          });
        }
        useInteractionStore.getState().syncPostInteractions(postIds);
      }
    } catch (e) {
      console.error('[VideoFeedPage] Fatal Error loading videos:', e);
    } finally {
      if (isLoadMore) {
        setIsFetchingMore(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [channelId, isFetchingMore]);

  React.useEffect(() => {
    if (isReady && (!initialVideos || initialVideos.length === 0)) {
      if (!isOffline) {
        loadVideos();
      }
    }
  }, [loadVideos, initialVideos, isReady, isOffline]);

  React.useEffect(() => {
    if (isOffline) {
      if (localVideos.length === 0 && !isFetchingLocal) {
        fetchLocalVideos();
      }
    }
  }, [isOffline, fetchLocalVideos, localVideos.length, isFetchingLocal]);

  const displayVideos = React.useMemo(() => {
    const base = isOffline ? localVideos : videos;
    // Prepend pending (optimistic) videos that aren't already in the list
    const pendingFiltered = pendingVideos.filter(
      p => !base.some(v => v.id === p.id)
    );
    return [...pendingFiltered, ...base];
  }, [isOffline, localVideos, videos, pendingVideos]);

  const renderVideoItem = useCallback(({ item, index }: { item: VideoPost, index: number }) => {
    let preloadStatus: 'playing' | 'preloading' | 'idle' = 'idle';
    if (index === currentIndex) {
      preloadStatus = isCommentsOpen ? 'preloading' : 'playing'; // keeps it buffered but paused when comments are open
    } else if (index >= currentIndex - 1 && index <= currentIndex + 2) {
      preloadStatus = 'preloading';
    }

    return (
      <View style={{ width: SCREEN_W, height: containerHeight }}>
        <ShortVideoPlayerCard
          video={item}
          preloadStatus={preloadStatus}
          isShrunken={isCommentsOpen && index === currentIndex}
          hideBottomInput={!showBack}
          disableInteractions={disableInteractions || isOffline}
          onComment={() => {
            startLoading();
            setTimeout(() => {
              stopLoading();
              setIsCommentsOpen(true);
            }, 400);
          }}
          onShrunkenTap={() => setIsInputModalOpen(true)}
        />
      </View>
    );
  }, [currentIndex, isCommentsOpen, showBack, disableInteractions, containerHeight, isOffline, startLoading, stopLoading]);

  const onViewableChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  });

  const animatedWidth = shrinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_W, SCREEN_W * 0.4],
  });

  const animatedHeight = shrinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [containerHeight, containerHeight * 0.3],
  });

  const animatedRadius = shrinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const animatedCommentsBottom = shrinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_H * 0.75, 0],
  });

  const animatedShadowOpacity = shrinkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <View
      style={[styles.root, Platform.OS === 'web' ? { touchAction: 'none' } as any : {}]}
      onLayout={(e) => {
        // Only update if height changed significantly to prevent micro-stutters
        const h = e.nativeEvent.layout.height;
        if (Math.abs(h - containerHeight) > 10) {
          setContainerHeight(h);
        }
      }}
    >
      <View style={{ position: 'absolute', top: insets.top, left: 0, right: 0, zIndex: 9999 }}>
        <ChartLinearLoader isLoading={activeRequests > 0} />
      </View>
      <VideoNetworkWidget />
      <Animated.View style={[styles.playerContainer, {
        width: animatedWidth,
        height: animatedHeight,
        borderRadius: animatedRadius,
        shadowOpacity: animatedShadowOpacity,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 20,
        elevation: isCommentsOpen ? 10 : 0,
        backgroundColor: isCommentsOpen ? '#111' : '#000',
      }]}>
        {isReady ? (
          <FeedScrollList
            ref={flatListRef as any}
            data={displayVideos}
            itemHeight={containerHeight}
            keyExtractor={item => item.id}
            renderItem={renderVideoItem}
            onViewableItemsChanged={onViewableChanged.current}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            initialScrollIndex={initialIndex}
            getItemLayout={(data, index) => ({ length: containerHeight, offset: containerHeight * index, index })}
            onEndReached={() => {
              if (onLoadMore) {
                onLoadMore();
              } else if (!isOffline && !disablePagination) {
                loadVideos(true);
              }
            }}
            onEndReachedThreshold={0.5}
          />
        ) : null}
        {(!isReady || (isLoading && !isOffline) || (isOffline && isFetchingLocal)) && (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]}>
            <VideoCardSkeleton />
          </View>
        )}
      </Animated.View>

      {/* Top overlay */}
      {!isCommentsOpen && (
        <View style={[styles.topOverlay, { paddingTop: Math.max(insets.top, 10), justifyContent: 'flex-start' }]} pointerEvents="box-none">
          {showBack && (
            <TouchableOpacity onPress={onBack || (() => navigation.goBack())} style={styles.backBtn}>
              <ChevronLeft color={theme.colors.text} size={28} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Top Right Camera Icon */}
      {!isCommentsOpen && (
        <TouchableOpacity
          onPress={() => {
            // Using useRouter if available, otherwise fallback to React Navigation
            try {
              const { router } = require('expo-router');
              router.push('/short-creator');
            } catch (e) {
              (navigation as any).navigate('short-creator');
            }
          }}
          style={{ position: 'absolute', top: Math.max(insets.top, 10) + 10, right: 16, zIndex: 10, padding: 8, elevation: 10 }}
        >
          <Camera color={theme.colors.primary} size={30} />
        </TouchableOpacity>
      )}

      {/* Comment dismiss backdrop */}
      {isCommentsOpen && (
        <TouchableOpacity
          activeOpacity={1}
          style={StyleSheet.absoluteFillObject}
          onPress={() => setIsCommentsOpen(false)}
        />
      )}

      {/* Comments Sheet Sliding Up */}
      <Animated.View style={[
        styles.commentsSheetWrapper,
        { bottom: animatedCommentsBottom }
      ]}>
        {displayVideos.length > 0 && (
          <CommentSheet
            postId={displayVideos[currentIndex]?.postId || ''}
            visible={isCommentsOpen}
            isEmbedded={true}
            onClose={() => setIsCommentsOpen(false)}
          />
        )}
      </Animated.View>

      {/* Floating Input Modal */}
      <Modal
        visible={isInputModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsInputModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsInputModalOpen(false); }}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
          <SafeAreaView style={styles.modalContent} edges={['bottom']}>
            <View style={styles.modalHandle} />
            {selectedMedia.length > 0 && (
              <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8 }}>
                {selectedMedia.map((m, idx) => (
                  <View key={idx} style={{ marginRight: 8 }}>
                    <View style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                  </View>
                ))}
              </View>
            )}
            <CommentInputField
              controller={{ value: commentText, onChange: setCommentText }}
              autoFocus={true}
              onSend={(text) => {
                setCommentText('');
                setSelectedMedia([]);
                setIsInputModalOpen(false);
              }}
              isTikTokStyle={true}
              onImageTap={openImagePicker}
              hasMedia={selectedMedia.length > 0}
            />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number) => ({
  root: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background, justifyContent: 'center' as const, alignItems: 'center' as const },
  playerContainer: {
    overflow: 'hidden' as const,
    alignSelf: 'center' as const,
    marginTop: 0,
  },
  topOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8 * scale,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 10,
    elevation: 10,
  },
  backBtn: { padding: 8 * scale },
  tabs: { flex: 1, flexDirection: 'row' as const, justifyContent: 'center' as const, gap: 20 * scale },
  tabText: {
    color: colors.textSecondary,
    fontSize: 16 * scale,
    fontWeight: '600' as const,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  tabActive: {
    color: colors.primary,
    fontSize: 17 * scale,
    fontWeight: '800' as const,
  },
  tabIndicator: {
    width: 20 * scale,
    height: 2.5 * scale,
    backgroundColor: colors.primary,
    borderRadius: 2 * scale,
    alignSelf: 'center' as const,
    marginTop: 2 * scale,
  },
  commentsSheetWrapper: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    height: SCREEN_H * 0.75,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20 * scale,
    borderTopRightRadius: 20 * scale,
    paddingBottom: 8 * scale,
  },
  modalHandle: {
    width: 40 * scale,
    height: 4 * scale,
    backgroundColor: colors.muted,
    borderRadius: 2 * scale,
    alignSelf: 'center' as const,
    marginVertical: 12 * scale,
  },
});
