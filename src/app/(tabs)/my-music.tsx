import { useStyles } from "@/core/hooks/useStyles";
import UserAvatar from '@/components/avatar/UserAvatar';
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { CategoryPickerWidget } from '@/components/compose/CategoryPickerWidget';
import { ComposerDialog } from '@/components/composer/ComposerDialog';
import { FollowUserButton } from '@/components/FollowUserButton';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { NetworkStatusBanner } from '@/components/network/NetworkStatusBanner';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { RequireAuthWrapper } from '@/components/wrappers/RequireAuthWrapper';
import { MUSIC_CATEGORIES } from '@/core/constants/musicCategories';
import { useAppNavigation } from '@/core/navigation/useAppNavigation';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { useGlobalAudioPlayer } from '@/core/store/useGlobalAudioPlayer';
import { MusicListTile } from '@/features/boxes/components/music_posting/tiles/MusicListTile';
import { useDesktopVidsStore } from '@/mainFeed/pages/main_page_widgets/useDesktopVidsStore';
import { useRouter } from 'expo-router';
import { ListFilter, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useMusicFeed } from './_hooks/useMusicFeed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyMusicPage() {
  const insets = useSafeAreaInsets();
  const styles = useStyles(colors => ({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end'
    },
    desktopModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContent: {
      height: '60%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16,
      paddingTop: 10
    },
    desktopModalContent: {
      width: 400,
      maxHeight: '70%',
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.08)',
      borderRadius: 24,
      paddingHorizontal: 16,
      height: 48
    },
    searchIcon: {
      marginRight: 10
    },
    searchInput: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      height: '100%'
    },
    addButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center'
    }
  }));
  const theme = useCurrentTheme();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = width >= 768;
  const router = useRouter();
  const {
    stopLoading
  } = useGlobalProgress();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const {
    navigateToCrim,
    withPremiumTransition
  } = useAppNavigation();
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      useGlobalAudioPlayer.getState().stopAll();
      navigateToCrim();
      return true;
    });
    // Stop audio when the component unmounts (e.g. user navigates away via tab)
    return () => {
      backHandler.remove();
      useGlobalAudioPlayer.getState().stopAll();
    };
  }, [navigateToCrim]);
  const {
    tracks,
    isLoading,
    isFetchingMore,
    fetchMore
  } = useMusicFeed(searchQuery, selectedCategory);
  const setActiveVideo = useDesktopVidsStore(s => s.setActiveVideo);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  useEffect(() => {
    if (!isLoading) {
      stopLoading();
    }
  }, [isLoading, stopLoading]);
  const onViewableItemsChanged = useRef(({
    viewableItems
  }: {
    viewableItems: any[];
  }) => {
    if (viewableItems.length > 0) {
      const activeItem = viewableItems[0].item;
      if (activeItem && activeItem.id) {
        setActiveTrackId(activeItem.id);
        useDesktopVidsStore.getState().setActiveVideo(activeItem.id, undefined, undefined);
      }
    }
  }).current;
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50
  }).current;
  return <View style={{
    flex: 1,
    backgroundColor: theme.colors.background
  }}>
      {!isDesktop && <ChartAppBar title="My Music" showBack={false} />}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, {
        flex: 1,
        marginRight: 12
      }]}>
          <Search size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
          <TextInput style={[styles.searchInput, Platform.OS === 'web' && {
          outlineStyle: 'none'
        } as any]} placeholder="Search your music..." placeholderTextColor="rgba(255,255,255,0.5)" selectionColor={theme.colors.primary} value={searchInput} onChangeText={setSearchInput} onSubmitEditing={() => setSearchQuery(searchInput)} returnKeyType="search" />
          {selectedCategory !== 'All' && <TouchableOpacity onPress={() => setSelectedCategory('All')} style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.primary + '20',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          marginRight: 8
        }}>
              <Text style={{
            color: theme.colors.primary,
            fontSize: 12,
            marginRight: 4,
            fontWeight: 'bold'
          }}>
                {MUSIC_CATEGORIES.find(c => c.id === selectedCategory)?.label}
              </Text>
              <X size={12} color={theme.colors.primary} />
            </TouchableOpacity>}
          <TouchableOpacity onPress={() => setShowCategoryPicker(true)} style={{
          padding: 4,
          marginRight: 4
        }}>
            <ListFilter size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>
        <RequireAuthWrapper>
          {({ checkAuth }) => (
            <TouchableOpacity style={[styles.addButton, {
            backgroundColor: 'rgba(255,255,255,0.08)'
          }]} activeOpacity={0.8} onPress={(e) => checkAuth(() => {
            setActiveVideo(null); // Stop any playing video globally
            useGlobalAudioPlayer.getState().stopAll(); // Stop any playing audio

            withPremiumTransition(async () => {
              setIsComposerOpen(true);
            });
          }, e)}>
              <Text style={{
              color: theme.colors.text,
              fontSize: 14,
              fontWeight: '600'
            }}>Add</Text>
            </TouchableOpacity>
          )}
        </RequireAuthWrapper>
      </View>
      <View style={{
      flex: 1
    }}>
        {isLoading && tracks.length === 0 ? <View style={{
        padding: 20,
        alignItems: 'center'
      }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={{
          color: 'rgba(255,255,255,0.5)',
          marginTop: 8
        }}>Loading music...</Text>
          </View> : tracks.length === 0 ? <View style={{
        padding: 20,
        alignItems: 'center'
      }}>
            <Text style={{
          color: 'rgba(255,255,255,0.5)'
        }}>No music found.</Text>
          </View> : <FlatList data={tracks} keyExtractor={item => item.id} contentContainerStyle={{
        paddingVertical: 16,
        paddingHorizontal: 16,
        paddingBottom: 80 // Clear the mini player (safe area is handled by parent)
      }} onEndReached={fetchMore} onEndReachedThreshold={0.5} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={viewabilityConfig} ListFooterComponent={isFetchingMore ? <View style={{
        padding: 20,
        alignItems: 'center'
      }}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View> : null} renderItem={({
        item
      }) => {
        console.log('--- MUSIC ITEM OWNER ---', item.owner);
        return <View style={{
          marginBottom: 24
        }}>
                  {/* Author Header */}
                  <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12
          }}>
                    <View style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}>
                      <View style={{
                marginRight: 12
              }}>
                        <UserAvatar size={40} userId={item.owner?.id || ''} fallbackUrl={item.owner?.avatarUrl || 'https://via.placeholder.com/40'} name={item.owner?.name} />
                      </View>
                      <View>
                        <Text style={{
                  color: theme.colors.text,
                  fontSize: 16,
                  fontWeight: 'bold'
                }}>
                          {item.owner?.name || 'Unknown Artist'}
                        </Text>
                        {item.owner?.crownTitle ? <Text style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 12
                }}>
                            {item.owner.crownTitle}
                          </Text> : null}
                      </View>
                    </View>
                    {item.owner?.id && <FollowUserButton targetUserId={item.owner.id} size="small" style={{
              flex: 0,
              height: 32,
              minWidth: 90,
              paddingHorizontal: 12
            }} textStyle={{
              fontSize: 13
            }} />}
                  </View>

                  {item.caption ? <Text style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: 14,
            marginBottom: 12,
            lineHeight: 20
          }}>
                      {item.caption}
                    </Text> : null}

                  {/* Music Tile */}
                  <PostInteractionWrapper postId={item.id} initialLikesCount={item.likesCount} initialViewsCount={item.viewsCount} initialDownloadsCount={item.downloadsCount} sourceTable={item.sourceTable}>
                    {({
              isLiked,
              likesCount,
              viewsCount,
              downloadsCount
            }) => <MusicListTile track={item} hideHeader={true} hideTagButton={true} isCurrentlyPlaying={item.id === activeTrackId} lyricsPreview={item.lyrics || "no lyrics"} isLiked={isLiked} likesCount={likesCount} viewsCount={viewsCount} downloadsCount={downloadsCount} onLikePress={() => useInteractionStore.getState().toggleLike(item.id, undefined, item.sourceTable)} onDownloadPress={() => useInteractionStore.getState().incrementDownload(item.id, undefined, item.sourceTable === 'channel_posts' ? 'channel_posts' : undefined)} />}
                  </PostInteractionWrapper>
                </View>;
      }} />}
      </View>
      <ComposerDialog visible={isComposerOpen} onClose={() => setIsComposerOpen(false)} />
      {/* Category Picker Modal */}
      <Modal visible={showCategoryPicker} animationType={isDesktop ? "fade" : "slide"} transparent={true} onRequestClose={() => setShowCategoryPicker(false)}>
        <Pressable style={isDesktop ? styles.desktopModalOverlay : styles.modalOverlay} onPress={() => setShowCategoryPicker(false)}>
          <Pressable style={[isDesktop ? styles.desktopModalContent : styles.modalContent, {
          backgroundColor: theme.colors.background
        }]}>
            {!isDesktop && <View style={styles.modalHandle} />}
            <CategoryPickerWidget onSelectCategory={id => {
            setSelectedCategory(id);
            setShowCategoryPicker(false);
          }} />
          </Pressable>
        </Pressable>
      </Modal>
      <NetworkStatusBanner />
    </View>;
}