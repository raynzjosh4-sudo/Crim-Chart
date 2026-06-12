import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface ImageCardMediaProps {
  url: string;
  creatorAvatarUrl?: string;
  themeColor?: string;
  username?: string;
  subtitle?: string;
  showThumbnail?: boolean;
}

export const ImageCardMedia: React.FC<ImageCardMediaProps> = ({ url }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: url }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
