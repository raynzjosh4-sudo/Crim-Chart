import { useCurrentTheme } from "@/core/store/useThemeStore";
import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { CommentSheet } from '@/components/comments/CommentSheet';
import { ChartLinearLoader } from '@/components/CrimchartLoader/ChartLinearLoader';
import { PaginationShimmer } from '@/components/shimmers/ActivityShimmer';
import { VisibilityBoxTrackerWrapper } from '@/components/wrappers/VisibilityBoxTrackerWrapper';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useBoxInteractionTracker } from '@/features/boxes/application/useBoxInteractionTracker';
import { useBoxMembers } from '@/features/boxes/application/useBoxMembers';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { AppState, Dimensions, FlatList, StyleSheet, Text, View, ViewToken, Platform, useWindowDimensions, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoxDetail } from '../../application/useBoxDetail';
import { useBoxItems } from '../../application/useBoxItems';
import { BoxMemberActivityViewer } from '../../components/contributors/BoxMemberActivityViewer';
import { RecentContributorsWidget } from '../../components/contributors/RecentContributorsWidget';
import { FullPageShimmer } from '../../components/details/MusicBoxDetailShimmer';
import { MusicBoxDetailTrackTile } from '../../components/details/MusicBoxDetailTrackTile';
import { TrendingInBoxWidget } from '../../components/details/TrendingInBoxWidget';
import { MusicPostingPage } from '../../components/music_posting/MusicPostingPage';
import { useGlobalProgress } from '@/components/globalProgressBar/GlobalProgressBar';
import { useDesktopNowPlayingStore } from '@/core/store/useDesktopNowPlayingStore';
import { Share as ShareIcon, Copy, MoreVertical } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { Share as RNShare, ToastAndroid, TouchableOpacity } from 'react-native';
import { ProfileMusicItem } from '@/components/profileTabsWidgets/ProfileMusicItem';
import UserAvatar from '@/components/avatar/UserAvatar';
import { BoxOptionsSheet } from '../../components/BoxOptionsSheet';
const {
  width: windowWidth
} = Dimensions.get('window');
export const MusicBoxDetailPage = ({
  id,
  onClose
}: {
  id: string;
  onClose?: () => void;
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    listContent: {
      paddingBottom: 40
    },
    separator: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      marginVertical: 20,
      marginHorizontal: 16
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    pageTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
      flex: 1,
      textAlign: 'center'
    },
    smallBoxWidget: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 16,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 16,
      padding: 12
    },
    smallBoxCover: {
      width: 56,
      height: 56,
      borderRadius: 12
    },
    smallBoxInfo: {
      flex: 1,
      marginLeft: 12
    },
    smallBoxTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700'
    },
    smallBoxDescription: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 12,
      marginTop: 4
    }
  }));
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const currentUser = useAuthStore(s => s.user);
  const {
    trackInteraction
  } = useBoxInteractionTracker();
  const {
    members,
    isLoading: isLoadingMembers,
    isPaginating: isPaginatingMembers,
    loadMore: loadMoreMembers
  } = useBoxMembers(id);
  const {
    box: fetchedBox,
    isLoading
  } = useBoxDetail(id);
  const {
    items: fetchedItems,
    isLoading: isItemsLoading,
    isFetchingMore,
    loadMore,
    refetch
  } = useBoxItems(id);

  const isFocused = useIsFocused();

  // Refetch items when navigating back to the page
  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  // Track view interaction when the page mounts
  React.useEffect(() => {
    if (id && currentUser?.id) {
      trackInteraction(id, currentUser.id, 'view');
    }
  }, [id, currentUser?.id, trackInteraction]);

  const { stopLoading } = useGlobalProgress();
  React.useEffect(() => {
    if (!isLoading && !isItemsLoading) {
      stopLoading();
    }
  }, [isLoading, isItemsLoading]);

  const displayedItems = React.useMemo(() => {
    return fetchedItems.map(item => ({
      id: item.id,
      postId: item.post.id,
      boxId: item.box_id || id,
      title: item.post.caption || 'Untitled Track',
      artist: item.post.authorName || 'Unknown Artist',
      thumbnailUrl: item.post.thumbnailUrl || '',
      audioUrl: item.post.mediaUrl || (item.post as any).audio_url || '',
      downloadsCount: (item.post as any).downloads_count || 0,
      likes: item.likes || 0,
      dislikes: item.dislikes || 0,
      commentsCount: 0,
      viewsCount: (item as any).views_count || (item.post as any).views_count || 0,
      addedBy: item.addedBy || {
        id: item.post.authorId,
        name: item.post.authorName || 'Unknown',
        avatarUrl: item.post.authorAvatar || ''
      },
      linkedFrom: {
        id: item.post.authorId,
        name: item.post.authorName || 'Unknown',
        avatarUrl: item.post.authorAvatar || ''
      }
    }));
  }, [fetchedItems]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [viewerMemberId, setViewerMemberId] = useState<string | null>(null);
  const [selectedFilterUserId, setSelectedFilterUserId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [showPostingModal, setShowPostingModal] = useState(false);
  const [showOptionsSheet, setShowOptionsSheet] = useState(false);
  const [optionsAnchor, setOptionsAnchor] = useState<{ x: number; y: number } | undefined>(undefined);
  const pathname = usePathname();
  const isPageActive = isFocused && !pathname.includes('now-playing');
  const [appStateVisible, setAppStateVisible] = useState(AppState.currentState);
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppStateVisible(nextAppState);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  // Auto-set first track active
  React.useEffect(() => {
    if (displayedItems.length > 0 && !activeTrackId) {
      setActiveTrackId(displayedItems[0].id);
    }
  }, [displayedItems, activeTrackId]);
  const activeMember = React.useMemo(() => {
    return members.find(m => m.id === viewerMemberId);
  }, [members, viewerMemberId]);
  const filteredItems = React.useMemo(() => {
    if (!selectedFilterUserId) return displayedItems;
    return displayedItems.filter(item => item.addedBy.id === selectedFilterUserId);
  }, [displayedItems, selectedFilterUserId]);
  const groupedUsers = React.useMemo(() => {
    const map = new Map<string, { user: any, items: any[] }>();
    filteredItems.forEach(item => {
      const u = item.addedBy;
      if (!u) return;
      if (!map.has(u.id)) {
        map.set(u.id, { user: u, items: [] });
      }
      map.get(u.id)!.items.push(item);
    });
    return Array.from(map.values());
  }, [filteredItems]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
    minimumViewTime: 300
  }).current;
  
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Kept for signature compatibility if needed, but horizontal lists make this less relevant globally
  }).current;
  
  const flatListRef = useRef<FlatList<any>>();
  
  const handleTrackPlay = (trackId: string, trackObj?: any, contextItems?: any[]) => {
    const itemsToUse = contextItems || filteredItems;
    let queue = itemsToUse.map(item => ({
      title: item.title,
      artist: item.artist,
      coverUrl: item.thumbnailUrl,
      audioUrl: item.audioUrl,
      postId: item.postId,
      boxId: item.boxId
    }));
    
    let index = itemsToUse.findIndex(i => i.id === trackId);
    
    // Fallback if track is not in itemsToUse (e.g. from Trending widget)
    if (index === -1 && trackObj) {
      queue = [{
        title: trackObj.title,
        artist: trackObj.artist,
        coverUrl: trackObj.thumbnailUrl,
        audioUrl: trackObj.audioUrl || '',
      }];
      index = 0;
    }

    useDesktopNowPlayingStore.getState().openModal(queue, Math.max(0, index));
  };

  const renderHeader = () => {
    return <View>
        <TrendingInBoxWidget boxId={id} onTrackPress={track => {
        handleTrackPlay(track.id, track);
      }} />

        <RecentContributorsWidget contributors={members} isLoading={isLoadingMembers} isPaginating={isPaginatingMembers} onLoadMore={loadMoreMembers} boxId={id} selectedMemberId={selectedFilterUserId} onSelectMember={id => setSelectedFilterUserId(id)} onLongPressMember={id => setViewerMemberId(id)} onAddPress={() => {
        if (isDesktop) {
          setShowPostingModal(true);
        } else {
          router.push(`/music-box/post/${id}`);
        }
      }} />
      </View>;
  };
  const renderUserRow = ({ item: group }: { item: { user: any, items: any[] } }) => {
    return (
      <View style={{ marginBottom: 24 }}>
        <TouchableOpacity 
          style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12 }}
          activeOpacity={0.8}
          onPress={() => router.push(`/profile/${group.user.id}` as any)}
        >
          <UserAvatar userId={group.user.id} fallbackUrl={group.user.avatarUrl} name={group.user.name} size={36} forceHasStatus={false} />
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700', marginLeft: 12 }}>
            {group.user.name}
          </Text>
        </TouchableOpacity>
        <FlatList
          data={group.items}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={track => track.id}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item: song }) => (
            <View style={{ marginRight: 6 }}>
              <ProfileMusicItem
                thumbnailUrl={song.thumbnailUrl}
                title={song.title}
                artist={song.artist}
                size={148}
                onPress={() => handleTrackPlay(song.id, undefined, group.items)}
              />
            </View>
          )}
        />
      </View>
    );
  };
  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return <View style={{
      marginTop: 20
    }}>
        <PaginationShimmer />
      </View>;
  };
  const handleMoreOptions = (event: any) => {
    if (Platform.OS === 'web') {
      const rect = event.nativeEvent?.target?.getBoundingClientRect();
      if (rect) {
        setOptionsAnchor({ x: rect.left, y: rect.bottom });
      } else {
        setOptionsAnchor({ x: windowWidth - 60, y: 60 });
      }
    }
    setShowOptionsSheet(true);
  };

  const isOwner = currentUser?.id === (fetchedBox as any)?.raw?.owner_id;
  const showInitialLoading = (isLoading || isItemsLoading) && displayedItems.length === 0;
  return <VisibilityBoxTrackerWrapper box={fetchedBox} isCurrentUser={isOwner} actionType="view_box">
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ChartAppBar onBack={onClose} backgroundColor="transparent" showBorder={false} useSafeArea={false} actions={[
          <TouchableOpacity key="more" onPress={handleMoreOptions} style={{ padding: 4, marginLeft: 8 }} activeOpacity={0.8}>
            <MoreVertical size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ]} titleWidget={<View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
      }}>
            {!!fetchedBox?.coverImageUrl && <Image source={{
          uri: fetchedBox.coverImageUrl
        }} style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          marginRight: 12
        }} contentFit="cover" />}
            <Text style={{
          color: theme.colors.text,
          fontSize: 18,
          fontWeight: '700',
          flexShrink: 1
        }} numberOfLines={1}>
              {fetchedBox?.title || ''}
            </Text>
          </View>} title={''} />

        {/* Removed redundant ChartLinearLoader */}

        {showInitialLoading ? <FullPageShimmer /> : filteredItems.length === 0 ? <View style={{
        flex: 1
      }}>
            {renderHeader()}
            <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
              <Text style={{
            color: 'rgba(255,255,255,0.5)'
          }}>
                {selectedFilterUserId ? "No tracks from this user." : "No tracks added yet."}
              </Text>
            </View>
          </View> : <FlatList ref={flatListRef} data={groupedUsers} keyExtractor={item => item.user.id} renderItem={renderUserRow} ListHeaderComponent={renderHeader()} ListFooterComponent={renderFooter()} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={viewabilityConfig} onEndReached={loadMore} onEndReachedThreshold={0.5} />}
      </SafeAreaView>

      {/* Member Activity Status Modal */}
      {viewerMemberId && activeMember && <BoxMemberActivityViewer visible={!!viewerMemberId} userId={activeMember.id} userName={activeMember.name} userAvatarUrl={activeMember.avatarUrl} boxId={id} onClose={() => setViewerMemberId(null)} />}

      {showPostingModal && isDesktop && <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowPostingModal(false)}>
          <MusicPostingPage boxId={id} isInline onCloseInline={() => setShowPostingModal(false)} />
        </Modal>}

      {/* Comment Sheet */}
      {showComments && activePostId && <CommentSheet postId={activePostId} visible={showComments} onClose={() => setShowComments(false)} />}
      <BoxOptionsSheet
        boxId={id}
        boxTitle={fetchedBox?.title}
        visible={showOptionsSheet}
        onClose={() => setShowOptionsSheet(false)}
        anchorPosition={optionsAnchor}
      />
    </VisibilityBoxTrackerWrapper>;
};