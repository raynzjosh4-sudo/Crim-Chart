import React from 'react';
import { View } from 'react-native';
import { SkeletonBox } from '@/components/skeletons/SkeletonBox';
import { useCurrentTheme } from '@/core/store/useThemeStore';

export const MainFeedSkeletonCard = () => {
  const theme = useCurrentTheme();
  return (
  <View style={{ backgroundColor: theme.colors.background, marginBottom: 20, paddingVertical: 12 }}>
    {/* Header */}
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 }}>
      <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginRight: 12 }} />
      <View style={{ flex: 1, gap: 6 }}>
        <SkeletonBox width={130} height={13} />
        <SkeletonBox width={80} height={11} />
      </View>
      <SkeletonBox width={24} height={8} borderRadius={4} />
    </View>

    {/* Media */}
    <SkeletonBox width={'100%'} height={320} borderRadius={0} />

    {/* Actions */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <SkeletonBox width={26} height={26} borderRadius={13} />
        <SkeletonBox width={26} height={26} borderRadius={13} />
        <SkeletonBox width={26} height={26} borderRadius={13} />
      </View>
      <SkeletonBox width={26} height={26} borderRadius={13} />
    </View>

    {/* Caption */}
    <View style={{ paddingHorizontal: 16, gap: 8 }}>
      <SkeletonBox width={'88%'} height={13} />
      <SkeletonBox width={'55%'} height={11} />
    </View>
  </View>
  );
};
