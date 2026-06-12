import React from 'react';
import { View, StyleSheet, Image, FlatList } from 'react-native';

interface ChannelImagePostWidgetProps {
  images: string[];
}

export const ChannelImagePostWidget: React.FC<ChannelImagePostWidgetProps> = ({ images }) => {
  if (!images || images.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={images}
        keyExtractor={(item, index) => `${item}-${index}`}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={[styles.image, images.length === 1 ? styles.singleImage : styles.multiImage]}
            resizeMode="cover"
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  image: {
    height: 300,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: '#1A1A1A',
  },
  singleImage: {
    width: 340, // or '100%' if preferred, but dart uses fixed aspect for single vs multi
  },
  multiImage: {
    width: 220,
  },
});
