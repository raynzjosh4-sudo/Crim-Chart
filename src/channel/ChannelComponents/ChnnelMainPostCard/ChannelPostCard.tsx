import { CrimChartUserModel } from '@/profile/models/CrimChartUserModel';
import { useNavigation } from '@react-navigation/native';
import { MoreHorizontal, Tag } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { AvatarWithStatus } from './postCardFiles/AvatarWithStatus';
import { ChannelAudioPostWidget } from './postCardFiles/ChannelAudioPostWidget';
import { ChannelImagePostWidget } from './postCardFiles/ChannelImagePostWidget';
import { ChannelVideoPostWidget } from './postCardFiles/ChannelVideoPostWidget';
import { PostContent } from './postCardFiles/PostContent';
import { TaggerRow } from './postCardFiles/TaggerRow';

export interface ChannelPostCardProps {
  authorData: CrimChartUserModel;
  content: string;
  timeAgo: string;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  aspectRatio?: number | null;
  likesCount?: number;
  commentsCount?: number;
  tagsCount?: number;
  isLiked?: boolean;
  postId?: string | null;
  onTagTap?: () => void;
  channelId?: string | null;
  channelName?: string | null;
  currentChannelAvatar?: string | null;
  sourceChannelName?: string | null;
  sourceChannelAvatar?: string | null;
  taggerName?: string | null;
  taggerAvatar?: string | null;
  showCreatorBadge?: boolean;
  thumbnailUrl?: string | null;
  metadata?: any;
}

export const ChannelPostCard: React.FC<ChannelPostCardProps> = ({
  authorData: author,
  content,
  timeAgo,
  imageUrl,
  imageUrls,
  videoUrl,
  audioUrl,
  aspectRatio,
  likesCount = 0,
  commentsCount = 0,
  tagsCount = 0,
  isLiked = false,
  postId,
  onTagTap,
  channelId,
  channelName,
  currentChannelAvatar,
  sourceChannelName,
  sourceChannelAvatar,
  taggerName,
  taggerAvatar,
  showCreatorBadge,
  thumbnailUrl,
  metadata,
}) => {
  const navigation = useNavigation() as any;
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);

  const allImages = React.useMemo(() => {
    const imgs: string[] = [];
    if (imageUrl) imgs.push(imageUrl);
    if (imageUrls) imgs.push(...imageUrls);
    return Array.from(new Set(imgs));
  }, [imageUrl, imageUrls]);

  const hasChannel = Boolean(channelId);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {hasChannel && (
          <AvatarWithStatus
            channelId={channelId}
            currentChannelAvatar={currentChannelAvatar}
            sourceChannelAvatar={sourceChannelAvatar}
            authorAvatar={author.profileImageUrl}
          />
        )}
        <View style={styles.authorInfoContainer}>
          <Text style={styles.displayName} numberOfLines={1}>
            {author.displayName || 'Unknown User'}
          </Text>
          {sourceChannelName ? (
            <Text style={styles.taggedText}>
              Tagged from {sourceChannelName}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <MoreHorizontal color="rgba(255,255,255,0.6)" size={20} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <PostContent content={content} />

      {/* Media */}
      {audioUrl ? (
        <ChannelAudioPostWidget audioUrl={audioUrl} thumbnailUrl={thumbnailUrl ?? undefined} metadata={metadata} />
      ) : videoUrl ? (
        <ChannelVideoPostWidget videoUrl={videoUrl} aspectRatio={aspectRatio} thumbnail={thumbnailUrl} />
      ) : allImages.length > 0 ? (
        <ChannelImagePostWidget images={allImages} />
      ) : null}

      {/* Tagger Row */}
      <TaggerRow taggerName={taggerName} taggerAvatar={taggerAvatar} tagsCount={tagsCount} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
        <View style={{ flex: 1 }} />

        <LikeAction initialLikesCount={likesCount} initialIsLiked={isLiked} />
        <CommentActionWidget commentsCount={commentsCount} postId={postId || ''} />

        <TouchableOpacity
          style={[styles.actionButton, { marginLeft: 24 }]}
          onPress={() => {
            if (onTagTap) { onTagTap(); } else { setTagOverlayVisible(true); }
          }}
        >
          <Tag size={24} color="#FFFFFF" />
          <Text style={styles.actionText}>{tagsCount}</Text>
        </TouchableOpacity>
      </View>

      <TagOverlay
        visible={tagOverlayVisible}
        onClose={() => setTagOverlayVisible(false)}
        postId={postId ?? ''}
        sourceChannelId={channelId ?? ''}
        linkChain={[]}
        channelName={channelName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  authorInfoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  displayName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  taggedText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  moreButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
  },
  timeAgo: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '500',
  },
});
