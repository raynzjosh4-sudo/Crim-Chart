import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import ThemeShimmer from '@/components/ui/ThemeShimmer';
import { MoviePostingItemShimmer } from '@/components/shimmers/MoviePostingShimmer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  widgetContainer: {
    marginBottom: 32,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
    marginHorizontal: 16,
  },
});

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
          <MoviePostingItemShimmer />
          <View style={styles.separator} />
        </View>
      ))}
    </ScrollView>
  );
};
