import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ThemeShimmer from '@/components/ui/ThemeShimmer';

export const PaginationShimmer = () => {
  return (
    <View style={styles.trackTile}>
      <View style={styles.header}>
        <ThemeShimmer isCircle width={36} height={36} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <ThemeShimmer width={120} height={14} style={{ marginBottom: 6 }} />
          <ThemeShimmer width={80} height={12} />
        </View>
      </View>
      <View style={styles.mainRow}>
        <ThemeShimmer isCircle width={180} height={180} style={{ marginRight: 16 }} />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ThemeShimmer width={'80%'} height={18} style={{ marginBottom: 12 }} />
          <ThemeShimmer width={'60%'} height={14} />
        </View>
      </View>
      <View style={styles.actionBar}>
        <ThemeShimmer width={40} height={24} style={{ marginRight: 24 }} />
        <ThemeShimmer width={40} height={24} style={{ marginRight: 24 }} />
        <ThemeShimmer width={40} height={24} />
      </View>
    </View>
  );
};

export const FullPageShimmer = () => {
  return (
    <ScrollView style={styles.container} scrollEnabled={false} showsVerticalScrollIndicator={false}>
      {/* Trending Widget Shimmer */}
      <View style={styles.widgetContainer}>
        <ThemeShimmer width={150} height={20} style={{ marginBottom: 12, marginLeft: 16 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
          {[1, 2, 3].map((key) => (
            <View key={key} style={{ marginRight: 12 }}>
              <ThemeShimmer width={140} height={140} borderRadius={16} style={{ marginBottom: 8 }} />
              <ThemeShimmer width={100} height={14} style={{ marginBottom: 4 }} />
              <ThemeShimmer width={80} height={12} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Contributors Shimmer */}
      <View style={styles.widgetContainer}>
        <ThemeShimmer width={180} height={20} style={{ marginBottom: 12, marginLeft: 16 }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
          {[1, 2, 3, 4, 5].map((key) => (
            <View key={key} style={{ marginRight: 16, alignItems: 'center' }}>
              <ThemeShimmer isCircle width={56} height={56} style={{ marginBottom: 8 }} />
              <ThemeShimmer width={50} height={12} />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Tracks Shimmer */}
      {[1, 2].map((key) => (
        <View key={key}>
          <PaginationShimmer />
          <View style={styles.separator} />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  widgetContainer: {
    marginBottom: 32,
  },
  trackTile: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    marginTop: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
    marginHorizontal: 16,
  },
});
