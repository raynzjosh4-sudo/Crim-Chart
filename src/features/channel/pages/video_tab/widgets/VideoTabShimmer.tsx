import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
const {
  width
} = Dimensions.get('window');
export const VideoTabShimmer = () => {
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background
    },
    shimmer: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12
    },
    titleShimmer: {
      width: 100,
      height: 24,
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 12
    },
    bannerShimmer: {
      width: width - 30,
      height: 100,
      marginHorizontal: 15,
      borderRadius: 16
    },
    buttonRow: {
      alignItems: 'flex-end',
      paddingRight: 20,
      marginTop: 12,
      marginBottom: 12
    },
    buttonShimmer: {
      width: 140,
      height: 36,
      borderRadius: 20
    },
    grid: {
      flexDirection: 'row',
      paddingHorizontal: 8,
      gap: 8
    },
    column: {
      flex: 1
    }
  }));
  return <ScrollView style={styles.container} scrollEnabled={false}>
      {/* Moments Title Shimmer */}
      <View style={[styles.shimmer, styles.titleShimmer]} />
      
      {/* Promo Banner Shimmer */}
      <View style={[styles.shimmer, styles.bannerShimmer]} />
      
      {/* Post Button Shimmer */}
      <View style={styles.buttonRow}>
        <View style={[styles.shimmer, styles.buttonShimmer]} />
      </View>

      {/* Grid Shimmer */}
      <View style={styles.grid}>
        <View style={styles.column}>
          <View style={[styles.shimmer, {
          height: 220,
          marginBottom: 8
        }]} />
          <View style={[styles.shimmer, {
          height: 260,
          marginBottom: 8
        }]} />
          <View style={[styles.shimmer, {
          height: 210,
          marginBottom: 8
        }]} />
        </View>
        <View style={styles.column}>
          <View style={[styles.shimmer, {
          height: 300,
          marginBottom: 8
        }]} />
          <View style={[styles.shimmer, {
          height: 340,
          marginBottom: 8
        }]} />
          <View style={[styles.shimmer, {
          height: 290,
          marginBottom: 8
        }]} />
        </View>
      </View>
    </ScrollView>;
};