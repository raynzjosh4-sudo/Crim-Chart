import { useRouter } from 'expo-router';
import { MoreHorizontal } from 'lucide-react-native';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VotingItem } from '../../data/dummyVotingBoxData';
import { OpenBoxButton } from '../shared/OpenBoxButton';
import { VotingBattleCompetitor } from './VotingBattleCompetitor';

// Removed Props interface as we will use dummy data directly

export function VotingBoxFeedCard() {
  const router = useRouter();
  const post = require('../../data/dummyVotingBoxData').dummyVotingBoxPost;
  const { id: boxId, title, description } = post.box;
  const topItems = post.items;
  const creator = post.creator;

  // Ensure we have exactly 3 for the podium layout
  const first = topItems[0];
  const second = topItems[1];
  const third = topItems[2];

  const handleOpenBox = () => {
    router.push(`/voting-box/${boxId}` as any);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.headerLeft}>
          <Image source={{ uri: creator.avatarUrl }} style={styles.creatorAvatar} />
          <View>
            <Text style={styles.creatorName}>{creator.name}</Text>
            <Text style={styles.actionText}>Started a Voting Box</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      {/* Box Info */}
      <View style={styles.boxInfo}>
        <Text style={styles.boxTitle}>{title}</Text>
        <Text style={styles.boxDescription} numberOfLines={2}>{description}</Text>
      </View>

      {/* The Battle Preview: #1 vs #2 */}
      <View style={styles.battleContainer}>
        {/* The Reigning King (#1) */}
        {first && <VotingBattleCompetitor item={first} isKing={true} />}

        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* The Challenger (#2) */}
        {second && <VotingBattleCompetitor item={second} isKing={false} />}
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.joinBtn}>
          <Text style={styles.joinBtnText}>Add</Text>
        </TouchableOpacity>
        <OpenBoxButton onPress={handleOpenBox} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#121212',
    marginBottom: 8,
    paddingTop: 16,
    paddingBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  creatorName: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  boxInfo: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  boxTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  boxDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  battleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center', // aligns VS badge in middle, competitors will center their images
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  vsText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  joinBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
