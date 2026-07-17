import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MusicListTile, MusicTrackItem } from '@/features/boxes/components/music_posting/tiles/MusicListTile';

interface MusicTagWidgetProps {
  key?: string | number;
  post: {
    id: string;
    author_id: string;
    author_name: string;
    author_avatar: string;
    caption: string;
    image_urls: string[];
    thumbnail_urls?: string[];
    video_url: string;
    audio_url: string;
    likes_count: number;
    comments_count: number;
    views_count: number;
    downloads_count: number;
    created_at: string;
  };
}

export const MusicTagWidget: React.FC<MusicTagWidgetProps> = ({ post }) => {
  // Extract cover URL (usually the first thumbnail or image url for audio posts)
  const coverUrl = (post.thumbnail_urls && post.thumbnail_urls.length > 0)
    ? post.thumbnail_urls[0]
    : (post.image_urls && post.image_urls.length > 0) 
      ? post.image_urls[0] 
      : '';

  // Try to parse title/artist from caption. Usually formatted as "Title by Artist" or just the caption
  let title = post.caption || 'Unknown Title';
  let artist = 'Unknown Artist';
  
  if (title.includes(' by ')) {
    const parts = title.split(' by ');
    title = parts[0];
    artist = parts[1];
  }

  const trackItem: MusicTrackItem = {
    id: post.id,
    title,
    artist,
    coverUrl,
    audioUrl: post.audio_url,
    createdAt: post.created_at,
    likesCount: post.likes_count || 0,
    commentsCount: post.comments_count || 0,
    viewsCount: post.views_count || 0,
    downloadsCount: post.downloads_count || 0,
    owner: {
      id: post.author_id,
      name: post.author_name || 'User',
      avatarUrl: post.author_avatar || '',
    }
  };

  return (
    <View style={styles.container}>
      <PostInteractionWrapper 
        postId={post.id} 
        initialLikesCount={post.likes_count}
        initialViewsCount={post.views_count}
        initialDownloadsCount={post.downloads_count}
      >
        {({ isLiked, likesCount, viewsCount, downloadsCount }) => (
          <MusicListTile 
            track={{
              ...trackItem,
              likesCount,
              viewsCount,
              downloadsCount,
              commentsCount: post.comments_count // Pass commentsCount directly from post
            }} 
            isLiked={isLiked}
            onLikePress={() => {
              // Get the toggleLike function directly from the store
              import('@/core/store/useInteractionStore').then(({ useInteractionStore }) => {
                useInteractionStore.getState().toggleLike(post.id);
              });
            }}
            hideTagButton={true} // Hide the tag button inside a tag widget
            hideBorder={true}
          />
        )}
      </PostInteractionWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  }
});
