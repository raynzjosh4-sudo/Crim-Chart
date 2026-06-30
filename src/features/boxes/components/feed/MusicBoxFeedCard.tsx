import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import UserAvatar from '@/components/avatar/UserAvatar';
import { BoxFeedCardWrapper } from '@/components/wrappers/BoxFeedCardWrapper';
import { FeedPermissionsWrapper } from '@/components/wrappers/FeedPermissionsWrapper';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MoreHorizontal, Plus, Tag } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OpenBoxButton } from '../shared/OpenBoxButton';
import { MusicBoxTrackTile } from '../shared/MusicBoxTrackTile';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useState } from 'react';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

interface Props { boxId: string; prefetchedData?: any; }
export const MusicBoxFeedCard = ({ boxId, prefetchedData }: Props) => {
  const router = useRouter();
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  if (!boxId) return null;

  return (
    <BoxFeedCardWrapper boxId={boxId} prefetchedData={prefetchedData}>
      {(rawData, boxModel, ownerModel, interactionState) => {
        const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(rawData.created_at || Date.now()));

        const rawName = ownerModel?.displayName || 'Unknown';
        const shortenedName = rawName.length > 18 ? rawName.substring(0, 18) + '...' : rawName;

        return (
          <FeedPermissionsWrapper permissions={{ canComment: true, canSubmit: boxModel?.allowSubmissions ?? true }}>
            <View style={styles.card}>
              {/* Header: User Info */}
            <View style={styles.header}>
              <View style={[styles.userInfo, { flex: 1 }]}>
                <View style={{ marginRight: 12 }}>
                  <UserAvatar
                    size={48}
                    userId={ownerModel?.id || ''}
                    fallbackUrl={ownerModel?.profileImageUrl}
                    name={shortenedName}
                  />
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
                    {shortenedName}
                  </Text>
                  {ownerModel?.crownTitle ? (
                    <Text style={styles.timeAgo}>{ownerModel.crownTitle}</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.dateText}>{formattedDate}</Text>
                <TouchableOpacity activeOpacity={1}>
                  <MoreHorizontal color={theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Box Content */}
            <View style={styles.boxContent}>
              <Image
                source={{ uri: boxModel.coverImageUrl }}
                style={styles.coverImage as any}
                contentFit="cover"
              />

              {/* Overlay Details */}
              <View style={styles.overlay}>
                <View style={styles.boxDetails}>
                  <Text style={styles.boxTitle}>{boxModel.title}</Text>
                  <Text style={styles.boxDesc} numberOfLines={2}>{boxModel.raw?.description || ''}</Text>
                </View>
              </View>
            </View>

            {/* Preview List (The Songs inside) */}
            <View style={styles.previewList}>
              <Text style={styles.previewHeader}>Trending tracks in this box</Text>
              {(rawData.trendingTracks || []).slice(0, 2).map((song: any) => (
                <MusicBoxTrackTile key={song.id} song={song} />
              ))}
              <TouchableOpacity activeOpacity={1} style={styles.addTrackBtn} onPress={() => router.push(`/music-box/post/${boxId}` as any)}>
                <Plus size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.addTrackText}>Add your track to this Box</Text>
              </TouchableOpacity>
            </View>

            {/* Action Bar */}
            <View style={styles.actionBar}>
              <View style={styles.leftActions}>
                <LikeAction 
                  initialLikesCount={interactionState?.likesCount ?? 0} 
                  initialIsLiked={interactionState?.isLiked ?? false} 
                  onLikeTap={() => {
                    if (boxModel.postId) {
                      useInteractionStore.getState().toggleLike(boxModel.postId, undefined, 'posts');
                    }
                  }}
                />
                <CommentActionWidget commentsCount={0} postId={boxModel.postId} />
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  style={[styles.actionBtn, { marginLeft: 24, marginRight: 0 }]}
                  onPress={() => {
                    if (boxModel.postId) {
                      setTagOverlayVisible(true);
                    }
                  }}
                >
                  <Tag color={interactionState?.isTagged ? theme.colors.primary : theme.colors.text} size={24} />
                  <Text style={[styles.actionText, interactionState?.isTagged && { color: theme.colors.primary }]}>{0}</Text>
                </TouchableOpacity>
              </View>

              <OpenBoxButton onPress={() => router.push(`/music-box/${boxId}` as any)} />
            </View>

            <TagOverlay
              visible={tagOverlayVisible}
              onClose={() => setTagOverlayVisible(false)}
              postId={boxModel.postId ?? ''}
              sourceChannelId=""
              linkChain={[]}
            />
          </View>
          </FeedPermissionsWrapper>
        );
      }}
    </BoxFeedCardWrapper>
  );
};

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  card: {
    backgroundColor: colors.background,
    borderBottomWidth: 8 * scale,
    borderBottomColor: colors.background,
    paddingVertical: 12 * scale,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16 * scale,
    marginBottom: 12 * scale,
  },
  userInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  userName: {
    color: colors.text,
    fontSize: 16 * scale,
    fontWeight: '700' as const,
  },
  timeAgo: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    marginTop: 2 * scale,
  },
  headerRight: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    marginRight: 12 * scale,
  },
  boxContent: {
    marginHorizontal: 16 * scale,
    height: 160 * scale,
    borderRadius: 16 * scale,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end' as const,
    padding: 16 * scale,
  },
  boxDetails: {
    justifyContent: 'flex-end' as const,
  },
  boxTitle: {
    color: '#FFF', // Keeping white over image overlay for contrast
    fontSize: 24 * scale,
    fontWeight: '900' as const,
    marginBottom: 4 * scale,
  },
  boxDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14 * scale,
  },
  previewList: {
    backgroundColor: 'transparent',
    marginHorizontal: 16 * scale,
    marginTop: 12 * scale,
    borderRadius: 16 * scale,
    padding: 16 * scale,
  },
  previewHeader: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
  },
  addTrackBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderStyle: 'dashed' as const,
    borderRadius: 8 * scale,
    paddingVertical: 10 * scale,
    marginTop: 4 * scale,
  },
  addTrackText: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
    fontWeight: '600' as const,
    marginLeft: 6 * scale,
  },
  actionBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16 * scale,
    paddingTop: 16 * scale,
  },
  leftActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  actionBtn: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginRight: 24 * scale,
  },
  actionText: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '600' as const,
    marginLeft: 6 * scale,
  },
});
