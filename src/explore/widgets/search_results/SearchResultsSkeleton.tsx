import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonBox } from '@/components/skeletons/SkeletonBox';

export const SearchResultsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: 8 }).map((_, i) => (
        <View key={`skeleton-${i}`} style={styles.row}>
          {/* Avatar / Icon / Image placeholder */}
          <SkeletonBox width={48} height={48} borderRadius={24} />
          
          {/* Text lines */}
          <View style={styles.textContainer}>
            <SkeletonBox width={'60%'} height={14} style={{ marginBottom: 8 }} />
            <SkeletonBox width={'40%'} height={12} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
});
