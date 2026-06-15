import { MediaChips } from '@/components/mediaChips/MediaChips';
import { PermissionDialog } from '@/components/ui/PermissionDialog';
import { LongVideoPlayerLayout } from '@/components/video_player/LongVideoPlayerLayout';
import { useLocalVideos } from '@/features/boxes/application/useLocalVideos';
import { dummyMovieBoxPost } from '@/features/boxes/data/dummyMovieBoxData';
import { useRouter } from 'expo-router';
import { ArrowLeft, Film, Search } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
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

export const MoviePostingPage = ({ boxId }: { boxId: string }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocalOnly, setShowLocalOnly] = useState<boolean>(false);
  const [isCreateShortOpen, setIsCreateShortOpen] = useState(false);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [selectedVideoParams, setSelectedVideoParams] = useState<any>(null);

  // Using dummy data as requested
  const globalVideos = dummyMovieBoxPost.videos;
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
  const tracks = [...globalVideos, ...localVideos];
  const [expandedWidgets, setExpandedWidgets] = useState<number[]>([]);

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.director.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocal = showLocalOnly ? t.addedBy?.id === 'local_user' : true;
    return matchesSearch && matchesLocal;
  });

  const viewabilityConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 50
  }).current;

  // Ref that always reflects the current modal state.
  // The onViewableItemsChanged callback is created once (ref), so it can't
  // read React state directly — we use a ref to bridge that gap.
  const isModalOpenRef = useRef(false);

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    // When the player modal is open, stop updating currentlyPlayingId.
    // Without this guard, the background FlatList fires viewability events
    // behind the Modal, causing MoviePostingPage to re-render and passing
    // a new renderItem reference to the modal — making it jump/scroll.
    if (isModalOpenRef.current) return;
    const visibleItem = viewableItems.find((v: any) => v.isViewable && v.item);
    if (visibleItem) {
      setCurrentlyPlayingId(visibleItem.item.id);
    } else {
      setCurrentlyPlayingId(null);
    }
  }).current;

  // Stable renderItem for the modal feed. useCallback with empty deps so the
  // FlatList inside LongVideoPlayerLayout never sees a new renderItem reference
  // and never triggers a visual jump.
  const renderModalItem = useCallback(({ item }: { item: any }) => (
    <MovieListTile
      video={item}
      onAddPress={() => console.log('Add pressed for', item.id)}
      onVideoPress={(params) => setSelectedVideoParams(params)}
      isAdded={false}
      disableVideoPlayer
      isCurrentlyPlaying={false}
    />
  ), []);

  // Keep the ref in sync with state (runs synchronously before render children)
  isModalOpenRef.current = selectedVideoParams !== null;


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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

      {/* Filter Options & Create Button */}
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

      {/* Media Chips for Folders */}
      {showLocalOnly && (
        <MediaChips
          activeTabIndex={1} // 1 = videos
          selectedAlbum={selectedAlbum}
          onAlbumSelected={(albumId) => {
            setSelectedAlbum(albumId);
            setExpandedWidgets([]);
            loadLocalVideo(albumId, undefined, true);
          }}
        />
      )}

      {/* Results List */}
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
              onAddPress={() => console.log('Add pressed for', item.id)}
              onVideoPress={(params) => {
                setSelectedVideoParams(params);
              }}
              isAdded={false}
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
