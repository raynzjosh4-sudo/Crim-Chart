import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from '@/components/skeletons/SkeletonBox';

export const SkeletonChannelListItem: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={{ gap: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.container}>
          <View style={styles.avatarStackArea}>
            <View style={[styles.avatarWrapper, { left: 26, zIndex: 1 }]}>
              <SkeletonBox width={44} height={44} borderRadius={22} />
            </View>
            <View style={[styles.avatarWrapper, { left: 13, zIndex: 2 }]}>
              <SkeletonBox width={44} height={44} borderRadius={22} />
            </View>
            <View style={[styles.avatarWrapper, { left: 0, zIndex: 3 }]}>
              <SkeletonBox width={44} height={44} borderRadius={22} />
            </View>
          </View>
          <View style={styles.textArea}>
            <View style={styles.row}>
              <SkeletonBox width={'65%'} height={16} />
              <SkeletonBox width={40} height={11} style={{ marginLeft: 16 }} />
            </View>
            <View style={[styles.row, { marginTop: 8 }]}>
              <SkeletonBox width={'85%'} height={14} />
              <View style={{ flexDirection: 'row', marginLeft: 16, gap: 12 }}>
                <SkeletonBox width={30} height={13} />
                <SkeletonBox width={30} height={13} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
  },
  avatarStackArea: {
    width: 75,
    height: 48,
  },
  avatarWrapper: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#000', // Matches scaffold background to fake the border
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
