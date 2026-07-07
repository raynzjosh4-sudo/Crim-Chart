import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { PostFooter } from '@/components/PostFooter/PostFooter';
import { PostHeader } from '@/components/PostHeader/PostHeader';
import { BoxFeedCardWrapper } from '@/components/wrappers/BoxFeedCardWrapper';
import { useStyles } from '@/core/hooks/useStyles';
import { useInteractionStore } from '@/core/store/useInteractionStore';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Play, Plus, Trophy } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { OpenBoxButton } from '../shared/OpenBoxButton';

interface Props { boxId: string; prefetchedData?: any; }
export const SportsBoxFeedCard = ({ boxId, prefetchedData }: Props) => {
  const router = useRouter();
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  if (!boxId) return null;

  return (
    <BoxFeedCardWrapper boxId={boxId} prefetchedData={prefetchedData}>
      {(rawData, boxModel, ownerModel, interactionState) => {
        const rawName = ownerModel?.displayName || 'Unknown';
        const topHighlight = rawData.trendingTracks?.[0];

        const scoreboard = boxModel.raw?.metadata?.scoreboard;

        return (
          <View style={styles.card}>
            {/* Post Header */}
            <View style={{ paddingBottom: 12, paddingTop: 4 }}>
              {ownerModel ? (
                <PostHeader
                  author={ownerModel}
                  timeAgo="Started a Live Sports Box"
                  onAvatarTap={() => router.push(`/profile/${ownerModel.id}` as any)}
                />
              ) : null}
            </View>

            {/* Middle Row: Scoreboard + Add Button */}
            {scoreboard && (
              <View style={styles.middleSectionRow}>
                {/* Compact Live Scoreboard */}
                <View style={styles.scoreboardContainer}>
                  <View style={styles.teamColumn}>
                    <View style={[styles.teamLogo, { backgroundColor: scoreboard.homeTeam.logoColor || '#FFF' }]} />
                    <Text style={styles.teamName}>{scoreboard.homeTeam.name}</Text>
                  </View>

                  <View style={styles.scoreCenter}>
                    <Text style={styles.scoreText}>
                      {scoreboard.homeTeam.score} - {scoreboard.awayTeam.score}
                    </Text>
                    <View style={styles.liveBadgeRow}>
                      <View style={styles.liveDot} />
                      <Text style={styles.periodText}>{scoreboard.period} {scoreboard.timeRemaining}</Text>
                    </View>
                  </View>

                  <View style={styles.teamColumn}>
                    <Text style={styles.teamName}>{scoreboard.awayTeam.name}</Text>
                    <View style={[styles.teamLogo, { backgroundColor: scoreboard.awayTeam.logoColor || '#FFF' }]} />
                  </View>
                </View>

                <TouchableOpacity activeOpacity={1} style={styles.addBtnTop}>
                  <Plus size={14} color="#FFF" />
                  <Text style={styles.addTextTop}>Add</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Box Description */}
            <View style={styles.descContainer}>
              <Text style={styles.boxTitle}>{boxModel.title}</Text>
            </View>

            {/* Featured Highlight */}
            {topHighlight && (
              <TouchableOpacity
                style={styles.featuredHighlight}
                activeOpacity={0.9}
                onPress={() => router.push(`/sports-box/${boxId}` as any)}
              >
                <Image source={{ uri: topHighlight.thumbnailUrl || topHighlight.mediaUrl }} style={styles.highlightImage} contentFit="cover" />
                <View style={styles.highlightOverlay}>
                  <View style={styles.highlightBadge}>
                    <Trophy size={14} color="#FFF" />
                    <Text style={styles.highlightBadgeText}>Top Play</Text>
                  </View>
                  <View style={styles.playIconContainer}>
                    <Play fill="#FFF" color="#FFF" size={32} />
                  </View>
                  <View style={styles.highlightInfo}>
                    <Text style={styles.highlightTitle} numberOfLines={2}>{topHighlight.title}</Text>
                    <Text style={styles.highlightAddedBy}>Added by {topHighlight.artist}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

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
              rightContent={<OpenBoxButton onPress={() => router.push(`/sports-box/${boxId}` as any)} />}
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
    paddingVertical: 16 * scale,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16 * scale,
    marginBottom: 16 * scale,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: colors.text,
    fontSize: 16 * scale,
    fontWeight: '700',
  },
  timeAgo: {
    color: colors.textSecondary,
    fontSize: 12 * scale,
    marginTop: 2 * scale,
  },
  middleSectionRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginHorizontal: 16 * scale,
    marginBottom: 16 * scale,
  },
  scoreboardContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 12 * scale,
    paddingHorizontal: 12 * scale,
    borderRadius: 12 * scale,
    marginRight: 12 * scale,
  },
  addBtnTop: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12 * scale,
    borderRadius: 8 * scale,
  },
  addTextTop: {
    color: colors.text,
    fontSize: 12 * scale,
    fontWeight: '700',
    marginTop: 2 * scale,
  },
  teamColumn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 24 * scale,
    height: 24 * scale,
    borderRadius: 12 * scale,
  },
  teamName: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '800',
    marginHorizontal: 8 * scale,
  },
  scoreCenter: {
    alignItems: 'center',
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2 * scale,
  },
  liveDot: {
    width: 4 * scale,
    height: 4 * scale,
    borderRadius: 2 * scale,
    backgroundColor: colors.error,
    marginRight: 4 * scale,
  },
  scoreText: {
    color: colors.text,
    fontSize: 20 * scale,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  periodText: {
    color: colors.error,
    fontSize: 10 * scale,
    fontWeight: '700',
  },
  descContainer: {
    paddingHorizontal: 16 * scale,
    marginBottom: 12 * scale,
  },
  boxTitle: {
    color: colors.text,
    fontSize: 18 * scale,
    fontWeight: '800',
  },
  featuredHighlight: {
    marginHorizontal: 16 * scale,
    height: 200 * scale,
    borderRadius: 16 * scale,
    overflow: 'hidden',
  },
  highlightImage: {
    width: '100%',
    height: '100%',
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 16 * scale,
  },
  highlightBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10 * scale,
    paddingVertical: 6 * scale,
    borderRadius: 8 * scale,
  },
  highlightBadgeText: {
    color: colors.text,
    fontSize: 12 * scale,
    fontWeight: '800',
    marginLeft: 6 * scale,
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 * scale }, { translateY: -16 * scale }],
  },
  highlightInfo: {
    justifyContent: 'flex-end',
  },
  highlightTitle: {
    color: colors.text,
    fontSize: 16 * scale,
    fontWeight: '800',
    marginBottom: 4 * scale,
  },
  highlightAddedBy: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12 * scale,
    fontWeight: '600',
  },
});
