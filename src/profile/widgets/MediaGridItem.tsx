import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';

interface MediaGridItemProps {
  imageUrl: string;
  size: number;
  onPress?: () => void;
}

export const MediaGridItem: React.FC<MediaGridItemProps> = ({ imageUrl, size, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.container, { width: size, height: size }]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#1A1A1A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
