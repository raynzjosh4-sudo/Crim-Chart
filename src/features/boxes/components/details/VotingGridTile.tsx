import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Heart, Play } from 'lucide-react-native';
import { VotingItem } from '../../data/dummyVotingBoxData';

interface Props {
  item: VotingItem;
  rank: number;
}

const { width } = Dimensions.get('window');
const TILE_MARGIN = 4;
const TILE_WIDTH = (width - 32 - TILE_MARGIN * 2) / 2; // 2 columns, 16px horizontal padding on sides

export function VotingGridTile({ item, rank }: Props) {
  const isKing = rank === 1;

  return (
    <View style={[styles.container, isKing && styles.kingContainer]}>
      {/* Media Background */}
      <Image source={{ uri: item.mediaUrl }} style={styles.image} contentFit="cover" />

      {/* Video Indicator Overlay */}
      {item.mediaType === 'video' && (
        <View style={styles.videoIndicator}>
          <Play size={16} color="#FFF" fill="#FFF" />
        </View>
      )}

      {/* Rank Badge */}
      <View style={[styles.rankBadge, isKing ? styles.rankBadgeGold : styles.rankBadgeStandard]}>
        <Text style={[styles.rankText, isKing && styles.rankTextDark]}>#{rank}</Text>
      </View>

      {/* Bottom Gradient / Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.likesBadge}>
            <Heart size={12} color="#FFF" fill="#FFF" />
            <Text style={styles.likesText}>{item.score.toLocaleString()}</Text>
          </View>
          <Image source={{ uri: item.addedBy.avatarUrl }} style={styles.userAvatar} contentFit="cover" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 1.3, // 3:4 aspect ratio approx
    margin: TILE_MARGIN,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
  },
  kingContainer: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankBadgeStandard: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  rankBadgeGold: {
    backgroundColor: '#FFD700',
  },
  rankText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  rankTextDark: {
    color: '#000',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.6)', // simple darkened bottom
  },
  titleRow: {
    marginBottom: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});
