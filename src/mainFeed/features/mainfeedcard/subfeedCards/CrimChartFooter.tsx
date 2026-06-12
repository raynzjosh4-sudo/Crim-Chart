import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';

interface CrimChartFooterProps {
  username: string;
  chartName: string;
  mutualCount?: number;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  isCharted: boolean;
  chartPoints: number;
  themeColor?: string;
  onChartTap: () => void;
  onLikeTap?: () => void;
}

export const CrimChartFooter: React.FC<CrimChartFooterProps> = ({
  likes,
  comments,
  isLiked = false,
  isCharted,
  chartPoints,
  themeColor = '#FACD11',
  onChartTap,
  onLikeTap,
}) => {
  return (
    <View style={styles.container}>
      {/* Engagement counters */}
      <View style={styles.engagementRow}>
        <TouchableOpacity style={styles.engBtn} onPress={onLikeTap}>
          <Heart
            color={isLiked ? '#FF5252' : 'rgba(255,255,255,0.6)'}
            size={20}
            fill={isLiked ? '#FF5252' : 'none'}
          />
          <Text style={[styles.engText, isLiked && { color: '#FF5252' }]}>
            {likes != null ? likes : '–'}
          </Text>
        </TouchableOpacity>

        <View style={styles.engBtn}>
          <MessageCircle color="rgba(255,255,255,0.6)" size={20} />
          <Text style={styles.engText}>{comments != null ? comments : '–'}</Text>
        </View>
      </View>

      {/* Chart button */}
      <TouchableOpacity
        style={[
          styles.chartBtn,
          { backgroundColor: isCharted ? themeColor : 'rgba(255,255,255,0.12)' },
        ]}
        onPress={onChartTap}
        activeOpacity={0.85}
      >
        <Text
          style={[styles.chartBtnText, { color: isCharted ? '#000' : '#FFF' }]}
        >
          👑 {chartPoints} Crowns
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  engagementRow: { flexDirection: 'row', gap: 16 },
  engBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  engText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600' },
  chartBtn: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  chartBtnText: { fontWeight: '800', fontSize: 13 },
});
