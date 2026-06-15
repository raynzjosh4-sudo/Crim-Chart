import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { VisibilityBoxTrackerWrapper } from '@/components/wrappers/VisibilityBoxTrackerWrapper';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useBoxInteractionTracker } from '@/features/boxes/application/useBoxInteractionTracker';
import { useBoxMembers } from '@/features/boxes/application/useBoxMembers';
import { useIsFocused } from '@react-navigation/native';
import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, AppState, Dimensions, FlatList, StyleSheet, Text, View, ViewToken } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBoxDetail } from '../../application/useBoxDetail';
import { useBoxItems } from '../../application/useBoxItems';
import { BoxMemberActivityViewer } from '../../components/contributors/BoxMemberActivityViewer';
import { RecentContributorsWidget } from '../../components/contributors/RecentContributorsWidget';
import { MusicBoxDetailTrackTile } from '../../components/details/MusicBoxDetailTrackTile';
import { TrendingInBoxWidget } from '../../components/details/TrendingInBoxWidget';
import { dummyMusicBoxPost } from '../../data/dummyMusicBoxData';

const { width } = Dimensions.get('window');

export const MusicBoxDetailPage = ({ id }: { id: string }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const currentUser = useAuthStore(s => s.user);
  const { trackInteraction } = useBoxInteractionTracker();
  const { members } = useBoxMembers(id);

  const { box: fetchedBox, isLoading } = useBoxDetail(id);

  const { items: fetchedItems, isLoading: isItemsLoading, loadMore } = useBoxItems(id);

  // Track view interaction when the page mounts
  React.useEffect(() => {
    if (id && currentUser?.id) {
      trackInteraction(id, currentUser.id, 'view');
    }
  }, [id, currentUser?.id, trackInteraction]);

  // Merge box details with dummy placeholders for stats if needed
  const post = React.useMemo(() => {
    if (!fetchedBox) return dummyMusicBoxPost;
    return {
      ...dummyMusicBoxPost,
      box: {
        ...dummyMusicBoxPost.box,
        title: fetchedBox.title,
        description: (fetchedBox as any).raw?.description || dummyMusicBoxPost.box.description,
        coverImageUrl: fetchedBox.coverImageUrl || dummyMusicBoxPost.box.coverImageUrl,
      }
    };
  }, [fetchedBox]);

  const displayedItems = React.useMemo(() => {
    return fetchedItems.map(item => ({
      id: item.id,
      postId: item.post.id,
      boxId: item.box_id || id,
      title: item.post.caption || 'Untitled Track',
      artist: item.post.authorName || 'Unknown Artist',
      thumbnailUrl: item.post.thumbnailUrl || '',
      audioUrl: item.post.mediaUrl || item.post.audio_url || '',
      downloadsCount: item.post.downloads_count || 0,
      likes: item.likes || 0,
      dislikes: item.dislikes || 0,
      commentsCount: 0,
      addedBy: item.addedBy || {
        id: item.post.authorId,
        name: item.post.authorName || 'Unknown',
        avatarUrl: item.post.authorAvatar || ''
      },
      linkedFrom: {
        id: item.post.authorId,
        name: item.post.authorName || 'Unknown',
        avatarUrl: item.post.authorAvatar || ''
      },
    }));
  }, [fetchedItems]);

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [viewerMemberId, setViewerMemberId] = useState<string | null>(null);

  const isFocused = useIsFocused();
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

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90,
    minimumViewTime: 300,
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      setActiveTrackId(viewableItems[0].item.id);
    }
  }).current;

  const flatListRef = useRef<FlatList<any>>();

  const renderHeader = () => {
    return (
      <View>
        <TrendingInBoxWidget
          items={displayedItems}
          onTrackPress={(trackId) => {
            const index = displayedItems.findIndex(i => i.id === trackId);
            if (index !== -1 && flatListRef.current) {
              flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.2 });
            }
          }}
        />

        <RecentContributorsWidget
          contributors={members}
          boxId={id}
          selectedMemberId={null}
          onSelectMember={(userId) => {
            if (userId) setViewerMemberId(userId);
          }}
          onAddPress={handleAddPress}
        />
      </View>
    );
  };

  const renderSongRow = ({ item: song }: { item: typeof post.previewItems[0] }) => {
    const isPlaying = activeTrackId === song.id && isPageActive && appStateVisible === 'active';
    return <MusicBoxDetailTrackTile song={song} isPlaying={isPlaying} />;
  };

  const handleAddPress = () => {
    router.push(`/music-box/post/${id}`);
  };

  const isOwner = currentUser?.id === (fetchedBox as any)?.raw?.owner_id;

  return (
    <VisibilityBoxTrackerWrapper
      box={fetchedBox || post.box}
      isCurrentUser={isOwner}
      actionType="view_box"
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ChartAppBar
          backgroundColor="transparent"
          showBorder={false}
          useSafeArea={false}
          titleWidget={<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
            {!!post?.box?.coverImageUrl && (
              <Image
                source={{ uri: post.box.coverImageUrl }}
                style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }}
                contentFit="cover" />
            )}
            <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>
              {post?.box?.title || ''}
            </Text>
          </View>} title={''} />
        {isLoading || isItemsLoading ? (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator color="#FACD11" size="large" />
          </View>
        ) : displayedItems.length === 0 ? (
          <View style={{ flex: 1 }}>
            {renderHeader()}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)' }}>No tracks added yet.</Text>
            </View>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={displayedItems}
            keyExtractor={(item) => item.id}
            renderItem={renderSongRow}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={renderHeader()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
          />
        )}
      </SafeAreaView>

      {/* Member Activity Status Modal */}
      {viewerMemberId && activeMember && (
        <BoxMemberActivityViewer
          visible={!!viewerMemberId}
          userId={activeMember.id}
          userName={activeMember.name}
          userAvatarUrl={activeMember.avatarUrl}
          boxId={id}
          onClose={() => setViewerMemberId(null)}
        />
      )}
    </VisibilityBoxTrackerWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    paddingBottom: 40,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
    marginHorizontal: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  smallBoxWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 12,
  },
  smallBoxCover: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  smallBoxInfo: {
    flex: 1,
    marginLeft: 12,
  },
  smallBoxTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  smallBoxDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
});
