import ThreadDiscussionSheet from '@/channel/channelmemberdata/thread/ThreadDiscussionSheet';
import CommentInputField from '@/commentingsheets/widgets/CommentInputField';
import { MediaData } from '@/components/media/types';
import { VideoCardSkeleton } from '@/components/skeletons/Skeletons';
import { ShortVideoPlayerCard } from '@/components/video_player/ShortVideoPlayerCard';
import { useAppRouter } from '@/core/hooks/useAppRouter';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Search } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  InteractionManager
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoPost } from '../models/VideoPost';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

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
}

export const VideoFeedPage: React.FC<VideoFeedPageProps> = ({
  initialIndex = 0,
  initialVideos,
  showBack = true,
  channelId,
  initialTab = VideoFeedTab.explore,
  onBack,
  disableInteractions = false,
}) => {
  const router = useAppRouter();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<VideoFeedTab>(initialTab);
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

  React.useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

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

  const loadVideos = useCallback(async () => {
    if (!isReady) return;
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await supabase.rpc('get_short_video_feed_with_data', {
        p_user_id: session.user.id,
        p_tab: activeTab,
        p_limit: 30,
        p_offset: 0
      });

      if (error) throw error;

      const mapped = (data ?? []).map((row: any): VideoPost => ({
        id: row.pointer_id, // We use the pointer ID as the unique key in the FlatList
        postId: row.id,
        videoUrl: row.video_url ?? '',
        caption: row.caption,
        authorId: row.profiles?.id ?? '',
        authorName: row.profiles?.display_name ?? 'User',
        authorAvatarUrl: row.profiles?.profile_image_url,
        channelId: row.channels?.id,
        channelName: row.channels?.name,
        likesCount: row.likes_count ?? 0,
        commentsCount: row.comments_count ?? 0,
        isLiked: false,
        createdAt: new Date(row.created_at),
        isCompetition: false,
        chartPoints: 0,
        isCharted: false,
        sharesCount: 0,
        tagsCount: row.tags_count ?? 0,
      }));
      setVideos(mapped);
    } catch (e) {
      console.error('[VideoFeedPage]', e);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, activeTab]);

  React.useEffect(() => {
    if (isReady && (!initialVideos || initialVideos.length === 0)) {
      loadVideos();
    }
  }, [activeTab, loadVideos, initialVideos, isReady]);

  const renderVideoItem = useCallback(({ item, index }: { item: VideoPost, index: number }) => (
    <ShortVideoPlayerCard
      video={item}
      isPlaying={index === currentIndex && !isCommentsOpen}
      isShrunken={isCommentsOpen && index === currentIndex}
      hideBottomInput={!showBack}
      disableInteractions={disableInteractions}
      onComment={() => setIsCommentsOpen(true)}
      onShrunkenTap={() => setIsInputModalOpen(true)}
    />
  ), [currentIndex, isCommentsOpen, showBack, disableInteractions]);

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
    outputRange: [SCREEN_H, SCREEN_H * 0.3],
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
    <View style={styles.root}>
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
          <FlashList
            ref={flatListRef}
            data={videos}
            keyExtractor={item => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            renderItem={renderVideoItem}
            onViewableItemsChanged={onViewableChanged.current}
            viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
            initialScrollIndex={initialIndex}
          />
        ) : null}
        {(!isReady || isLoading) && (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000' }]}>
            <VideoCardSkeleton />
          </View>
        )}
      </Animated.View>

      {/* Top overlay */}
      {!isCommentsOpen && (
        <View style={[styles.topOverlay, { paddingTop: Math.max(insets.top, 20) + 12 }]} pointerEvents="box-none">
          {showBack && (
            <TouchableOpacity activeOpacity={1}
              style={styles.backBtn}
              onPress={() => {
                if (onBack) {
                  onBack();
                  return;
                }
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  router.back();
                }
              }}
            >
              <ChevronLeft color="#FFF" size={28} />
            </TouchableOpacity>
          )}
          <View style={styles.tabs}>
            {Object.values(VideoFeedTab).map(tab => (
              <TouchableOpacity activeOpacity={1} key={tab} onPress={() => setActiveTab(tab as VideoFeedTab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabActive]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
          {!showBack && (
            <TouchableOpacity activeOpacity={1} style={styles.backBtn}>
              <Search color={theme.colors.text} size={24} />
            </TouchableOpacity>
          )}
        </View>
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
        {videos.length > 0 && (
          <ThreadDiscussionSheet
            threadId={videos[currentIndex].id}
            channelId={channelId as string}
            channelName={videos[currentIndex].channelName}
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
