import { BoxFeedCardWrapper } from '@/components/wrappers/BoxFeedCardWrapper';
import { useRouter } from 'expo-router';
import { PostHeader } from '@/components/PostHeader/PostHeader';
import { MoreHorizontal } from 'lucide-react-native';
import UserAvatar from '@/components/avatar/UserAvatar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useState } from 'react';
import { OpenBoxButton } from '../shared/OpenBoxButton';
import { VotingBattleCompetitor } from './VotingBattleCompetitor';
import { TagOverlay } from '@/channel/pages/tag/TagOverlay';
import { useStyles } from '@/core/hooks/useStyles';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import { ThemeTokens } from '@/core/theme/themes';

interface Props { boxId: string; prefetchedData?: any; }
export const VotingBoxFeedCard = ({ boxId, prefetchedData }: Props) => {
  const router = useRouter();
  const [tagOverlayVisible, setTagOverlayVisible] = useState(false);
  const styles = useStyles(themeStyles);
  const theme = useCurrentTheme();

  const handleOpenBox = () => {
    router.push(`/voting-box/${boxId}` as any);
  };

  return (
    <BoxFeedCardWrapper boxId={boxId} prefetchedData={prefetchedData}>
      {(rawData, boxModel, ownerModel, interactionState) => {
        const rawName = ownerModel?.displayName || 'Unknown';
        const topItems = rawData.trendingTracks || [];
        const first = topItems[0];
        const second = topItems[1];

        return (
          <View style={styles.cardContainer}>
            {/* Post Header */}
            <View style={{ paddingBottom: 12, paddingTop: 4 }}>
              {ownerModel ? (
                <PostHeader
                  author={ownerModel}
                  timeAgo="Started a Voting Box"
                  onAvatarTap={() => router.push(`/profile/${ownerModel.id}` as any)}
                />
              ) : null}
            </View>

            {/* Box Info */}
            <View style={styles.boxInfo}>
              <Text style={styles.boxTitle}>{boxModel.title}</Text>
              <Text style={styles.boxDescription} numberOfLines={2}>{boxModel.raw?.description || ''}</Text>
            </View>

            {/* The Battle Preview: #1 vs #2 */}
            <View style={styles.battleContainer}>
              {/* The Reigning King (#1) */}
              {first && <VotingBattleCompetitor item={first} isKing={true} />}

              {first && second && (
                <View style={styles.vsBadge}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
              )}

              {/* The Challenger (#2) */}
              {second && <VotingBattleCompetitor item={second} isKing={false} />}
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              <TouchableOpacity activeOpacity={1} style={styles.joinBtn}>
                <Text style={styles.joinBtnText}>Add</Text>
              </TouchableOpacity>
              <OpenBoxButton onPress={handleOpenBox} />
            </View>

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
}

const themeStyles = (colors: ThemeTokens, scale: number): any => ({
  cardContainer: {
    backgroundColor: colors.background,
    marginBottom: 8 * scale,
    paddingTop: 16 * scale,
    paddingBottom: 16 * scale,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16 * scale,
    marginBottom: 12 * scale,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 36 * scale,
    height: 36 * scale,
    borderRadius: 18 * scale,
    marginRight: 10 * scale,
  },
  creatorName: {
    color: colors.text,
    fontSize: 15 * scale,
    fontWeight: '700',
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 13 * scale,
  },
  boxInfo: {
    paddingHorizontal: 16 * scale,
    marginBottom: 20 * scale,
  },
  boxTitle: {
    color: colors.text,
    fontSize: 22 * scale,
    fontWeight: '900',
    marginBottom: 4 * scale,
  },
  boxDescription: {
    color: colors.textSecondary,
    fontSize: 14 * scale,
    lineHeight: 20 * scale,
  },
  battleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center', // aligns VS badge in middle, competitors will center their images
    marginBottom: 20 * scale,
    paddingHorizontal: 16 * scale,
  },
  vsBadge: {
    width: 32 * scale,
    height: 32 * scale,
    borderRadius: 16 * scale,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8 * scale,
  },
  vsText: {
    color: colors.text,
    fontSize: 12 * scale,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16 * scale,
    marginTop: 10 * scale,
  },
  joinBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16 * scale,
    paddingVertical: 8 * scale,
    borderRadius: 20 * scale,
  },
  joinBtnText: {
    color: colors.text,
    fontSize: 14 * scale,
    fontWeight: '600',
  },
});
