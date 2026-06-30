import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { supabase } from '@/core/supabase/supabaseConfig';
import { MainFeedCardModel, MainFeedCardType, ScrollViewType } from '../../models/MainFeedCardTypeModel';
import { MainFeedCard } from '../../features/mainfeedcard/MainFeedCard';
import { useAuthStore } from '@/features/auth/application/useAuthStore';
import { FeedPermissionsWrapper } from '@/components/wrappers/FeedPermissionsWrapper';
import { PostCardSkeleton } from '@/components/skeletons/Skeletons';

interface SmartPostWidgetProps {
  postId: string;
  entityType: string;
  sourceType?: string;
  isActive: boolean;
  prefetchedData?: any;
}

/**
 * Resolves whether the current user can comment based on the channel policy.
 * Mirrors the logic in useChannelPermissions — but runs synchronously on pre-loaded data.
 * 'all' | 'followers' | 'joined members' | 'none (only me)'
 */
function resolveCanComment(allowCommentingBy: string | undefined | null, isMember: boolean, isFollower: boolean): boolean {
  const policy = (allowCommentingBy ?? 'all').toLowerCase();
  if (policy === 'all') return true;
  if (policy === 'followers') return isFollower;
  if (policy === 'joined members' || policy === 'joined_members') return isMember;
  return false;
}

export const SmartPostWidget: React.FC<SmartPostWidgetProps> = React.memo(({
  postId,
  entityType,
  sourceType = 'post',
  isActive,
  prefetchedData
}) => {
  const user = useAuthStore(s => s.user);
  const constructInitialState = (data: any, type?: string) => {
    // Safely parse JSONs
    let images: string[] = [];
    try { images = typeof data.image_urls === 'string' ? JSON.parse(data.image_urls) : (data.image_urls || []); } catch(e) {}
    
    let metadata: any = {};
    try { metadata = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : (data.metadata || {}); } catch(e) {}

    let thumbUrl = undefined;
    try {
      const thumbs = typeof data.thumbnail_urls === 'string' ? JSON.parse(data.thumbnail_urls) : (data.thumbnail_urls || []);
      if (thumbs.length > 0) thumbUrl = thumbs[0];
    } catch(e) {}

    const authorName = data.author?.display_name || data.author_username || 'User';
    const authorAvatar = data.author?.profile_image_url || data.author_avatar_url || '';

    const hydrated: MainFeedCardModel = {
      id: String(data.id),
      cardType: MainFeedCardType.socialPost,
      scrollViewType: ScrollViewType.vertical,
      link: data.widget_type === 'channel_post' ? `/channel/${data.channel_id}` : `/post/${data.id}`,
      itemData: {
        id: String(data.id),
        author: {
          id: String(data.author_id ?? ''),
          displayName: String(authorName),
          profileImageUrl: authorAvatar,
          followersCount: 0, followingCount: 0,
          isActive: Boolean(data.author?.is_online ?? false),
          hasStatus: Boolean(data.author?.has_status ?? false),
          statusCount: Number(data.author?.status_count ?? 0),
          channelsCreatedCount: 0,
        },
        channel: {
          id: String(data.channel_id ?? 'user_feed'),
          title: String(data.channel_name ?? 'Personal Post'),
          imageUrl: data.channel_avatar_url || '',
          description: data.channel?.description || data.channel_description || '',
        },
        imageUrls: images,
        caption: String(data.caption ?? ''),
        videoUrl: data.video_url,
        audioUrl: data.audio_url,
        isVideo: Boolean(data.is_video ?? false),
        videoUrls: [], isAudio: Boolean(data.is_audio ?? false), isGif: false, isText: false,
        thumbnailLinkType: 'image',
        thumbnailLinkUrl: thumbUrl,
        metadata: metadata,
        tagsCount: 0, likesCount: Number(data.likes ?? data.likes_count ?? 0),
        commentsCount: Number(data.comments ?? data.comments_count ?? 0),
        viewsCount: Number(data.views_count ?? data.viewsCount ?? 0),
        timeAgo: new Date(data.created_at || Date.now()).toLocaleDateString(),
        isLiked: false, isSponsored: false,
        hasStatus: false, isActive: false, isPending: 0, localFileCache: '',
        widgetType: type === 'post' ? 'regular_post' : (data.widget_type ?? 'channel_post'),
        source_type: data.source_type ?? type,
        sourceTable: data.source_table ?? (type === 'channel_post' ? 'channel_posts' : 'posts'),
      },
    };

    // Resolve canComment from prefetched data — zero extra queries
    let resolvedCanComment = true;
    if (type === 'channel_post' && data.channel) {
      resolvedCanComment = resolveCanComment(data.channel.allow_commenting_by, true, true);
    } else if (type === 'post') {
      resolvedCanComment = data.allow_comments !== false;
    }

    return { postData: hydrated, canComment: resolvedCanComment };
  };

  const [state, setState] = useState<{ postData: MainFeedCardModel | null, canComment: boolean }>(
    prefetchedData ? constructInitialState(prefetchedData, sourceType) : { postData: null, canComment: true }
  );
  
  const postData = state.postData;
  const canComment = state.canComment;
  const [loading, setLoading] = useState(!state.postData);

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      // Skip if initialized synchronously
      if (postData) return;

      try {
        setLoading(true);

        let data = prefetchedData;
        
        if (!data) {
          // Fallback if not prefetched
          if (sourceType === 'channel_post') {
            let res = await supabase
              .from('channel_posts')
              .select(`*, author:profiles!author_id (id, display_name, profile_image_url, is_online, has_status, status_count), channel:channels!channel_id (allow_commenting_by, join_method, age_restriction, country_restrictions)`)
              .eq('id', postId)
              .maybeSingle();
            data = res.data;
          } else if (sourceType === 'post') {
            let res = await supabase
              .from('posts')
              .select(`*, author:profiles!author_id (id, display_name, profile_image_url, is_online, has_status, status_count)`)
              .eq('id', postId)
              .maybeSingle();
            data = res.data;
          } else {
            // Legacy fallback if sourceType is somehow missing
            let res1 = await supabase
              .from('channel_posts')
              .select(`*, author:profiles!author_id (id, display_name, profile_image_url)`)
              .eq('id', postId)
              .maybeSingle();

            if (res1.error || !res1.data) {
              let res2 = await supabase
                .from('posts')
                .select(`*, author:profiles!author_id (id, display_name, profile_image_url)`)
                .eq('id', postId)
                .maybeSingle();
              data = res2.data;
            } else {
              data = res1.data;
            }
          }
        }

        if (!data || !isMounted) {
           console.log(`[SmartPost] No data found for ${postId}`);
           return;
        }

        const initializedState = constructInitialState(data, sourceType);
        setState(initializedState);
      } catch (error) {
        console.error('Failed to fetch smart post:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPost();
    
    return () => { isMounted = false; };
  }, [postId, prefetchedData]);

  if (loading) return <PostCardSkeleton />;
  if (!postData) return null;

  return (
    <FeedPermissionsWrapper permissions={{ canComment }}>
      <MainFeedCard card={postData} isActive={isActive} />
    </FeedPermissionsWrapper>
  );
});
