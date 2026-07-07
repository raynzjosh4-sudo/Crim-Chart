import { supabase } from '@/core/supabase/supabaseConfig';
import { BoxModel } from '@/features/boxes/components/BoxCard';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useEffect, useState } from 'react';

import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { BoxFeedCardSkeleton } from '@/components/skeletons/Skeletons';

interface BoxFeedCardWrapperProps {
  boxId: string;
  prefetchedData?: any;
  children: (boxData: any, boxModel: BoxModel, ownerModel: CrimChartUserModel | null, interactionState?: any) => React.ReactNode;
}

import React from 'react';

export const BoxFeedCardWrapper: React.FC<BoxFeedCardWrapperProps> = React.memo(({ boxId, prefetchedData, children }) => {
  const constructBoxData = (data: any) => {
    let ownerModel: CrimChartUserModel | null = null;
    if (data.owner) {
      ownerModel = CrimChartUserModel.fromMap(data.owner);
      data.owner = ownerModel; // Keep backward compatibility
    }

    let mappedType = data.box_type;
    if (mappedType === 'audio') mappedType = 'music';
    if (mappedType === 'video') mappedType = 'movie';
    if (mappedType === 'marketplace') mappedType = 'store';
    if (mappedType === 'contest') mappedType = 'voting';

    let metadata = data.metadata || {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        metadata = {};
      }
    }

    const boxModel: BoxModel = {
      id: data.id,
      postId: data.post_id,
      title: data.title,
      boxType: mappedType as any,
      coverImageUrl: metadata?.coverImageUrl,
      itemCount: 0,
      isPublic: data.is_public ?? true,
      allowSubmissions: data.allow_submissions ?? true,
      ageRestriction: data.age_restriction || 'All Ages',
      countryRestrictions: data.country_restrictions || ['Global'],
      visibleToFollowedUsers: data.visible_to_followed_users ?? true,
      owner_id: data.owner_id,
      raw: data
    };

    // console.log(`[BoxFeedCardWrapper] Box ID: ${data.id}, coverImageUrl:`, boxModel.coverImageUrl);

    return { boxModel, ownerModel, rawData: data };
  };

  const initData = prefetchedData?.id ? (() => {
    const result = constructBoxData(prefetchedData);
    // console.log(`[BoxFeedCardWrapper INIT] boxId=${boxId}, has prefetchedData=true, postId=${result?.boxModel?.postId}, trendingTracks=${prefetchedData?.trendingTracks?.length ?? 0}`);
    return result;
  })() : null;

  if (!prefetchedData?.id) {
    // console.log(`[BoxFeedCardWrapper INIT] boxId=${boxId}, NO prefetchedData — will fetch async`);
  }

  const [resolvedBoxData, setResolvedBoxData] = useState<any>(initData);
  const [loading, setLoading] = useState(!initData);

  // If we mounted without prefetchedData but it arrives later, initialize synchronously
  useEffect(() => {
    if (!resolvedBoxData && prefetchedData?.id) {
      console.log(`[BoxFeedCardWrapper UPDATE] boxId=${boxId}, prefetchedData arrived late, initializing now`);
      setResolvedBoxData(constructBoxData(prefetchedData));
      setLoading(false);
    }
  }, [prefetchedData?.id]);

  useEffect(() => {
    let isMounted = true;
    const fetchBox = async () => {
      // Skip if we already have data (either from prefetch or previous fetch)
      if (resolvedBoxData) return;

      try {
        setLoading(true);
        let data = prefetchedData;

        if (!data) {
          const res = await supabase
            .from('boxes')
            .select(`
              *,
              owner:profiles!owner_id (id, display_name, profile_image_url, crown_title),
              trending_items:box_items (
                id,
                likes_count,
                post_id
              )
            `)
            .eq('id', boxId)
            .order('likes_count', { foreignTable: 'box_items', ascending: false })
            .limit(2, { foreignTable: 'box_items' })
            .maybeSingle();

          if (res.error) {
            console.log(`[BoxFeedCardWrapper] Error fetching box ${boxId}:`, res.error);
          }
          data = res.data;

          // Fetch post media separately (box_items has no FK to posts in schema cache)
          if (data?.trending_items?.length > 0) {
            const postIds = data.trending_items.map((t: any) => t.post_id).filter(Boolean);
            if (postIds.length > 0) {
              const { data: postsData } = await supabase
                .from('posts')
                .select('id, caption, metadata, thumbnail_urls, image_urls, video_urls, video_url, audio_url')
                .in('id', postIds);
              const postsMap = new Map((postsData || []).map((p: any) => [p.id, p]));
              data.trending_items = data.trending_items.map((t: any) => ({
                ...t,
                post: postsMap.get(t.post_id) || null,
              }));
            }
          }
        }

        if (!data) {
          // Box not found in DB — skip silently, card will render null
          if (isMounted) setLoading(false);
          return;
        }

        if (isMounted) {
          // Fetch post details manually since foreign key is dropped
          const postIds = (data.trending_items || []).map((item: any) => item.post_id).filter(Boolean);
          let fetchedPosts: Record<string, any> = {};

          if (postIds.length > 0) {
            const { data: postsData, error: postsError } = await supabase
              .from('posts')
              .select('id, caption, metadata, thumbnail_urls, image_urls')
              .in('id', postIds);

            if (postsError) {
              console.warn('[BoxFeedCardWrapper] Error fetching posts:', postsError);
            }

            if (postsData) {
              fetchedPosts = postsData.reduce((acc: any, p: any) => {
                acc[p.id] = p;
                return acc;
              }, {});
            }
          }

          // Map trending items into a standard track format
          const mappedTrendingTracks = (data.trending_items || []).map((item: any) => {
            const post = fetchedPosts[item.post_id] || {};
            const metadata = post.metadata || {};
            
            let thumbUrl = '';
            if (data.box_type === 'movie' || data.box_type === 'video' || data.box_type === 'box_movie' || data.box_type === 'box_video') {
              thumbUrl = post.thumbnail_urls?.[0] || post.video_urls?.[0] || metadata.thumbnailUrl || metadata.thumbnail_url || '';
            } else {
              thumbUrl = post.thumbnail_urls?.[0] || post.image_urls?.[0] || metadata.thumbnailUrl || metadata.coverImageUrl || metadata.thumbnail_url || '';
            }

            return {
              id: item.id,
              post_id: item.post_id,
              title: post.caption || metadata.title || metadata.name || 'Unknown Item',
              artist: metadata.artist || metadata.creatorName || metadata.author || 'Unknown Artist',
              thumbnailUrl: thumbUrl,
              likes: item.likes_count || 0,
              price: metadata.price || undefined, // For Store boxes
              mediaUrl: metadata.mediaUrl || metadata.videoUrl || metadata.audioUrl || '',
            };
          });
          data.trendingTracks = mappedTrendingTracks;
          // console.log(`[BoxFeedCardWrapper] mappedTrendingTracks for Box ${boxId}:`, JSON.stringify(mappedTrendingTracks, null, 2));

          setResolvedBoxData(constructBoxData(data));
        }
      } catch (err) {
        console.error('[BoxFeedCardWrapper] fetch error', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBox();
    return () => { isMounted = false; };
  }, [boxId, prefetchedData]);

  if (loading) return <BoxFeedCardSkeleton />;
  if (!resolvedBoxData) return null;

  // Always wrap in PostInteractionWrapper to keep hook count stable.
  // If no postId, use the boxId as fallback so optimistic UI updates work when users interact with synthetic boxes.
  const safePostId = resolvedBoxData.boxModel.postId || resolvedBoxData.boxModel.id;

  return (
    <PostInteractionWrapper postId={safePostId} sourceTable="posts">
      {(interactionState) => children(resolvedBoxData.rawData, resolvedBoxData.boxModel, resolvedBoxData.ownerModel, interactionState)}
    </PostInteractionWrapper>
  );
});
