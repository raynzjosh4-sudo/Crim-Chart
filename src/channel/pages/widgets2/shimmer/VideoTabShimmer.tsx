import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ShimmerEffect } from './ShimmerEffect';

export const VideoTabShimmer: React.FC = () => {
  const baseColor = '#1A1A1A'; // Equivalent to Colors.grey[900]
  const cardColor = 'rgba(255,255,255,0.08)'; // Equivalent to Colors.white with opacity

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{ flex: 1, backgroundColor: baseColor }}
    >
      <ShimmerEffect>
        <View style={styles.container}>
          {/* 1. "Moments" Title Placeholder */}
          <View style={styles.titlePadding}>
            <View style={[styles.title, { backgroundColor: cardColor }]} />
          </View>

          {/* 2. Horizontal Carousel Section */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            style={styles.carouselContainer}
          >
            {[1, 2, 3, 4].map((key) => (
              <View
                key={key}
                style={[styles.carouselCard, { backgroundColor: cardColor }]}
              />
            ))}
          </ScrollView>

          {/* 3. Middle Info & "Post a Moment" Button Section */}
          <View style={styles.infoSection}>
            <View style={[styles.infoTitle, { backgroundColor: cardColor }]} />
            <View style={[styles.infoSubtitle1, { backgroundColor: cardColor }]} />
            <View style={[styles.infoSubtitle2, { backgroundColor: cardColor }]} />
            
            <View style={styles.buttonContainer}>
              <View style={[styles.button, { backgroundColor: cardColor }]} />
            </View>
          </View>

          {/* 4. Grid Section */}
          <View style={styles.gridContainer}>
            {[1, 2, 3, 4].map((key) => (
              <View
                key={key}
                style={[styles.gridCard, { backgroundColor: cardColor }]}
              />
            ))}
          </View>

          <View style={{ height: 30 }} />
        </View>
      </ShimmerEffect>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  titlePadding: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  carouselContainer: {
    height: 220,
    maxHeight: 220,
  },
  horizontalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  carouselCard: {
    width: 110,
    height: '100%',
    borderRadius: 16,
  },
  infoSection: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    width: '100%',
  },
  infoTitle: {
    width: 120,
    height: 18,
    borderRadius: 4,
    marginBottom: 8,
  },
  infoSubtitle1: {
    width: 200,
    height: 10,
    borderRadius: 4,
    marginBottom: 6,
  },
  infoSubtitle2: {
    width: 80,
    height: 10,
    borderRadius: 4,
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'flex-end',
  },
  button: {
    width: 140,
    height: 40,
    borderRadius: 20,
  },
  gridContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  gridCard: {
    width: '48%', // Roughly crossAxisCount: 2
    aspectRatio: 0.85,
    borderRadius: 12,
  },
});
