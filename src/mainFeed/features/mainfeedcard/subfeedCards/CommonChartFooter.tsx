import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, MessageSquare } from 'lucide-react-native';

interface CommonChartFooterProps {
  username: string;
  chartName: string;
  mutualCount: number;
  likes?: number | null;
  comments?: number | null;
  isLiked?: boolean | null;
  isCharted: boolean;
  chartPoints: number;
  themeColor: string;
  onChartTap: () => void;
}

export const CommonChartFooter: React.FC<CommonChartFooterProps> = ({
  likes, comments, isLiked, isCharted, chartPoints, themeColor, onChartTap
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <Heart color={isLiked ? '#F44336' : '#9E9E9E'} fill={isLiked ? '#F44336' : 'transparent'} size={20} />
        <Text style={styles.statText}>{likes != null ? likes : '-'}</Text>
        <View style={{ width: 16 }} />
        <MessageSquare color="#9E9E9E" size={20} />
        <Text style={styles.statText}>{comments != null ? comments : '-'}</Text>
      </View>
      
      <TouchableOpacity
        onPress={onChartTap}
        style={[styles.button, { backgroundColor: isCharted ? themeColor : '#EEEEEE' }]}
        activeOpacity={0.8}
      >
        <Text style={[styles.buttonText, { color: isCharted ? '#FFFFFF' : '#000000' }]}>
          {chartPoints} Crowns
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    color: '#FFF',
    fontSize: 14,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 14,
  }
});
