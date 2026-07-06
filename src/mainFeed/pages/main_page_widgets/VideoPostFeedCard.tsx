import { formatTimeAgo } from '@/components/formatTimeAgo';
import { PostHeader } from '@/components/PostHeader/PostHeader';
import { VideoCardSkeleton } from '@/components/skeletons/Skeletons';
import { GeneralVideoPlayer } from '@/components/video_player/players/GeneralVideoPlayer';
import { ShortVideoPlayer } from '@/components/video_player/players/ShortVideoPlayer';
import { FeedPermissionsWrapper } from '@/components/wrappers/FeedPermissionsWrapper';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { supabase } from '@/core/supabase/supabaseConfig';
import { useCurrentUserProfile, useUserProfile } from '@/features/auth/application/useUserProfile';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { PostOptionsSheet } from '@/components/postOptionsSheet/PostOptionsSheet';

function resolveCanComment(allowCommentingBy: string | undefined | null, isMember: boolean, isFollower: boolean): boolean {
  const policy = (allowCommentingBy ?? 'all').toLowerCase();
  if (policy === 'all') return true;
  if (policy === 'followers') return isFollower;
  if (policy === 'joined members' || policy === 'joined_members') return isMember;
  return false;
}

interface VideoPostFeedCardProps {
  postId: string;
  preloadStatus?: 'playing' | 'preloading' | 'idle';
  isActive?: boolean;
  entityType?: 'long_video_post' | 'short_video_post';
  sourceType?: string;
  prefetchedData?: any;
}

export const VideoPostFeedCard: React.FC<VideoPostFeedCardProps> = React.memo(({
  postId,
  preloadStatus = 'idle',
  isActive = false,
  entityType = 'long_video_post',
  sourceType = 'post',
  prefetchedData
}) => {
  const router = useRouter();

  const constructInitialState = (data: any, eType?: string) => {
    let sourceTable = data.channel_id ? 'channel_posts' : 'posts';

    // Safely parse thumbnail_urls
    let thumbUrl = '';
    try {
      const thumbs =
        typeof data.thumbnail_urls === 'string'
          ? JSON.parse(data.thumbnail_urls)
          : data.thumbnail_urls || [];
      if (thumbs.length > 0) thumbUrl = thumbs[0];
    } catch (e) { }

    // Safely parse image_urls as fallback thumbnail
    if (!thumbUrl) {
      try {
        const imgs =
          typeof data.image_urls === 'string'
            ? JSON.parse(data.image_urls)
            : data.image_urls || [];
        if (imgs.length > 0) thumbUrl = imgs[0];
      } catch (e) { }
    }

    let isShortMeta = eType === 'short_video_post';
    try {
      const meta = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : (data.metadata || {});
      if (typeof meta.is_short === 'boolean') {
        isShortMeta = meta.is_short;
      }
    } catch (e) { }

    let resolvedCanComment = true;
    if (sourceTable === 'channel_posts' && data.channel) {
      resolvedCanComment = resolveCanComment(data.channel.allow_commenting_by, true, true);
    } else if (sourceTable === 'posts') {
      resolvedCanComment = data.allow_comments !== false;
    }

    const hydratedData = {
      id: String(data.id),
      title: data.caption || '',
      director: data.author?.display_name || data.author_username || 'User',
      thumbnailUrl: thumbUrl,
      duration: '',
      description: data.caption || '',
      likes: Number(data.likes ?? data.likes_count ?? 0),
      dislikes: 0,
      commentsCount: Number(data.comments ?? data.comments_count ?? 0),
      viewsCount: Number(data.views_count ?? 0),
      createdAt: data.created_at,
      videoUrl: data.video_url,
      isShort: isShortMeta,
      sourceTable,
      source_type: data.source_type ?? sourceType,
      addedBy: {
        id: String(data.author_id ?? ''),
        name: data.author?.display_name || data.author_username || 'User',
        avatarUrl: data.author?.profile_image_url || data.author_avatar_url || '',
      },
    };

    return { videoData: hydratedData, canComment: resolvedCanComment };
  };

  const [state, setState] = useState<{ videoData: any | null, canComment: boolean }>(
    prefetchedData ? constructInitialState(prefetchedData, entityType) : { videoData: null, canComment: true }
  );

  const videoData = state.videoData;
  const canComment = state.canComment;
  const [loading, setLoading] = useState(!state.videoData);
  const [postOptionsVisible, setPostOptionsVisible] = useState(false);
  const [postOptionsPosition, setPostOptionsPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  const isLocal = videoData?.addedBy?.id === 'local_user';
  const otherProfileId = isLocal || !videoData?.addedBy?.id ? undefined : videoData.addedBy?.id;
  const otherProfile = useUserProfile(otherProfileId);
  const currentUserProfile = useCurrentUserProfile();

  useEffect(() => {
    let isMounted = true;

    const fetchVideo = async () => {
      if (videoData) return;

      try {
        setLoading(true);

        let data = prefetchedData;

        if (!data) {
          // Try channel_posts first
          let res1 = await supabase
            .from('channel_posts')
            .select(`*, author:profiles!author_id (id, display_name, profile_image_url), channel:channels!channel_id (allow_commenting_by, join_method, age_restriction, country_restrictions)`)
            .eq('id', postId)
            .maybeSingle();

          if (res1.error || !res1.data) {
            // Fall back to regular posts
            const res2 = await supabase
              .from('posts')
              .select(`*, author:profiles!author_id (id, display_name, profile_image_url)`)
              .eq('id', postId)
              .maybeSingle();
            data = res2.data;
          } else {
            data = res1.data;
          }
        }

        if (!data || !isMounted) return;

        setState(constructInitialState(data, entityType));
      } catch (err) {
        console.error('[VideoPostFeedCard] fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVideo();

    return () => {
      isMounted = false;
    };
  }, [postId, prefetchedData, entityType]);

  useEffect(() => {
    if (preloadStatus === 'playing' && videoData) {
      // console.log('================================================');
      // console.log(`[DEBUG VideoWidget] FULLY VISIBLE!`);
      // console.log(`-> ID: ${videoData.id}`);
      // console.log(`-> Type: ${videoData.isShort ? 'short_video' : 'long_video'}`);
      // console.log(`-> Source Table: ${videoData.sourceTable}`);
      // console.log(`-> Full Data:`, JSON.stringify(videoData, null, 2));
      // console.log('================================================');
    }
  }, [preloadStatus, videoData]);

  if (loading) return <VideoCardSkeleton />;
  if (!videoData) return null;

  const effectivePreloadStatus = preloadStatus !== 'idle' ? preloadStatus : (isActive ? 'playing' : 'preloading');

  const profile = isLocal ? currentUserProfile : otherProfile;

  const realName = isLocal ? (profile?.displayName || 'You') : (profile?.displayName || videoData.addedBy?.name || 'Unknown User');

  const headerNode = (
    <View style={{ paddingVertical: 12 }}>
      {videoData.addedBy ? (
        <PostHeader
          author={
            new CrimChartUserModel({
              id: videoData.addedBy.id,
              displayName: realName,
              profileImageUrl: profile?.profileImageUrl || videoData.addedBy.avatarUrl,
              isActive: profile?.isActive,
              hasStatus: profile?.hasStatus,
              statusCount: profile?.statusCount,
            })
          }
          source_type={videoData.source_type}
          timeAgo={formatTimeAgo(videoData.createdAt)}
          onAvatarTap={() => {
            if (!isLocal && videoData.addedBy?.id) {
              router.push(`/profile/${videoData.addedBy.id}`);
            }
          }}
          onMoreTap={(e: any) => {
            if (Platform.OS === 'web' && e?.nativeEvent) {
              setPostOptionsPosition({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });
            }
            setPostOptionsVisible(true);
          }}
        />
      ) : null}
    </View>
  );

  if (videoData.isShort) {
    return (
      <FeedPermissionsWrapper permissions={{ canComment }}>
        <PostInteractionWrapper
          postId={videoData.id}
          initialLikesCount={videoData.likes}
          initialViewsCount={videoData.viewsCount}
          initialDownloadsCount={0}
          sourceTable={videoData.sourceTable}
          forceIsVisible={isActive}
        >
          {({ isLiked, likesCount, viewsCount }) => (
            <View>
              {headerNode}
              <ShortVideoPlayer
                video={{ ...videoData, likes: likesCount, viewsCount }}
                preloadStatus={effectivePreloadStatus as any}
                disableVideoPlayer={false}
                isLiked={isLiked}
                onLikePress={() => useInteractionStore.getState().toggleLike(videoData.id, undefined, videoData.sourceTable)}
              />
              <PostOptionsSheet
                postId={videoData.id}
                visible={postOptionsVisible}
                onClose={() => setPostOptionsVisible(false)}
                anchorPosition={postOptionsPosition}
              />
            </View>
          )}
        </PostInteractionWrapper>
      </FeedPermissionsWrapper>
    );
  }

  return (
    <FeedPermissionsWrapper permissions={{ canComment }}>
      <PostInteractionWrapper
        postId={videoData.id}
        initialLikesCount={videoData.likes}
        initialViewsCount={videoData.viewsCount}
        initialDownloadsCount={0}
        sourceTable={videoData.sourceTable}
        forceIsVisible={isActive}
      >
        {({ isLiked, likesCount, viewsCount, isTagged }) => (
          <View>
            {headerNode}
            <GeneralVideoPlayer
              video={{ ...videoData, likes: likesCount, viewsCount }}
              preloadStatus={effectivePreloadStatus as any}
              disableVideoPlayer={false}
              isLiked={isLiked}
              onLikePress={() => useInteractionStore.getState().toggleLike(videoData.id, undefined, videoData.sourceTable)}
            />
            <PostOptionsSheet
              postId={videoData.id}
              visible={postOptionsVisible}
              onClose={() => setPostOptionsVisible(false)}
              anchorPosition={postOptionsPosition}
            />
          </View>
        )}
      </PostInteractionWrapper>
    </FeedPermissionsWrapper>
  );
});
