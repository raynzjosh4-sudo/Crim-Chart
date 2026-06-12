import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Crown } from 'lucide-react-native';

interface ChartBubblesProps {
  chartPoints: number;
  isCharted: boolean;
}

export const ChartBubbles: React.FC<ChartBubblesProps> = ({ chartPoints, isCharted }) => (
  <View style={[styles.bubble, isCharted && styles.bubbleActive]}>
    <Crown color={isCharted ? '#000' : '#FACD11'} size={16} />
    <Text style={[styles.count, isCharted && styles.countActive]}>{chartPoints}</Text>
  </View>
);

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(250,205,17,0.15)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(250,205,17,0.4)',
  },
  bubbleActive: { backgroundColor: '#FACD11' },
  count: { color: '#FACD11', fontWeight: '900', fontSize: 14 },
  countActive: { color: '#000' },
});
