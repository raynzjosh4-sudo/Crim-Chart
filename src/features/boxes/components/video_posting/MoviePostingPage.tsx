import { AlbumSelectorModal } from '@/components/posting/widgets/AlbumSelectorModal';
import { MoviePostingItemShimmer, MoviePostingPageShimmer } from '@/components/shimmers/MoviePostingShimmer';
import { CreateShortVideoButton } from '@/components/short/CreateShortVideoButton';
import { CreateShortVideoPage } from '@/components/short/CreateShortVideoPage';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { PermissionDialog } from '@/components/ui/PermissionDialog';
import { LongVideoPlayerLayout } from '@/components/video_player/LongVideoPlayerLayout';
import { GeneralVideoPlayer } from '@/components/video_player/players/GeneralVideoPlayer';
import { ShortVideoPlayer } from '@/components/video_player/players/ShortVideoPlayer';
import { BoxReactionRecorderWrapper } from '@/components/wrappers/BoxReactionRecorderWrapper';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useLocalVideos } from '@/features/boxes/application/useLocalVideos';
import { useVideoUpload } from '@/features/boxes/application/useVideoUpload';
import { VideoFeedPage } from '@/video/pages/VideoFeedPage';
import { useRouter } from 'expo-router';
import { ArrowLeft, Film, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PhoneMusicWidget } from '../music_posting/widgets/PhoneMusicWidget';
import { useVideoFeedStore } from './store/useVideoFeedStore';

export const MoviePostingPage = ({ boxId, isInline, onCloseInline }: { boxId: string; isInline?: boolean; onCloseInline?: () => void }) => {
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocalOnly, setShowLocalOnly] = useState<boolean>(false);
  const [isCreateShortOpen, setIsCreateShortOpen] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [selectedVideoParams, setSelectedVideoParams] = useState<any>(null);

  const tags = useInteractionStore(state => state.tags);

  const { globalVideos, isLoadingGlobal, hasMoreGlobal, isInitialLoad, loadGlobalVideos } = useVideoFeedStore();

  const {
    localVideos,
    loadLocalVideo,
    showPermissionDialog,
    setShowPermissionDialog,
    needsSettings,
    handlePermissionConfirm,
    hasMoreLocalVideos,
    isLoading,
    selectedAlbum,
    setSelectedAlbum,
    setLocalVideos
  } = useLocalVideos();

  const { isUploading, uploadVideoToBox } = useVideoUpload();
  const tracks = [...globalVideos, ...localVideos.map(v => ({
    id: v.id,
    title: v.title || 'Local Video',
    director: 'You',
    thumbnailUrl: v.thumbnailUrl || '',
    videoUrl: v.videoUrl,
    isShort: true, // Local videos from camera roll can be played as shorts
    description: v.title || '',
    duration: v.duration,
    likes: 0,
    dislikes: 0,
    commentsCount: 0,
    viewsCount: 0,
    addedBy: {
      id: 'local_user',
      name: 'You',
      avatarUrl: ''
    }
  }))];

  const [expandedWidgets, setExpandedWidgets] = useState<number[]>([]);

  // 1. Fetch existing tags for this box
  useEffect(() => {
    const fetchExistingTags = async () => {
      if (!boxId) return;
      try {
        const { data, error } = await supabase
          .from('box_items')
          .select('post_id')
          .eq('box_id', boxId);

        if (!error && data) {
          const newTags = new Set(useInteractionStore.getState().tags[boxId] || []);
          data.forEach(item => newTags.add(item.post_id));
          useInteractionStore.setState(prev => ({
            tags: {
              ...prev.tags,
              [boxId]: Array.from(newTags)
            }
          }));
        }
        setSearchQuery('');
      } catch (e: any) {
        console.error("[MoviePostingPage] Failed to toggle tag for box (Exception):", e);
      }
    };
    fetchExistingTags();
  }, [boxId]);

  useEffect(() => {
    if (boxId) {
      if (useVideoFeedStore.getState().globalVideos.length === 0) {
        loadGlobalVideos(boxId);
      } else {
        const ids = useVideoFeedStore.getState().globalVideos.map(v => v.id);
        useInteractionStore.getState().syncPostInteractions(ids, boxId);
      }
    }
  }, [boxId]);

  const handleToggleTag = async (track: any) => {
    console.log(`\n==========================================`);
    console.log(`🏷️ [MoviePostingPage] handleToggleTag called!`);
    console.log(`   - Track ID: ${track?.id}`);
    console.log(`   - Box ID: ${boxId}`);

    if (!boxId || !track?.id) {
      console.log(`❌ [MoviePostingPage] Missing boxId or track.id, aborting tag.`);
      return;
    }

    console.log(`🔄 [MoviePostingPage] Optimistically toggling tag in store...`);
    useInteractionStore.getState().toggleTag(track.id, boxId);

    try {
      console.log(`📡 [MoviePostingPage] Sending 'tag_post_to_box' RPC to Supabase...`);
      const { data, error } = await supabase.rpc('tag_post_to_box', {
        p_post_id: track.id,
        p_box_id: boxId
      });

      if (error) {
        console.log(`❌ [MoviePostingPage] RPC Error:`, error);
        throw error;
      }
      console.log(`✅ [MoviePostingPage] Successfully tagged post to box! RPC Response:`, data);
      console.log(`==========================================\n`);
    } catch (e: any) {
      console.error("🚨 [MoviePostingPage] Failed to toggle tag for box:", e);
      console.log(`⏪ [MoviePostingPage] Reverting optimistic UI update due to error.`);
      useInteractionStore.getState().toggleTag(track.id, boxId); // Revert UI on error
    }
  };

  const handleAddVideo = async (track: any) => {
    console.log(`🚀 [MoviePostingPage] Starting handleAddVideo for track:`, track.id);
    const finalVideo = await uploadVideoToBox(track, boxId);

    if (finalVideo) {
      console.log(`✅ [MoviePostingPage] Successfully uploaded and tagged video! Removing from local queue.`);
      // 1. Remove it from the local tracks so it doesn't appear twice
      setLocalVideos(localVideos.filter(t => t.id !== track.id));

      console.log(`🔝 [MoviePostingPage] Injecting new video to the top of the global feed.`);
      // 2. Inject the fully uploaded global track into the top of the feed
      useVideoFeedStore.getState().addVideoToTop(finalVideo);

      // 3. Switch back to global feed if we were on local only
      if (showLocalOnly) {
        console.log(`🔄 [MoviePostingPage] Switching back to global feed view.`);
        setShowLocalOnly(false);
      }
    } else {
      console.log(`❌ [MoviePostingPage] uploadVideoToBox returned null. Upload failed.`);
      ChartToast.showErrorSimple("Upload Failed", "Failed to upload video. Please try again.");
    }
  };

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.director.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocal = showLocalOnly ? t.addedBy?.id === 'local_user' : true;
    return matchesSearch && matchesLocal;
  });

  const viewabilityConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 50
  }).current;

  const isModalOpenRef = useRef(false);

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (isModalOpenRef.current) return;
    const visibleItem = viewableItems.find((v: any) => v.isViewable && v.item);
    if (visibleItem) {
      setCurrentlyPlayingId(visibleItem.item.id);
    } else {
      setCurrentlyPlayingId(null);
    }
  }).current;

  const renderModalItem = useCallback(({ item }: { item: any }) => {
    const PlayerComponent = item.isShort ? ShortVideoPlayer : GeneralVideoPlayer;
    return (
      <PlayerComponent
        video={item}
        onAddPress={async (editedTitle?: string) => {
          if (item.addedBy?.id === 'local_user') {
            const updatedItem = { ...item, title: editedTitle || item.title };
            await handleAddVideo(updatedItem);
          } else {
            await handleToggleTag(item);
          }
        }}
        onVideoPress={(params) => setSelectedVideoParams(params)}
        isAdded={tags[boxId]?.includes(item.id)}
        disableVideoPlayer
      />
    );
  }, [tags, boxId]);

  isModalOpenRef.current = selectedVideoParams !== null;

  const content = (
    <View style={isDesktop && isInline ? styles.desktopModal : styles.container}>
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="small" color="#FACD11" />
          <Text style={styles.uploadingText}>Uploading Video...</Text>
        </View>
      )}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backButton}
          onPress={() => isInline && onCloseInline ? onCloseInline() : router.back()}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={20} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowLocalOnly(!showLocalOnly)}
          activeOpacity={0.7}
        >
          <View style={[styles.radioOuter, showLocalOnly && styles.radioOuterSelected]}>
            {showLocalOnly && <View style={styles.radioInner} />}
          </View>
          <Text style={styles.filterText}>Show local videos only</Text>
        </TouchableOpacity>

        <CreateShortVideoButton onPress={() => setIsCreateShortOpen(true)} />
      </View>

      {showLocalOnly && (
        <View style={{ paddingHorizontal: 16, marginBottom: 12, alignItems: 'flex-start' }}>
          <AlbumSelectorModal
            activeTabIndex={1}
            selectedAlbum={selectedAlbum}
            onAlbumSelected={(albumId) => {
              setSelectedAlbum(albumId);
              setExpandedWidgets([]);
              loadLocalVideo(albumId, undefined, true);
            }}
          />
        </View>
      )}

      {isInitialLoad && tracks.length === 0 ? (
        <MoviePostingPageShimmer />
      ) : (
        <FlatList
          data={filteredTracks}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <View>
              <PostInteractionWrapper
                postId={item.id}
                initialLikesCount={item.likes}
                initialViewsCount={item.viewsCount}
                initialDownloadsCount={0}
              >
                {({ isLiked, likesCount, viewsCount, downloadsCount }) => (
                  <BoxReactionRecorderWrapper boxId={boxId} postId={item.id} reactionType="tag">
                    {({ recordReaction }) => {
                      const PlayerComponent = item.isShort ? ShortVideoPlayer : GeneralVideoPlayer;
                      return (
                        <PlayerComponent
                          video={{ ...item, likes: likesCount, viewsCount: viewsCount }}
                          onAddPress={async (editedTitle?: string) => {
                            const updatedItem = { ...item, title: editedTitle || item.title };
                            await handleAddVideo(updatedItem);
                          }}
                          onTagPress={async () => {
                            await handleToggleTag(item);
                            recordReaction();
                          }}
                          onVideoPress={(params) => {
                            setSelectedVideoParams(params);
                          }}
                          isAdded={tags[boxId]?.includes(item.id)}
                          isLiked={isLiked}
                          onLikePress={() => useInteractionStore.getState().toggleLike(item.id)}
                        />
                      );
                    }}
                  </BoxReactionRecorderWrapper>
                )}
              </PostInteractionWrapper>
              {((index + 1) % 10 === 0 || (index === filteredTracks.length - 1 && filteredTracks.length < 10)) && hasMoreLocalVideos && (
                <View style={{ marginBottom: 24 }}>
                  <PhoneMusicWidget
                    isExpanded={expandedWidgets.includes(index)}
                    onPress={() => {
                      if (!expandedWidgets.includes(index)) {
                        setExpandedWidgets([...expandedWidgets, index]);
                        loadLocalVideo();
                      }
                    }}
                  />
                </View>
              )}
            </View>
          )}
          onEndReached={() => {
            if (!showLocalOnly && hasMoreGlobal) {
              loadGlobalVideos(boxId);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => isLoadingGlobal ? <MoviePostingItemShimmer /> : null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No videos found</Text>
              {hasMoreLocalVideos && (
                <View style={{ marginTop: 24, width: '100%' }}>
                  <PhoneMusicWidget
                    isExpanded={expandedWidgets.includes(-2)}
                    onPress={() => {
                      if (!expandedWidgets.includes(-2)) {
                        setExpandedWidgets([...expandedWidgets, -2]);
                        loadLocalVideo();
                      }
                    }}
                  />
                </View>
              )}
            </View>
          }
        />
      )}

      {selectedVideoParams && (
        <React.Fragment key={selectedVideoParams.videoUrl}>
          {selectedVideoParams.isShort ? (
            <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedVideoParams(null)}>
              <VideoFeedPage
                initialVideos={filteredTracks.filter(t => t.isShort).map(t => ({
                  id: t.id,
                  postId: t.id,
                  videoUrl: t.videoUrl,
                  caption: t.description,
                  authorId: t.addedBy?.id || 'unknown',
                  authorName: t.director || t.addedBy?.name || 'Unknown',
                  authorAvatarUrl: t.addedBy?.avatarUrl,
                  likesCount: t.likes || 0,
                  commentsCount: t.commentsCount || 0,
                  isLiked: false,
                  createdAt: new Date(),
                  sharesCount: 0,
                  isCompetition: false,
                  chartPoints: 0,
                  isCharted: false,
                  tagsCount: 0
                }))}
                initialIndex={Math.max(0, filteredTracks.filter(t => t.isShort).findIndex(t => t.id === selectedVideoParams.id))}
                showBack={true}
                onBack={() => setSelectedVideoParams(null)}
                disableInteractions={true}
              />
            </Modal>
          ) : (
            <LongVideoPlayerLayout
              videoUrl={selectedVideoParams.videoUrl}
              title={selectedVideoParams.title}
              director={selectedVideoParams.director}
              description={selectedVideoParams.description}
              isLocal={selectedVideoParams.isLocal}
              onClose={() => setSelectedVideoParams(null)}
              listData={filteredTracks}
              renderItem={renderModalItem}
              onLoadMore={hasMoreLocalVideos ? loadLocalVideo : undefined}
              isLoadingMore={isLoading}
            />
          )}
        </React.Fragment>
      )}

      {/* Create Short Modal */}
      <Modal visible={isCreateShortOpen} animationType="slide" onRequestClose={() => setIsCreateShortOpen(false)}>
        <CreateShortVideoPage onClose={() => setIsCreateShortOpen(false)} />
      </Modal>

      <PermissionDialog
        visible={showPermissionDialog}
        icon={<Film size={24} color="#FFF" />}
        title="Permission Required"
        description={needsSettings ? "Media access is required to load local videos. Please enable it in Settings." : "Please allow media access to load local videos."}
        cancelText="Cancel"
        confirmText={needsSettings ? "Open Settings" : "OK"}
        onCancel={() => setShowPermissionDialog(false)}
        onConfirm={handlePermissionConfirm}
      />
    </View>
  );

  if (isDesktop && isInline) {
    return (
      <View style={styles.modalBackground}>
        {content}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  desktopModal: {
    width: 600,
    height: '80%',
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    paddingRight: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioOuterSelected: {
    borderColor: '#E50914',
    backgroundColor: '#E50914',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  filterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 40,
  },
  tileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 100,
    height: 56, // 16:9 aspect ratio
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
  },
  tileInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  tileTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  tileSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#E50914',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginLeft: 12,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(25, 25, 25, 0.95)',
    zIndex: 100,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  uploadingText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 12,
  }
});
