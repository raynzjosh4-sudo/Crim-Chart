import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { VotingItem } from '../../data/dummyVotingBoxData';

interface Props {
  item: VotingItem;
  isKing?: boolean;
}

export function VotingBattleCompetitor({ item, isKing }: Props) {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: item.mediaUrl }} 
        style={[styles.image, isKing ? styles.imageKing : styles.imageChallenger]} 
        contentFit="cover" 
      />
      <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
      <View style={styles.likeRow}>
        <TouchableOpacity style={styles.likeBtn}>
          <Heart size={16} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.votes}>{item.score.toLocaleString()} likes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  image: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 12,
  },
  imageKing: {
    height: 240,
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  imageChallenger: {
    height: 180,
    opacity: 0.85,
  },
  title: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  likeBtn: {
    marginRight: 6,
  },
  votes: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '800',
  },
});
