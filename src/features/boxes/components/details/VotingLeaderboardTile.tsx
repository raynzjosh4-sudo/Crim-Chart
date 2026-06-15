import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ChevronUp, ChevronDown, MessageCircle, Crown } from 'lucide-react-native';
import { VotingItem } from '../../data/dummyVotingBoxData';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  item: VotingItem;
  rank: number;
}

export function VotingLeaderboardTile({ item, rank }: Props) {
  const isKing = rank === 1;

  if (isKing) {
    return (
      <View style={styles.kingContainer}>
        {/* Crown & Rank Badge */}
        <View style={styles.kingBadge}>
          <Crown size={20} color="#FFD700" />
          <Text style={styles.kingBadgeText}>CURRENT KING</Text>
        </View>

        {/* Massive Image */}
        <View style={styles.kingImageContainer}>
          <Image source={{ uri: item.mediaUrl }} style={styles.kingImage} contentFit="cover" />
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.8)']} 
            style={styles.kingGradient}
          />
          <View style={styles.kingOverlayDetails}>
            <Text style={styles.kingTitle}>{item.title}</Text>
            <View style={styles.kingAuthorRow}>
              <Image source={{ uri: item.addedBy.avatarUrl }} style={styles.authorAvatar} />
              <Text style={styles.authorName}>by {item.addedBy.name}</Text>
            </View>
          </View>
        </View>

        {/* Voting Actions */}
        <View style={styles.kingActionsRow}>
          <View style={styles.voteBox}>
            <TouchableOpacity style={styles.voteBtn}>
              <ChevronUp size={32} color="#4ADE80" />
            </TouchableOpacity>
            <Text style={styles.kingScore}>{item.score.toLocaleString()}</Text>
            <TouchableOpacity style={styles.voteBtn}>
              <ChevronDown size={32} color="#F87171" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.commentBtn}>
            <MessageCircle size={24} color="#FFF" />
            <Text style={styles.commentCount}>{item.commentsCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Standard Challenger Row (Rank 2+)
  return (
    <View style={styles.challengerContainer}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankNumber}>#{rank}</Text>
      </View>

      <Image source={{ uri: item.mediaUrl }} style={styles.challengerImage} contentFit="cover" />

      <View style={styles.challengerDetails}>
        <Text style={styles.challengerTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.authorNameSub}>by {item.addedBy.name}</Text>
        
        <View style={styles.challengerMeta}>
          <MessageCircle size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.challengerMetaText}>{item.commentsCount}</Text>
        </View>
      </View>

      <View style={styles.challengerVotes}>
        <TouchableOpacity style={styles.voteBtnSmall}>
          <ChevronUp size={24} color="#4ADE80" />
        </TouchableOpacity>
        <Text style={styles.challengerScore}>{item.score.toLocaleString()}</Text>
        <TouchableOpacity style={styles.voteBtnSmall}>
          <ChevronDown size={24} color="#F87171" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // KING STYLES
  kingContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  kingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  kingBadgeText: {
    color: '#FFD700',
    fontWeight: '900',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 1,
  },
  kingImageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  kingImage: {
    width: '100%',
    height: '100%',
  },
  kingGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  kingOverlayDetails: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  kingTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  kingAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  kingActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  voteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteBtn: {
    padding: 4,
  },
  kingScore: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
    marginHorizontal: 16,
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  commentCount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },

  // CHALLENGER STYLES
  challengerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rankBadge: {
    width: 30,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 16,
    fontWeight: '800',
  },
  challengerImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  challengerDetails: {
    flex: 1,
  },
  challengerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  authorNameSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 8,
  },
  challengerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  challengerMetaText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginLeft: 4,
  },
  challengerVotes: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  voteBtnSmall: {
    padding: 2,
  },
  challengerScore: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 4,
  },
});
