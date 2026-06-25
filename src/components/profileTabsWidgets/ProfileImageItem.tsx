import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';

interface ProfileImageItemProps {
  imageUrl: string | null;
  size: number | string;
  onPress?: () => void;
}

export const ProfileImageItem: React.FC<ProfileImageItemProps> = ({ imageUrl, size, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.container, { width: size, aspectRatio: 2 / 3 }]}
    >
      <Image
        source={{ uri: imageUrl || 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=Photo' }}
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
    borderRadius: 0,
    backgroundColor: '#1A1A1A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
});
