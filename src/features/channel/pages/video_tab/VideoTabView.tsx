import { useChannelMoments } from '@/channel/hooks/useChannelMoments';
import { useChannelPosts } from '@/channel/hooks/useChannelPosts';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { videoPostFromMap } from '@/video/models/VideoPost';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, Platform, Dimensions } from 'react-native';
import { useDesktopComposeStore } from '@/core/store/useDesktopComposeStore';
import { VideoCard } from './widgets/VideoCard';
import { VideoPromotionBanner } from './widgets/VideoPromotionBanner';
import { VideoTabShimmer } from './widgets/VideoTabShimmer';

interface VideoTabViewProps {
  channelId?: string;
  channelName?: string;
  channelTitle?: string;
  isLoading?: boolean;
}

const HEIGHTS = [220, 300, 260, 340, 210, 290, 250, 320, 230, 310, 270, 350];

export const VideoTabView: React.FC<VideoTabViewProps> = ({
  channelId,
  channelName,
  channelTitle,
  isLoading = false,
}) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { momentGroups, loading: statusesLoading } = useChannelMoments(user?.id || '', channelId);
  const { posts, loading: postsLoading } = useChannelPosts(channelId);

  // Flatten moment groups into MomentData shape for VideoPromotionBanner
  const moments = momentGroups.flatMap(group =>
    group.moments.map(m => ({
      id: m.id,
      mediaUrl: m.media_url,
      caption: m.caption || '',
      authorName: group.channel_name || '',
      authorAvatarUrl: group.channel_avatar_url || '',
    }))
  );

  // Map channel posts to proper VideoPost shape using the model factory
  const videos = posts
    .filter((p: any) => p.thumbnailUrl || p.videoUrl || p.imageUrls?.length > 0)
    .map((p: any) =>
      videoPostFromMap({
        id: p.id,
        post_id: p.id,
        video_url: p.videoUrl || '',
        thumbnail_url: p.thumbnailUrl || p.imageUrls?.[0] || '',
        caption: p.title || '',
        author_id: p.addedBy?.id || '',
        author_name: p.addedBy?.name || '',
        author_avatar: p.addedBy?.avatarUrl || '',
        likes_count: p.likesCount || 0,
        comments_count: p.commentsCount || 0,
        shares_count: 0,
        tags_count: 0,
        chart_points: 0,
        is_charted: false,
        is_competition: false,
        channel_id: channelId,
        channel_name: channelName,
      })
    );

  if (isLoading || statusesLoading) {
    return <VideoTabShimmer />;
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <VideoPromotionBanner
          channelName={channelName}
          channelTitle={channelTitle}
          onPostMoment={() => {
            if (Platform.OS === 'web') {
              useDesktopComposeStore.getState().openModal({
                postType: 'channel_moment',
                targetChannelId: channelId,
              });
            } else {
              router.push({
                pathname: '/first-post',
                params: { targetChannelId: channelId, isChannelMoment: 'true' },
              } as any);
            }
          }}
          moments={moments}
        />

        {postsLoading ? (
          <ActivityIndicator color="#FACD11" style={{ marginTop: 32 }} />
        ) : videos.length === 0 ? (
          <View style={styles.noVideosContainer}>
            <Text style={styles.noVideosText}>No posts yet</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            <View style={styles.column}>
              {videos.filter((_: any, i: number) => i % 2 === 0).map((video: any, index: number) => {
                const globalIndex = index * 2;
                return (
                  <View key={video.id} style={styles.cardWrapper}>
                    <VideoCard
                      video={video}
                      height={HEIGHTS[globalIndex % HEIGHTS.length]}
                      index={globalIndex}
                      allVideos={videos}
                    />
                  </View>
                );
              })}
            </View>
            <View style={styles.column}>
              {videos.filter((_: any, i: number) => i % 2 !== 0).map((video: any, index: number) => {
                const globalIndex = index * 2 + 1;
                return (
                  <View key={video.id} style={styles.cardWrapper}>
                    <VideoCard
                      video={video}
                      height={HEIGHTS[globalIndex % HEIGHTS.length]}
                      index={globalIndex}
                      allVideos={videos}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingBottom: 20,
    gap: 8,
  },
  column: {
    flex: 1,
  },
  cardWrapper: {
    marginBottom: 8,
  },
  noVideosContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noVideosText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: 'bold',
  },
});

