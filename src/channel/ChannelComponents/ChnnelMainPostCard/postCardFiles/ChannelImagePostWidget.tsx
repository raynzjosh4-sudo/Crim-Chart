import React from 'react';
import { View, StyleSheet, Image, FlatList, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ChannelImagePostWidgetProps {
  images: string[];
  aspectRatio?: number; // width / height of the first image
}

export const ChannelImagePostWidget: React.FC<ChannelImagePostWidgetProps> = ({ images, aspectRatio }) => {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    const imgHeight = aspectRatio ? SCREEN_WIDTH / aspectRatio : 400;
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: images[0] }}
          style={[styles.singleImageFull, { height: imgHeight }]}
          resizeMode="contain"
        />
      </View>
    );
  }

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
            style={[styles.image, styles.multiImage]}
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
  singleImageFull: {
    width: '100%',
    height: 350,
    backgroundColor: '#1A1A1A',
  },
  multiImage: {
    width: 220,
  },
});
