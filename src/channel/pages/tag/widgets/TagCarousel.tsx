import React from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { TagCard } from './TagCard';

export interface TagCarouselItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  onTap: () => void;
}

interface TagCarouselProps {
  cards: TagCarouselItem[];
  title?: string | null;
  trailingText?: string | null;
  isLoadingMore?: boolean;
  onEndReached?: () => void;
}

export const TagCarousel: React.FC<TagCarouselProps> = ({
  cards,
  title,
  trailingText,
  isLoadingMore = false,
  onEndReached,
}) => {
  const handleScroll = (e: any) => {
    if (!onEndReached) return;
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    if (contentOffset.x + layoutMeasurement.width >= contentSize.width - 150) {
      onEndReached();
    }
  };

  return (
    <View>
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {trailingText && <Text style={styles.trailing}>{trailingText}</Text>}
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        decelerationRate="fast"
        // ← no fixed height, let content define it
      >
        {cards.map((item) => (
          <View key={item.id} style={{ marginRight: 10 }}>
            <TagCard
              title={item.title}
              description={item.description}
              imageUrl={item.imageUrl}
              buttonText="Tag"
              onTap={item.onTap}
            />
          </View>
        ))}
        {isLoadingMore && (
          <View style={styles.loadMore}>
            <ActivityIndicator color="rgba(255,255,255,0.24)" />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    fontWeight: '900',
  },
  trailing: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 4,
    alignItems: 'flex-start',
  },
  loadMore: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
