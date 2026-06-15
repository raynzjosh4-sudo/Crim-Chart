import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import ThemeShimmer from '@/components/ui/ThemeShimmer';

const { width } = Dimensions.get('window');

export const MusicListTileShimmer = () => {
  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        {/* The Disk Shimmer */}
        <ThemeShimmer 
          width={180} 
          height={180} 
          borderRadius={90} 
          isCircle 
        />

        {/* Track Info Shimmer */}
        <View style={styles.trackInfo}>
          <ThemeShimmer width={120} height={20} style={{ marginBottom: 8 }} />
          <ThemeShimmer width={80} height={16} style={{ marginBottom: 16 }} />
          <ThemeShimmer width={60} height={24} borderRadius={12} />
        </View>
      </View>

      {/* Bottom Action Bar Shimmer */}
      <View style={styles.actionBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <ThemeShimmer width={30} height={20} />
          <ThemeShimmer width={30} height={20} />
          <ThemeShimmer width={30} height={20} />
        </View>
        <ThemeShimmer width={20} height={20} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    backgroundColor: '#000',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  mainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  trackInfo: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
});
