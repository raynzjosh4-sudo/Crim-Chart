import { LikeAction } from '@/channel/CRimChartMassageBubble/comment_action/like/LikeAction';
import { CommentActionWidget } from '@/channel/CRimChartMassageBubble/comments/CommentActionWidget';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import UserAvatar from '@/components/avatar/UserAvatar';
import { BoxFeedCardWrapper } from '@/components/wrappers/BoxFeedCardWrapper';
import { FeedPermissionsWrapper } from '@/components/wrappers/FeedPermissionsWrapper';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Film, MoreHorizontal, Play, Plus, Tag } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OpenBoxButton } from '../shared/OpenBoxButton';
import { MovieBoxVideoPreviewTile } from './MovieBoxVideoPreviewTile';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

interface Props { boxId?: string; prefetchedData?: any; }
export const MovieBoxFeedCard = ({ boxId, prefetchedData }: Props) => {
  if (!boxId) return null;
  const router = useRouter();
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  return (
    <BoxFeedCardWrapper boxId={boxId} prefetchedData={prefetchedData}>
      {(rawData, boxModel, ownerModel, interactionState) => {
        const formattedDate = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(rawData.created_at || Date.now()));


        const rawName = ownerModel?.displayName || 'Unknown';

        return (
          <FeedPermissionsWrapper permissions={{ canComment: true, canSubmit: boxModel?.allowSubmissions ?? true }}>
          <View style={styles.card}>
            {/* Header: User Info */}
            <View style={styles.header}>
              <View style={styles.userInfo}>
                <View style={{ marginRight: 12 }}>
                  <UserAvatar
                    userId={ownerModel?.id || ''}
                    fallbackUrl={ownerModel?.profileImageUrl}
                    name={rawName}
                    size={40}
                  />
                </View>
                <View>
                  <Text style={styles.userName}>{rawName}</Text>
                  <Text style={styles.timeAgo}>Curated a new Video Box</Text>
                </View>
              </View>
              <View style={styles.headerRight}>
                <Text style={styles.dateText}>{formattedDate}</Text>
                <TouchableOpacity activeOpacity={1}>
                  <MoreHorizontal color={theme.colors.textSecondary} size={20} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Cinematic Cover Art (16:9) */}
            <View style={[styles.cinematicContainer, !boxModel.coverImageUrl && { backgroundColor: '#111' }]}>
              {boxModel.coverImageUrl ? (
                <Image source={{ uri: boxModel.coverImageUrl }} style={styles.coverImage as any} contentFit="cover" />
              ) : (
                <View style={[styles.coverImage, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Film size={48} color="rgba(255,255,255,0.2)" />
                </View>
              )}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)', '#000']}
                style={styles.gradientOverlay}
              />

              <View style={styles.boxDetails}>
                <Text style={styles.boxTitle}>{boxModel.title}</Text>
                <Text style={styles.boxDesc} numberOfLines={2}>{rawData.description || ''}</Text>
              </View>
            </View>

            {/* Up Next / Video Preview Rail */}
            <View style={styles.upNextSection}>
              <Text style={styles.upNextHeader}>Video Preview</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railContent}>
                {/* Add Yours Tile */}
                <TouchableOpacity activeOpacity={1} style={styles.addYoursTile} onPress={() => {
                  router.push(`/movie-box/post/${boxId}` as any);
                }}>
                  <View style={styles.addYoursIconContainer}>
                    <Play size={20} color={theme.colors.text} fill={theme.colors.text} />
                    <View style={styles.addYoursPlusBadge}>
                      <Plus size={10} color={theme.colors.background} strokeWidth={3} />
                    </View>
                  </View>
                  <Text style={styles.addYoursText}>Add Yours</Text>
                </TouchableOpacity>

                {/* Mapped Videos (Max 10) */}
                {(rawData.trendingTracks || []).slice(0, 10).map((video: any) => (
                  <MovieBoxVideoPreviewTile key={video.id} video={video} />
                ))}

                {/* Show More Tile */}
                {(rawData.trendingTracks || []).length > 10 && (
                  <TouchableOpacity activeOpacity={1} style={styles.showMoreTile} onPress={() => router.push(`/movie-box/${boxId}` as any)}>
                    <MoreHorizontal size={24} color={theme.colors.text} />
                    <Text style={styles.showMoreText}>Show More</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
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
              <View style={styles.rightActions}>
                <OpenBoxButton onPress={() => router.push(`/movie-box/${boxId}` as any)} />
              </View>
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
  cinematicContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative' as const,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  boxDetails: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16 * scale,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 26 * scale,
    fontWeight: '900' as const,
    marginBottom: 4 * scale,
  },
  boxDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13 * scale,
    lineHeight: 18 * scale,
  },
  featuredHighlight: {
    marginHorizontal: 16 * scale,
    height: 200 * scale,
    borderRadius: 16 * scale,
    overflow: 'hidden' as const,
    marginTop: 16 * scale,
  },
  highlightImage: {
    width: '100%',
    height: '100%',
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between' as const,
    padding: 16 * scale,
  },
  highlightBadge: {
    alignSelf: 'flex-start' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.error,
    paddingHorizontal: 10 * scale,
    paddingVertical: 6 * scale,
    borderRadius: 8 * scale,
  },
  highlightBadgeText: {
    color: colors.text,
    fontSize: 12 * scale,
    fontWeight: '800' as const,
    marginLeft: 6 * scale,
  },
  playIconContainer: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 * scale }, { translateY: -16 * scale }],
  },
  highlightInfo: {
    justifyContent: 'flex-end' as const,
  },
  highlightTitle: {
    color: colors.text,
    fontSize: 16 * scale,
    fontWeight: '800' as const,
    marginBottom: 4 * scale,
  },
  highlightAddedBy: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    fontWeight: '600' as const,
  },
  upNextSection: {
    marginTop: 16 * scale,
  },
  upNextHeader: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '700' as const,
    paddingHorizontal: 16 * scale,
    marginBottom: 12 * scale,
  },
  railContent: {
    paddingHorizontal: 16 * scale,
    gap: 12 * scale,
  },
  addYoursTile: {
    width: 140 * scale,
    height: 80 * scale,
    borderRadius: 8 * scale,
    borderWidth: 1,
    borderColor: colors.surfaceVariant,
    borderStyle: 'dashed' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'transparent',
  },
  addYoursIconContainer: {
    position: 'relative' as const,
    marginBottom: 6 * scale,
  },
  addYoursPlusBadge: {
    position: 'absolute' as const,
    bottom: -4 * scale,
    right: -8 * scale,
    backgroundColor: colors.text,
    width: 14 * scale,
    height: 14 * scale,
    borderRadius: 7 * scale,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  addYoursText: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    fontWeight: '700' as const,
  },
  showMoreTile: {
    width: 140 * scale,
    height: 80 * scale,
    borderRadius: 8 * scale,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  showMoreText: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    fontWeight: '700' as const,
    marginTop: 4 * scale,
  },
  actionBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16 * scale,
    paddingTop: 20 * scale,
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
  rightActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
});
