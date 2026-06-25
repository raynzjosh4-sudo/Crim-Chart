import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search } from 'lucide-react-native';
import { StoreItemTile } from '@/features/boxes/components/details/StoreItemTile';
import { LocalDeviceImagesWidget } from '@/features/boxes/components/store_posting/widgets/LocalDeviceImagesWidget';
import { MediaChips } from '@/components/mediaChips/MediaChips';
import { StorePostingPageShimmer } from '@/components/shimmers/StorePostingShimmer';
import { useLocalImages } from '@/features/boxes/application/useLocalImages';
import { useStoreFeedStore } from './store/useStoreFeedStore';
import { useStoreUpload } from '@/features/boxes/application/useStoreUpload';
import { useBoxDetail } from '@/features/boxes/application/useBoxDetail';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { VisibilityBoxTrackerWrapper } from '@/components/wrappers/VisibilityBoxTrackerWrapper';
import { BoxReactionRecorderWrapper } from '@/components/wrappers/BoxReactionRecorderWrapper';
import { StoreItem } from '../../data/dummyStoreBoxData';
import { ChartToast } from '@/components/showcase/CrimChart_toast';
import { UploadingToast } from '@/components/loader/UploadingToast';

export function StorePostingPage({ boxId }: { boxId: string }) {
  const router = useRouter();
  const currentUser = useAuthStore(state => state.user);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocalOnly, setShowLocalOnly] = useState(false);
  const [expandedWidgets, setExpandedWidgets] = useState<number[]>([]);

  const { box } = useBoxDetail(boxId);
  const isOwner = currentUser?.id === box?.owner_id;

  const { selectedAlbum, setSelectedAlbum, loadLocalImages, localImages, setLocalImages } = useLocalImages();
  
  const { isUploading, uploadStoreItemToBox } = useStoreUpload();
  const { globalStoreItems, isLoadingGlobal, hasMoreGlobal, isInitialLoad, loadGlobalItems, addItemToTop } = useStoreFeedStore();

  const tracks = [...globalStoreItems, ...localImages];

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

  useEffect(() => {
    if (globalStoreItems.length === 0) {
      loadGlobalItems(boxId);
    }
    // Also load local images on first open so the list is never empty
    if (localImages.length === 0) {
      loadLocalImages(undefined, undefined, true);
    }
  }, []);

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.seller.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocal = showLocalOnly ? t.seller?.id === 'local_user' : true;
    return matchesSearch && matchesLocal;
  });

  const handleAddStoreItem = async (item: StoreItem) => {
    const finalItem = await uploadStoreItemToBox(item, boxId);

    if (finalItem) {
      // 1. Remove it from the local tracks so it doesn't appear twice
      setLocalImages(localImages.filter(t => t.id !== item.id));

      // 2. Inject the fully uploaded global track into the top of the feed
      addItemToTop(finalItem);

      // 3. Switch back to global feed if we were on local only
      if (showLocalOnly) {
        setShowLocalOnly(false);
      }
    } else {
      ChartToast.showErrorSimple("Upload Failed", "Failed to post item. Please try again.");
    }
  };

  const handleTagStoreItem = async (item: StoreItem) => {
    // Optimistic UI update instantly!
    useInteractionStore.getState().toggleTag(item.id, boxId);

    try {
      const { data, error } = await supabase.rpc('tag_post_to_box', {
        p_box_id: boxId,
        p_post_id: item.id
      });

      if (error) throw error;
      if (data && !data.success) {
        throw new Error(data.error || "Failed to tag post");
      }
    } catch (e: any) {
      console.error("[StorePostingPage] Failed to toggle tag for box (Exception):", e);
      // Revert optimistic update on failure
      useInteractionStore.getState().toggleTag(item.id, boxId);
    }
  };

  if (isInitialLoad && globalStoreItems.length === 0 && !showLocalOnly && localImages.length === 0) {
    return <StorePostingPageShimmer />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <UploadingToast visible={isUploading} message="Posting item..." />

      <View style={styles.headerBar}>
        <TouchableOpacity activeOpacity={1} style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Search size={20} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <VisibilityBoxTrackerWrapper box={box || {}} isCurrentUser={isOwner} actionType="upload_post">
        <View style={styles.filterContainer}>
          <TouchableOpacity activeOpacity={1}
            style={styles.filterToggle}
            onPress={() => {
              const nextState = !showLocalOnly;
              setShowLocalOnly(nextState);
              if (nextState) {
                setExpandedWidgets([-2]); // Auto-expand local widget in empty list
                if (localImages.length === 0) {
                  loadLocalImages(selectedAlbum, undefined, true);
                }
              }
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.radioOuter, showLocalOnly && styles.radioOuterSelected]}>
              {showLocalOnly && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.filterText}>Show local items only</Text>
          </TouchableOpacity>
        </View>

        {showLocalOnly && (
          <MediaChips
            activeTabIndex={0} // 0 = photos
            selectedAlbum={selectedAlbum}
            onAlbumSelected={(albumId) => {
              setSelectedAlbum(albumId);
              setExpandedWidgets([-2]);
              loadLocalImages(albumId, undefined, true);
            }}
          />
        )}

        <FlatList
          data={filteredTracks}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isLocal = item.seller?.id === 'local_user';
            
            return (
              <View>
                <View style={styles.itemWrapper}>
                  {isLocal ? (
                    // Local items don't need the wrappers yet, just the handler
                    <StoreItemTile 
                      item={item} 
                      onPostPress={handleAddStoreItem}
                      isTagged={false}
                    />
                  ) : (
                    // Global items use interaction wrappers to handle views/likes and tags
                    <PostInteractionWrapper
                      postId={item.id}
                      boxId={boxId}
                      initialLikesCount={item.likes}
                      initialViewsCount={item.viewsCount}
                    >
                      {({ isLiked, likesCount, viewsCount, isTagged }) => (
                        <BoxReactionRecorderWrapper boxId={boxId} postId={item.id} reactionType="tag">
                          {({ recordReaction }) => (
                            <StoreItemTile
                              item={item}
                              likesCount={likesCount}
                              isLiked={isLiked}
                              viewsCount={viewsCount}
                              onLikePress={() => useInteractionStore.getState().toggleLike(item.id, boxId)}
                              onTagPress={async () => {
                                await handleTagStoreItem(item);
                                recordReaction();
                              }}
                              isTagged={isTagged}
                            />
                          )}
                        </BoxReactionRecorderWrapper>
                      )}
                    </PostInteractionWrapper>
                  )}
                </View>
                {((index + 1) % 10 === 0 || (index === filteredTracks.length - 1 && filteredTracks.length < 10)) && (
                  <LocalDeviceImagesWidget
                    isExpanded={expandedWidgets.includes(index)}
                    onToggle={() => {
                      if (expandedWidgets.includes(index)) {
                        setExpandedWidgets(expandedWidgets.filter(w => w !== index));
                      } else {
                        setExpandedWidgets([...expandedWidgets, index]);
                      }
                    }}
                  />
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items found</Text>
              <View style={{ marginTop: 24, width: '100%' }}>
                <LocalDeviceImagesWidget
                  isExpanded={expandedWidgets.includes(-2)}
                  onToggle={() => {
                    if (expandedWidgets.includes(-2)) {
                      setExpandedWidgets(expandedWidgets.filter(w => w !== -2));
                    } else {
                      setExpandedWidgets([...expandedWidgets, -2]);
                    }
                  }}
                />
              </View>
            </View>
          }
          onEndReached={() => {
            if (!showLocalOnly && hasMoreGlobal && !isLoadingGlobal && globalStoreItems.length > 0) {
              loadGlobalItems(boxId);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoadingGlobal && globalStoreItems.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color="#4ADE80" size="small" />
              </View>
            ) : null
          }
        />
      </VisibilityBoxTrackerWrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    marginRight: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#FACD11',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FACD11',
  },
  filterText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  itemWrapper: {
    marginBottom: 16,
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
