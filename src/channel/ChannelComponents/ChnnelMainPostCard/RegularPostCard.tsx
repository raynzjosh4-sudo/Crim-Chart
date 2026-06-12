import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { Tag, MoreHorizontal } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AppAvatar from '@/components/avatar/AppAvatar';

import { PostContent } from './postCardFiles/PostContent';
import { ChannelImagePostWidget } from './postCardFiles/ChannelImagePostWidget';
import { ChannelVideoPostWidget } from './postCardFiles/ChannelVideoPostWidget';
import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';

export interface RegularPostCardProps {
  author: CrimChartUserModel;
  content: string;
  timeAgo: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  videoUrl?: string | null;
  aspectRatio?: number | null;
  likesCount?: number;
  commentsCount?: number;
  tagsCount?: number;
  isLiked?: boolean;
  postId?: string | null;
  onTagTap?: () => void;
  thumbnailUrl?: string | null;
}

export const RegularPostCard: React.FC<RegularPostCardProps> = ({
  author,
  content,
  timeAgo,
  imageUrl,
  imageUrls,
  videoUrl,
  aspectRatio,
  likesCount = 0,
  commentsCount = 0,
  tagsCount = 0,
  isLiked = false,
  postId,
  onTagTap,
  thumbnailUrl,
}) => {
  const navigation = useNavigation() as any;
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);

  const allImages = React.useMemo(() => {
    const imgs: string[] = [];
    if (imageUrl) imgs.push(imageUrl);
    if (imageUrls) imgs.push(...imageUrls);
    return Array.from(new Set(imgs));
  }, [imageUrl, imageUrls]);

  const goToProfile = () => {
    if (author.id) {
      navigation.navigate('Profile', { userId: author.id });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToProfile}>
          <View style={styles.avatarContainer}>
            <AppAvatar
              imageUrl={author.profileImageUrl}
              size={44}
              showStatusRing={true}
              showActiveDot={true}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.displayName} numberOfLines={1}>
          {author.displayName || 'Unknown User'}
        </Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal color="rgba(255,255,255,0.6)" size={24} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <PostContent content={content} />

      {/* Media */}
      {videoUrl ? (
        <ChannelVideoPostWidget videoUrl={videoUrl} aspectRatio={aspectRatio} thumbnail={thumbnailUrl} />
      ) : allImages.length > 0 ? (
        <ChannelImagePostWidget images={allImages} />
      ) : null}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.actionsRight}>
          <LikeAction initialLikesCount={likesCount} initialIsLiked={isLiked} />
          <View style={{ width: 16 }} />
          <CommentActionWidget commentsCount={commentsCount} />
          <View style={{ width: 16 }} />
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (onTagTap) { onTagTap(); } else { setTagOverlayVisible(true); }
            }}
          >
            <Tag size={24} color="#FFFFFF" />
            <Text style={styles.actionText}>{tagsCount}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TagOverlay
        visible={tagOverlayVisible}
        onClose={() => setTagOverlayVisible(false)}
        postId={postId ?? ''}
        sourceChannelId=''
        linkChain={[]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  displayName: {
    flex: 1,
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  moreButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
  },
});
