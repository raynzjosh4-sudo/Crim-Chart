import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart } from 'lucide-react-native';

interface CompetitorOverlayProps {
  competitorName: string;
  competitorAvatarUrl?: string;
  competitorLikes: number;
  myLikes: number;
}

export const CompetitorOverlay: React.FC<CompetitorOverlayProps> = ({
  competitorName,
  competitorAvatarUrl,
  competitorLikes,
  myLikes,
}) => {
  const total = myLikes + competitorLikes || 1;
  const myPercent = Math.round((myLikes / total) * 100);
  const theirPercent = 100 - myPercent;

  return (
    <View style={styles.overlay}>
      {/* VS bar */}
      <View style={styles.vsBar}>
        <View style={[styles.myBar, { flex: myPercent }]} />
        <View style={styles.vsTag}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={[styles.theirBar, { flex: theirPercent }]} />
      </View>

      {/* Competitor info */}
      <View style={styles.competitorRow}>
        <Image source={{ uri: competitorAvatarUrl ?? '' }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{competitorName}</Text>
          <View style={styles.likeRow}>
            <Heart color="#FF5252" size={12} fill="#FF5252" />
            <Text style={styles.likeCount}>{competitorLikes}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 100,
    left: 12,
    right: 12,
    gap: 8,
  },
  vsBar: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    alignItems: 'center',
  },
  myBar: { height: 4, backgroundColor: '#FACD11' },
  theirBar: { height: 4, backgroundColor: '#FF5252' },
  vsTag: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    zIndex: 1,
  },
  vsText: { color: '#000', fontWeight: '900', fontSize: 9 },
  competitorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-end',
  },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1A1A1A' },
  name: { color: '#FFF', fontWeight: '700', fontSize: 11 },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeCount: { color: '#FF5252', fontSize: 10, fontWeight: '700' },
});
