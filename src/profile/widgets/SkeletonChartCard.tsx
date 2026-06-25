import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from '@/components/skeletons/SkeletonBox';

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
    <View style={{ width: width as any, height, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginRight: 10 }} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBox width={120} height={12} />
          <SkeletonBox width={80} height={10} />
        </View>
      </View>
      <SkeletonBox width={'100%'} height={120} borderRadius={8} style={{ marginTop: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <SkeletonBox width={60} height={12} />
        <SkeletonBox width={80} height={28} borderRadius={14} />
      </View>
    </View>
  );
};
