import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
// Assuming ShimmerEffect is a component you have for animated shimmer

export const DiscoverTopsShimmer: React.FC = () => {
  const color = 'rgba(255, 255, 255, 0.1)';
  const colorOpaque20 = 'rgba(255, 255, 255, 0.2)';
  const colorOpaque15 = 'rgba(255, 255, 255, 0.15)';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerBoxLeft, { backgroundColor: color }]} />
        <View style={[styles.headerBoxRight, { backgroundColor: color }]} />
      </View>
      <View style={styles.listContainer}>
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={[styles.card, { backgroundColor: color }]}>
                <View style={styles.avatarStack}>
                  <View style={[styles.mainAvatar, { backgroundColor: colorOpaque20 }]} />
                  <View style={[styles.competitorAvatar, styles.competitorAvatarLeft, { backgroundColor: colorOpaque15 }]} />
                  <View style={[styles.competitorAvatar, styles.competitorAvatarRight, { backgroundColor: colorOpaque15 }]} />
                </View>
                <View style={[styles.namePlaceholder, { backgroundColor: colorOpaque20 }]} />
                <View style={[styles.titlePlaceholder, { backgroundColor: colorOpaque20 }]} />
                <View style={[styles.countPlaceholder, { backgroundColor: colorOpaque20 }]} />
                <View style={[styles.joinButtonPlaceholder, { backgroundColor: colorOpaque20 }]} />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    width: '100%',
  },
  headerBoxLeft: {
    width: 120,
    height: 16,
    borderRadius: 4,
  },
  headerBoxRight: {
    width: 50,
    height: 16,
    borderRadius: 4,
  },
  listContainer: {
    height: 330,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  card: {
    width: 220,
    marginHorizontal: 6,
    marginVertical: 8,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarStack: {
    width: 140,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mainAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  competitorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.12)',
    position: 'absolute',
    bottom: 0,
  },
  competitorAvatarLeft: {
    left: 20,
  },
  competitorAvatarRight: {
    right: 20,
  },
  namePlaceholder: {
    width: 100,
    height: 15,
    borderRadius: 4,
    marginBottom: 8,
  },
  titlePlaceholder: {
    width: 140,
    height: 12,
    borderRadius: 4,
    marginBottom: 6,
  },
  countPlaceholder: {
    width: 40,
    height: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  joinButtonPlaceholder: {
    width: '100%',
    height: 40,
    borderRadius: 8,
  },
});

