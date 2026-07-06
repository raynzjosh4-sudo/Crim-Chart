import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
export const MemberPageShimmer = () => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    storyBarShimmer: {
      flexDirection: 'row',
      padding: 16,
      gap: 12
    },
    storyCardShimmer: {
      width: 105,
      height: 180,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    headerShimmer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      marginTop: 8
    },
    titleShimmer: {
      width: 120,
      height: 24,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    exploreShimmer: {
      width: 60,
      height: 20,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    listItemShimmer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16
    },
    avatarShimmer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    infoShimmer: {
      flex: 1,
      marginLeft: 12,
      gap: 8
    },
    nameShimmer: {
      width: 100,
      height: 16,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    subtitleShimmer: {
      width: 140,
      height: 12,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    },
    buttonShimmer: {
      width: 70,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.05)'
    }
  }));
  return <ScrollView style={styles.container} scrollEnabled={false}>
      {/* Story Bar Shimmer */}
      <View style={styles.storyBarShimmer}>
        {[1, 2, 3, 4].map(i => <View key={i} style={styles.storyCardShimmer} />)}
      </View>

      {/* Header Shimmer */}
      <View style={styles.headerShimmer}>
        <View style={styles.titleShimmer} />
        <View style={styles.exploreShimmer} />
      </View>

      {/* List Shimmer */}
      {[1, 2, 3, 4, 5].map(i => <View key={i} style={styles.listItemShimmer}>
          <View style={styles.avatarShimmer} />
          <View style={styles.infoShimmer}>
            <View style={styles.nameShimmer} />
            <View style={styles.subtitleShimmer} />
          </View>
          <View style={styles.buttonShimmer} />
        </View>)}
    </ScrollView>;
};