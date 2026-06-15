import { MediaChips } from '@/components/mediaChips/MediaChips';
import { PermissionDialog } from '@/components/ui/PermissionDialog';
import { LongVideoPlayerLayout } from '@/components/video_player/LongVideoPlayerLayout';
import { useLocalVideos } from '@/features/boxes/application/useLocalVideos';
import { dummyMovieBoxPost } from '@/features/boxes/data/dummyMovieBoxData';
import { useRouter } from 'expo-router';
import { ArrowLeft, Film, Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewToken
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateShortVideoButton } from '@/components/short/CreateShortVideoButton';
import { CreateShortVideoPage } from '@/components/short/CreateShortVideoPage';
import { PhoneMusicWidget } from '../music_posting/widgets/PhoneMusicWidget';
import { MovieListTile } from './tiles/MovieListTile';
import { VideoFeedPage } from '@/video/pages/VideoFeedPage';
import { useVideoFeedStore } from './store/useVideoFeedStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useInteractionStore } from '@/core/store/useInteractionStore';

export const MoviePostingPage = ({ boxId }: { boxId: string }) => {
  const router = useRouter();
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
    setSelectedAlbum
  } = useLocalVideos();
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
      useVideoFeedStore.getState().resetFeed();
      loadGlobalVideos(boxId);
    }
  }, [boxId]);

  const handleToggleTag = async (track: any) => {
    if (!boxId || !track?.id) return;
    
    useInteractionStore.getState().toggleTag(track.id, boxId);

    try {
      const { data, error } = await supabase.rpc('tag_post_to_box', {
        p_post_id: track.id,
        p_box_id: boxId
      });

      if (error) throw error;
    } catch (e: any) {
      console.error("[MoviePostingPage] Failed to toggle tag for box:", e);
      useInteractionStore.getState().toggleTag(track.id, boxId); // Revert UI on error
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

  const renderModalItem = useCallback(({ item }: { item: any }) => (
    <MovieListTile
      video={item}
      onAddPress={() => handleToggleTag(item)}
      onVideoPress={(params) => setSelectedVideoParams(params)}
      isAdded={tags[boxId]?.includes(item.id)}
      disableVideoPlayer
      isCurrentlyPlaying={false}
    />
  ), [tags, boxId]);

  isModalOpenRef.current = selectedVideoParams !== null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
        <MediaChips
          activeTabIndex={1}
          selectedAlbum={selectedAlbum}
          onAlbumSelected={(albumId) => {
            setSelectedAlbum(albumId);
            setExpandedWidgets([]);
            loadLocalVideo(albumId, undefined, true);
          }}
        />
      )}

      {isInitialLoad && tracks.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#E50914" />
      ) : (
        <FlatList
          data={filteredTracks}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={({ item, index }) => (
            <View>
              <MovieListTile
                video={item}
                onAddPress={() => handleToggleTag(item)}
                onVideoPress={(params) => {
                  setSelectedVideoParams(params);
                }}
                isAdded={tags[boxId]?.includes(item.id)}
                isCurrentlyPlaying={selectedVideoParams ? false : item.id === currentlyPlayingId}
              />
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
          ListFooterComponent={() => isLoadingGlobal ? <ActivityIndicator size="small" color="#FFF" style={{ margin: 20 }} /> : null}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  }
});
