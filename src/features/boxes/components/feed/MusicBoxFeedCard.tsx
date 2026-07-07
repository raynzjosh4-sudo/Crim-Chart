import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { PostFooter } from '@/components/PostFooter/PostFooter';
import { PostHeader } from '@/components/PostHeader/PostHeader';
import { BoxFeedCardWrapper } from '@/components/wrappers/BoxFeedCardWrapper';
import { FeedPermissionsWrapper } from '@/components/wrappers/FeedPermissionsWrapper';
import { useStyles } from '@/core/hooks/useStyles';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MusicBoxTrackTile } from '../shared/MusicBoxTrackTile';
import { OpenBoxButton } from '../shared/OpenBoxButton';

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
              <View style={{ paddingBottom: 12, paddingTop: 4 }}>
                {ownerModel ? (
                  <PostHeader
                    author={ownerModel}
                    timeAgo={ownerModel.crownTitle || "Started a Music Box"}
                    onAvatarTap={() => router.push(`/profile/${ownerModel.id}` as any)}
                  />
                ) : null}
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
              <PostFooter
                likesCount={interactionState?.likesCount ?? 0}
                isLiked={interactionState?.isLiked ?? false}
                onLikePress={() => {
                  const targetId = boxModel.postId || boxId;
                  if (targetId) {
                    useInteractionStore.getState().toggleLike(targetId, undefined, 'posts');
                  }
                }}
                commentsCount={0}
                tagsCount={0}
                isTagged={interactionState?.isTagged ?? false}
                onTagPress={() => {
                  if (boxModel.postId) {
                    setTagOverlayVisible(true);
                  }
                }}
                iconSize={24}
                rightContent={<OpenBoxButton onPress={() => router.push(`/music-box/${boxId}` as any)} />}
                style={{ paddingTop: 16, paddingHorizontal: 16 }}
              />

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
    color: colors.text, // Keeping white over image overlay for contrast
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
});
