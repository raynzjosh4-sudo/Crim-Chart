import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PostInteractionWrapper } from '@/components/wrappers/PostInteractionWrapper';
import { RegularPostCard } from '@/channel/ChannelComponents/ChnnelMainPostCard/RegularPostCard';
import { useInteractionStore } from '@/core/store/useInteractionStore';

interface VideoTagWidgetProps {
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

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(diffInSeconds)) return '';
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export const VideoTagWidget: React.FC<VideoTagWidgetProps> = ({ post }) => {
  // Mock the author data for the post card
  const authorData = {
    id: post.author_id,
    username: post.author_name,
    profileImageUrl: post.author_avatar,
    displayName: post.author_name,
  } as any;

  return (
    <View style={styles.container}>
      <PostInteractionWrapper 
        postId={post.id} 
        initialLikesCount={post.likes_count}
        initialViewsCount={post.views_count}
        initialDownloadsCount={post.downloads_count}
      >
        {({ isLiked, likesCount, viewsCount, downloadsCount }) => (
          <RegularPostCard 
            postId={post.id}
            author={authorData}
            content={post.caption || ''}
            timeAgo={formatRelativeTime(post.created_at)}
            imageUrls={post.image_urls}
            videoUrl={post.video_url}
            likesCount={likesCount}
            viewsCount={viewsCount}
            downloadsCount={downloadsCount}
            commentsCount={post.comments_count}
            isLiked={isLiked}
            onLikeTap={() => {
              useInteractionStore.getState().toggleLike(post.id);
            }}
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
