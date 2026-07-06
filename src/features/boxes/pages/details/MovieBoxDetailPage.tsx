import { useCurrentTheme } from "@/core/store/useThemeStore";
import { useStyles } from "@/core/hooks/useStyles";
import ChartAppBar from '@/components/chartappbar/ChartAppBar';
import { CommentSheet } from '@/components/comments/CommentSheet';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { useBoxDetail } from '@/features/boxes/application/useBoxDetail';
import { useBoxInteractionTracker } from '@/features/boxes/application/useBoxInteractionTracker';
import { useBoxItems } from '@/features/boxes/application/useBoxItems';
import { useBoxMembers } from '@/features/boxes/application/useBoxMembers';
import { BoxMemberActivityViewer } from '@/features/boxes/components/contributors/BoxMemberActivityViewer';
import { RecentContributorsWidget } from '@/features/boxes/components/contributors/RecentContributorsWidget';
import { MovieBoxDetailVideoTile } from '@/features/boxes/components/details/MovieBoxDetailVideoTile';
import { TrendingInBoxWidget } from '@/features/boxes/components/details/TrendingInBoxWidget';
import { MovieBoxInfoWidget } from '@/features/boxes/components/details/widgets/MovieBoxInfoWidget';
import { ChartLinearLoader } from '@/components/CrimchartLoader/ChartLinearLoader';
import { MoviePostingItemShimmer } from '@/components/shimmers/MoviePostingShimmer';
import { FullPageShimmer } from '@/features/boxes/components/details/MovieBoxDetailShimmer';
import { VideoFeedPage } from '@/video/pages/VideoFeedPage';
import { MoviePostingPage } from '@/features/boxes/components/video_posting/MoviePostingPage';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Modal, SafeAreaView, StyleSheet, Text, View, Platform, useWindowDimensions } from 'react-native';
interface MovieBoxDetailPageProps {
  id: string;
  onClose?: () => void;
}
export const MovieBoxDetailPage: React.FC<MovieBoxDetailPageProps> = ({
  id,
  onClose
}) => {
  const theme = useCurrentTheme();
  const styles = useStyles(colors => ({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background
    },
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    listContent: {
      paddingBottom: 40
    },
    headerContainer: {
      marginBottom: 20
    },
    contributorsSection: {
      marginTop: 0,
      marginBottom: 8
    },
    divider: {
      height: 8,
      backgroundColor: 'rgba(255,255,255,0.05)',
      marginVertical: 12
    },
    emptyContainer: {
      padding: 32,
      alignItems: 'center'
    },
    emptyText: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 14
    }
  }));
  const router = useRouter();
  const {
    width
  } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 768;
  const {
    box: fetchedBox,
    isLoading
  } = useBoxDetail(id);
  const {
    items: fetchedItems,
    isLoading: isItemsLoading,
    isFetchingMore,
    loadMore
  } = useBoxItems(id);
  const {
    user
  } = useAuthStore();
  const {
    trackInteraction
  } = useBoxInteractionTracker();
  const displayedVideos = React.useMemo(() => {
    return fetchedItems.map(item => {
      const isShort = item.post.postType === 'short' || (item.post.aspectRatio ? item.post.aspectRatio < 1 : false);
      return {
        id: item.id,
        postId: item.post.id,
        boxId: item.box_id,
        title: item.post.caption || 'Untitled Video',
        director: item.post.authorName || 'Unknown',
        thumbnailUrl: item.post.thumbnailUrl || '',
        videoUrl: item.post.mediaUrl || '',
        isAudio: !item.post.isVideo,
        isShort,
        likes: item.likes || 0,
        addedBy: item.addedBy || {
          id: item.post.authorId,
          name: item.post.authorName || 'Unknown',
          avatarUrl: item.post.authorAvatar || ''
        },
        viewsCount: (item.post as any).viewsCount || (item as any).viewsCount || 0,
        commentsCount: (item.post as any).commentsCount || 0
      };
    });
  }, [fetchedItems]);

  // Track the currently "playing" (visible) video
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Video Player state
  const [selectedVideoParams, setSelectedVideoParams] = useState<any | null>(null);

  // Track viewer member id for activity modal
  const [viewerMemberId, setViewerMemberId] = useState<string | null>(null);

  // Track selected member for filtering items
  const [selectedFilterUserId, setSelectedFilterUserId] = useState<string | null>(null);

  // Comment sheet state
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showPostingModal, setShowPostingModal] = useState(false);

  // Fetch actual members for this box
  const {
    members,
    isLoading: isLoadingMembers,
    isPaginating: isPaginatingMembers,
    loadMore: loadMoreMembers
  } = useBoxMembers(id);
  const activeMember = React.useMemo(() => {
    return members.find(m => m.id === viewerMemberId);
  }, [members, viewerMemberId]);
  const filteredVideos = React.useMemo(() => {
    if (!selectedFilterUserId) return displayedVideos;
    return displayedVideos.filter(item => item.addedBy.id === selectedFilterUserId);
  }, [displayedVideos, selectedFilterUserId]);
  const handleVideoPress = (item: any) => {
    const isAudio = item.isAudio || item.videoUrl && item.videoUrl.match(/\.(mp3|wav|m4a|aac)$/i);
    if (isAudio) {
      router.push({
        pathname: '/now-playing',
        params: {
          title: item.title,
          artist: item.director || item.addedBy?.name || 'Unknown',
          coverUrl: item.thumbnailUrl,
          audioUrl: item.videoUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        }
      });
    } else if (item.isShort) {
      setSelectedVideoParams(item);
    } else {
      router.push({
        pathname: '/video-player',
        params: {
          url: item.videoUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
        }
      });
    }
  };

  // Handle visibility tracking to automatically mark a video as playing when scrolled into view
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 100
  }).current;
  const onViewableItemsChanged = useRef(({
    viewableItems
  }: any) => {
    if (viewableItems.length > 0) {
      setActiveVideoId(viewableItems[0].item.id);
    }
  }).current;

  // Render the header component (Box Details + Members Widget)
  const renderHeader = () => <View style={styles.headerContainer}>
      {/* Trending in this box */}
      <TrendingInBoxWidget boxId={id} onTrackPress={track => {
      handleVideoPress({
        id: track.postId || track.id,
        title: track.title,
        director: track.artist,
        thumbnailUrl: track.thumbnailUrl,
        videoUrl: track.videoUrl || track.audioUrl,
        isShort: track.isShort,
        isAudio: track.isAudio,
        addedBy: {
          name: track.artist
        }
      });
    }} />

      <View style={styles.contributorsSection}>
        <RecentContributorsWidget contributors={members} isLoading={isLoadingMembers} isPaginating={isPaginatingMembers} onLoadMore={loadMoreMembers} boxId={id} selectedMemberId={selectedFilterUserId} onSelectMember={setSelectedFilterUserId} onLongPressMember={setViewerMemberId} onAddPress={() => {
        if (isDesktop) setShowPostingModal(true);else router.push(`/movie-box/post/${id}`);
      }} />
      </View>
    </View>;
  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return <View style={{
      marginTop: 20
    }}>
        <MoviePostingItemShimmer />
      </View>;
  };
  const showInitialLoading = (isLoading || isItemsLoading) && displayedVideos.length === 0;
  return <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <ChartAppBar onBack={onClose} title="Movie Box" titleWidget={<View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8
      }}>
              {fetchedBox?.coverImageUrl ? <Image source={{
          uri: fetchedBox.coverImageUrl
        }} style={{
          width: 28,
          height: 28,
          borderRadius: 14
        }} /> : null}
              <Text style={{
          color: theme.colors.text,
          fontSize: 17,
          fontWeight: '700'
        }} numberOfLines={1}>
                {fetchedBox?.title || 'Movie Box'}
              </Text>
            </View>} />

        {(isLoading || isItemsLoading || isFetchingMore) && <View style={{
        height: 2,
        width: '100%',
        backgroundColor: 'transparent'
      }}>
            <ChartLinearLoader isLoading={true} />
          </View>}

        {showInitialLoading ? <FullPageShimmer /> : filteredVideos.length === 0 ? <View style={{
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
                {selectedFilterUserId ? "No videos from this user." : "No videos added yet."}
              </Text>
            </View>
          </View> : <FlatList data={filteredVideos} keyExtractor={item => item.id} ListHeaderComponent={renderHeader} ListFooterComponent={renderFooter} contentContainerStyle={styles.listContent} renderItem={({
        item
      }) => <View>
                <MovieBoxDetailVideoTile video={item} isPlaying={activeVideoId === item.id} onVideoPress={() => handleVideoPress(item)} onCommentPress={postId => {
          setActivePostId(postId);
          setShowComments(true);
        }} currentUserId={user?.id} onInteraction={trackInteraction} />
                <View style={styles.divider} />
              </View>} viewabilityConfig={viewabilityConfig} onViewableItemsChanged={onViewableItemsChanged} showsVerticalScrollIndicator={false} ListEmptyComponent={<View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No videos found for this member.</Text>
              </View>} onEndReached={loadMore} onEndReachedThreshold={0.5} />}
      </View>

      {selectedVideoParams && <Modal visible={true} animationType="slide" onRequestClose={() => setSelectedVideoParams(null)}>
          <VideoFeedPage initialVideos={displayedVideos.filter(t => t.isShort).map(t => ({
        id: t.id,
        postId: t.id,
        videoUrl: t.videoUrl || 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        caption: t.title,
        authorId: t.addedBy?.id || 'unknown',
        authorName: t.director || t.addedBy?.name || 'Unknown',
        authorAvatarUrl: t.addedBy?.avatarUrl,
        likesCount: t.likes || 0,
        commentsCount: t.comments || 0,
        isLiked: false,
        createdAt: new Date(),
        sharesCount: 0,
        isCompetition: false,
        chartPoints: 0,
        isCharted: false,
        tagsCount: 0
      }))} initialIndex={Math.max(0, displayedVideos.filter(t => t.isShort).findIndex(t => t.id === selectedVideoParams.id))} showBack={true} onBack={() => setSelectedVideoParams(null)} />
        </Modal>}

      {showPostingModal && isDesktop && <Modal visible={true} transparent={true} animationType="fade" onRequestClose={() => setShowPostingModal(false)}>
          <MoviePostingPage boxId={id} isInline onCloseInline={() => setShowPostingModal(false)} />
        </Modal>}

      {/* Member Activity Status Modal */}
      {viewerMemberId && activeMember && <BoxMemberActivityViewer visible={!!viewerMemberId} userId={activeMember.id} userName={activeMember.name} userAvatarUrl={activeMember.avatarUrl || ''} boxId={id} onClose={() => setViewerMemberId(null)} />}

      {/* Comment Sheet */}
      {activePostId && <CommentSheet postId={activePostId} visible={showComments} onClose={() => setShowComments(false)} />}
    </SafeAreaView>;
};