import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';

export const StoryListShimmer: React.FC = () => {
  const color = 'rgba(255, 255, 255, 0.1)';

  // Calculate hexagon points dynamically
  const size = 72;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  const polygonPoints = points.join(' ');

  return (
    <View style={styles.container}>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <View key={index} style={styles.itemContainer}>
              <Svg width={72} height={72}>
                <Polygon points={polygonPoints} fill={color} />
              </Svg>
              <View style={[styles.textPlaceholder, { backgroundColor: color }]} />
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 110,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    marginRight: 16,
    alignItems: 'center',
  },
  textPlaceholder: {
    width: 50,
    height: 10,
    borderRadius: 4,
    marginTop: 8,
  },
});

