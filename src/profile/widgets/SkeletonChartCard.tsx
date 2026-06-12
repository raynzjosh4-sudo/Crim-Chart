import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SkeletonChartCardProps {
  width?: number | string;
  height?: number;
  key?: string | number;
}

export const SkeletonChartCard: React.FC<SkeletonChartCardProps> = ({
  width = '100%',
  height = 200,
}) => {
  return (
    <View style={[styles.card, { width: width as any, height }]}>
      <View style={styles.avatarRow}>
        <View style={styles.avatar} />
        <View style={styles.nameBlock}>
          <View style={[styles.shimmer, { width: 120, height: 12 }]} />
          <View style={[styles.shimmer, { width: 80, height: 10, marginTop: 6 }]} />
        </View>
      </View>
      <View style={[styles.shimmer, { width: '100%', height: 120, borderRadius: 8, marginTop: 12 }]} />
      <View style={styles.footerRow}>
        <View style={[styles.shimmer, { width: 60, height: 12 }]} />
        <View style={[styles.shimmer, { width: 80, height: 28, borderRadius: 14 }]} />
      </View>
    </View>
  );
};

const SHIMMER = 'rgba(255,255,255,0.08)';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    overflow: 'hidden',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: SHIMMER,
  },
  nameBlock: {
    marginLeft: 10,
    flex: 1,
  },
  shimmer: {
    backgroundColor: SHIMMER,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
});
