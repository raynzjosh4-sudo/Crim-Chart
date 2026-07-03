import { MediaChips } from '@/components/mediaChips/MediaChips';
import { UploadingToast } from '@/components/loader/UploadingToast';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { VisibilityBoxTrackerWrapper } from '@/components/wrappers/VisibilityBoxTrackerWrapper';
import { BoxReactionRecorderWrapper } from '@/components/wrappers/BoxReactionRecorderWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewToken, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMusicFeedStore } from './store/useMusicFeedStore';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { MusicListTile, MusicTrackItem } from './tiles/MusicListTile';
import { MusicListTileShimmer } from './tiles/MusicListTileShimmer';
import { PhoneMusicWidget } from './widgets/PhoneMusicWidget';
import { useBoxDetail } from '@/features/boxes/application/useBoxDetail';
import { useMusicUpload } from '@/features/boxes/application/useMusicUpload';

export const MusicPostingPage = ({ boxId, isInline, onCloseInline }: { boxId: string; isInline?: boolean; onCloseInline?: () => void }) => {
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;

  const [searchQuery, setSearchQuery] = useState('');
  // removed addedTracks local state in favor of useInteractionStore

  const [localTracks, setLocalTracks] = useState<MusicTrackItem[]>([]);

  const { box } = useBoxDetail(boxId);
  const isOwner = currentUser?.id === box?.owner_id;

  const { isUploading, uploadMusicToBox } = useMusicUpload();

  const tags = useInteractionStore(state => state.tags);

  // Use the global store for feed data
  const { globalTracks, isLoadingGlobal, hasMoreGlobal, isInitialLoad, loadGlobalMusic, addTrackToTop } = useMusicFeedStore();

  const tracks = [...globalTracks, ...localTracks];

  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

  // Local Music Pagination
  const [localMediaCursor, setLocalMediaCursor] = useState<string | undefined>(undefined);
  const [hasMoreLocalMusic, setHasMoreLocalMusic] = useState<boolean>(true);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingLocal, setLoadingLocal] = useState(false);

  // 1. Fetch existing tags for this box so the UI accurately shows "Tagged" for already added items
  useEffect(() => {
    const fetchExistingTags = async () => {
      if (!boxId) return;
      try {
        const { data, error } = await supabase
          .from('box_items')
          .select('post_id')
          .eq('box_id', boxId);

        if (!error && data) {
          data.forEach(item => {
            useInteractionStore.getState().seedTag(item.post_id, boxId, true);
          });
        }
      } catch (e) {
        console.error("Failed to fetch existing tags:", e);
      }
    };
    fetchExistingTags();
  }, [boxId]);

  const [expandedWidgets, setExpandedWidgets] = useState<number[]>([]);
  const [showLocalOnly, setShowLocalOnly] = useState<boolean>(false);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);

  useEffect(() => {
    // Only load if empty, so it caches in memory
    if (globalTracks.length === 0) {
      loadGlobalMusic(boxId);
    }
  }, []);

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocal = showLocalOnly ? t.owner?.id === 'local_user' : true;
    return matchesSearch && matchesLocal;
  });

  const loadLocalMusic = async (albumOverride?: string | null, cursorOverride?: string | undefined, clearCurrent?: boolean) => {
    const isFetchingNewAlbum = albumOverride !== undefined;
    if (!hasMoreLocalMusic && !isFetchingNewAlbum) return;

    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow media access to load local music.');
      return;
    }

    const albumToUse = albumOverride !== undefined ? albumOverride : selectedAlbum;
    const cursorToUse = cursorOverride !== undefined ? cursorOverride : localMediaCursor;

    try {
      const mediaPage = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 10,
        after: cursorToUse,
        album: albumToUse ? albumToUse : undefined,
      });

      const newLocalTracks: MusicTrackItem[] = mediaPage.assets.map(asset => {
        const minutes = Math.floor(asset.duration / 60);
        const seconds = Math.floor(asset.duration % 60).toString().padStart(2, '0');

        return {
          id: asset.id,
          title: asset.filename.replace(/\.[^/.]+$/, ""), // remove extension
          artist: 'Local Device',
          coverUrl: '',
          audioUrl: asset.uri,
          duration: `${minutes}:${seconds}`,
          owner: {
            id: 'local_user',
            name: currentUser?.displayName || currentUser?.username || 'My Device',
            avatarUrl: currentUser?.profileImageUrl || 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
          }
        };
      });

      setLocalTracks(clearCurrent ? newLocalTracks : [...localTracks, ...newLocalTracks]);
      setLocalMediaCursor(mediaPage.endCursor);
      setHasMoreLocalMusic(mediaPage.hasNextPage);
    } catch (error) {
      console.error("Error loading local music:", error);
      Alert.alert("Error", "Failed to load local music from your device.");
    }
  };

  const handleAddTrack = async (track: MusicTrackItem) => {
    // Perform the actual upload using our new hook
    const finalTrack = await uploadMusicToBox(track, boxId);

    if (finalTrack) {
      // 1. Remove it from the local tracks so it doesn't appear twice
      setLocalTracks(localTracks.filter(t => t.id !== track.id));

      // 2. Inject the fully uploaded global track into the top of the feed
      addTrackToTop(finalTrack);

      // 3. Switch back to global feed if we were on local only
      if (showLocalOnly) {
        setShowLocalOnly(false);
      }
    } else {
      ChartToast.showErrorSimple("Upload Failed", "Failed to upload track. Please try again.");
    }
  };

  const handleTagTrack = async (track: MusicTrackItem) => {
    // Optimistic UI update instantly!
    console.log(`[MusicPostingPage] Optimistic toggleTag for post ${track.id}`);
    useInteractionStore.getState().toggleTag(track.id, boxId);

    try {
      const { data, error } = await supabase.rpc('tag_post_to_box', {
        p_box_id: boxId,
        p_post_id: track.id
      });
      console.log(`[MusicPostingPage] tag_post_to_box RPC returned:`, data, error);

      if (error) throw error;
      if (data && !data.success) {
        console.error("[MusicPostingPage] Failed to toggle tag post - Supabase returned error:", data?.error);
        throw new Error(data.error || "Failed to tag post");
      }
    } catch (e: any) {
      console.error("[MusicPostingPage] Failed to toggle tag for box (Exception):", JSON.stringify(e, null, 2), e.message, e);
      // Revert optimistic update on failure
      console.log(`[MusicPostingPage] Reverting optimistic toggleTag for post ${track.id}`);
      useInteractionStore.getState().toggleTag(track.id, boxId);
    }
  };

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visibleItem = viewableItems.find(v => v.isViewable && v.item); // Just find the first visible item
    if (visibleItem) {
      setCurrentlyPlayingId(visibleItem.item.id);
    } else {
      setCurrentlyPlayingId(null);
    }
  }).current;

  const content = (
    <View style={isDesktop && isInline ? styles.desktopModal : styles.container}>
      <UploadingToast visible={isUploading} message="Uploading track..." />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => isInline && onCloseInline ? onCloseInline() : router.back()}
        >
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={20} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tracks"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
        </View>
      </View>

      <VisibilityBoxTrackerWrapper box={box || {}} isCurrentUser={isOwner} actionType="upload_post">
        <View style={styles.filterContainer}>
          <TouchableOpacity activeOpacity={1}
            style={styles.filterToggle}
            onPress={() => setShowLocalOnly(!showLocalOnly)}
          >
            <View style={[styles.radioOuter, showLocalOnly && styles.radioOuterSelected]}>
              {showLocalOnly && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.filterText}>Show local music only</Text>
          </TouchableOpacity>
        </View>

        {showLocalOnly && (
          <MediaChips
            activeTabIndex={2}
            selectedAlbum={selectedAlbum}
            onAlbumSelected={(albumId) => {
              setSelectedAlbum(albumId);
              setExpandedWidgets([]);
              loadLocalMusic(albumId, undefined, true);
            }}
          />
        )}
      </VisibilityBoxTrackerWrapper>

      <FlatList
        data={filteredTracks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={() => {
          if (!showLocalOnly && hasMoreGlobal) {
            loadGlobalMusic(boxId);
          }
        }}
        onEndReachedThreshold={0.5}
        renderItem={({ item, index }) => (
          <View>
            <PostInteractionWrapper
              postId={item.id}
              initialLikesCount={item.likesCount}
              initialViewsCount={item.viewsCount}
              initialDownloadsCount={item.downloadsCount}
            >
              {({ isLiked, likesCount, viewsCount, downloadsCount }) => (
                <BoxReactionRecorderWrapper boxId={boxId} postId={item.id} reactionType="tag">
                  {({ recordReaction }) => (
                    <MusicListTile
                      track={item}
                      isAdded={tags[item.id]?.includes(boxId) || false}
                      isLiked={isLiked}
                      likesCount={likesCount}
                      viewsCount={viewsCount}
                      downloadsCount={downloadsCount}
                      onAddPress={handleAddTrack}
                      onTagPress={async () => {
                        await handleTagTrack(item);
                        recordReaction();
                      }}
                      onLikePress={() => useInteractionStore.getState().toggleLike(item.id)}
                      onDownloadPress={() => useInteractionStore.getState().incrementDownload(item.id)}
                      isCurrentlyPlaying={item.id === currentlyPlayingId}
                    />
                  )}
                </BoxReactionRecorderWrapper>
              )}
            </PostInteractionWrapper>
            {(index + 1) % 10 === 0 && hasMoreLocalMusic && (
              <VisibilityBoxTrackerWrapper box={box || {}} isCurrentUser={isOwner} actionType="upload_post">
                <PhoneMusicWidget
                  isExpanded={expandedWidgets.includes(index)}
                  onPress={() => {
                    if (!expandedWidgets.includes(index)) {
                      setExpandedWidgets([...expandedWidgets, index]);
                      loadLocalMusic();
                    }
                  }}
                />
              </VisibilityBoxTrackerWrapper>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isInitialLoad && !showLocalOnly ? (
              <View>
                <MusicListTileShimmer />
                <MusicListTileShimmer />
                <MusicListTileShimmer />
              </View>
            ) : (
              <>
                <Text style={styles.emptyText}>No tracks found</Text>
                {hasMoreLocalMusic && (
                  <VisibilityBoxTrackerWrapper box={box || {}} isCurrentUser={isOwner} actionType="upload_post">
                    <View style={{ marginTop: 32, width: '100%' }}>
                      <PhoneMusicWidget onPress={() => loadLocalMusic()} isExpanded={false} />
                    </View>
                  </VisibilityBoxTrackerWrapper>
                )}
              </>
            )}
          </View>
        }
        ListFooterComponent={
          isLoadingGlobal && !isInitialLoad && !showLocalOnly ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator size="small" color="#FACD11" />
            </View>
          ) : null
        }
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
    paddingHorizontal: 16,
    marginBottom: 12,
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
    borderColor: '#FACD11',
    backgroundColor: '#FACD11',
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 15,
  }
});
