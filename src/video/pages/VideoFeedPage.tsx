import ThreadDiscussionSheet from '@/channel/channelmemberdata/thread/ThreadDiscussionSheet';
import CommentInputField from '@/commentingsheets/widgets/CommentInputField';
import { MediaData } from '@/components/media/types';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions, FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoPost } from '../models/VideoPost';
import { VideoFeedCard } from '../widgets/VideoFeedCard';

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
  const router = useRouter();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<VideoFeedTab>(initialTab);
  const [videos, setVideos] = useState<VideoPost[]>(initialVideos ?? []);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialVideos?.length);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaData[]>([]);

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
    setIsLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          id, caption, video_url, is_video,
          likes_count, comments_count, created_at,
          profiles:author_id (id, display_name, profile_image_url),
          channels:channel_id (id, name)
        `)
        .eq('is_video', true)
        .order('created_at', { ascending: false })
        .limit(30);

      if (channelId) query = query.eq('channel_id', channelId);

      const { data, error } = await query;
      if (error) throw error;

      const mapped = (data ?? []).map((row: any): VideoPost => ({
        id: row.id,
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
  }, [channelId]);

  React.useEffect(() => {
    if (!initialVideos?.length) loadVideos();
  }, []);

  const onViewableChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  });

  if (isLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#FACD11" size="large" />
      </View>
    );
  }

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
        <FlatList
          ref={flatListRef}
          data={videos}

          keyExtractor={item => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <VideoFeedCard
              video={item}
              isPlaying={index === currentIndex && !isCommentsOpen}
              isShrunken={isCommentsOpen && index === currentIndex}
              hideBottomInput={!showBack}
              disableInteractions={disableInteractions}
              onComment={() => setIsCommentsOpen(true)}
              onShrunkenTap={() => setIsInputModalOpen(true)}
            />
          )}
          onViewableItemsChanged={onViewableChanged.current}
          viewabilityConfig={{ itemVisiblePercentThreshold: 80 }}
          getItemLayout={(_, index) => ({
            length: SCREEN_H,
            offset: SCREEN_H * index,
            index,
          })}
          initialScrollIndex={initialIndex}
        />
      </Animated.View>

      {/* Top overlay */}
      {!isCommentsOpen && (
        <View style={styles.topOverlay} pointerEvents="box-none">
          {showBack && (
            <TouchableOpacity
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
              <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as VideoFeedTab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabActive]}>
                  {tab}
                </Text>
                {activeTab === tab && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
          {!showBack && (
            <TouchableOpacity style={styles.backBtn}>
              <Search color="#FFF" size={24} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Comment dismiss backdrop */}
      {isCommentsOpen && (
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={() => setIsCommentsOpen(false)}
          activeOpacity={1}
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  loader: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  playerContainer: {
    overflow: 'hidden',
    alignSelf: 'center', // Starts centered, but animatedWidth handles layout
    marginTop: 0,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 52,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  backBtn: { padding: 8 },
  tabs: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 20 },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  tabActive: {
    color: '#FACD11',
    fontSize: 17,
    fontWeight: '800',
  },
  tabIndicator: {
    width: 20,
    height: 2.5,
    backgroundColor: '#FACD11',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 2,
  },
  commentsSheetWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_H * 0.75,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
});
