import React from 'react';
import { FlatList, View, StyleSheet, Dimensions } from 'react-native';
import { MediaGridItem } from '../widgets/MediaGridItem';
import { SkeletonChartCard } from '../widgets/SkeletonChartCard';

interface PhotosProfileTabProps {
  userId?: string;
  photos?: string[];
  isLoading?: boolean;
}

const { width } = Dimensions.get('window');
const COLS = 3;
const ITEM_SIZE = (width - 4) / COLS;

export const PhotosProfileTab: React.FC<PhotosProfileTabProps> = ({
  photos = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonChartCard key={i} width={ITEM_SIZE - 2} height={ITEM_SIZE - 2} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      numColumns={COLS}
      keyExtractor={(_, i) => String(i)}
      renderItem={({ item }) => (
        <MediaGridItem imageUrl={item} size={ITEM_SIZE - 2} />
      )}
      contentContainerStyle={styles.grid}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  grid: { padding: 1, gap: 2 },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 1,
  },
});
