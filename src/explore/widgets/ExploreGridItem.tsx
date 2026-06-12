import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play } from 'lucide-react-native';
import { ExploreItemModel } from '../models/ExploreItemModel';

interface ExploreGridItemProps {
  item: ExploreItemModel;
  onPress?: () => void;
}

export const ExploreGridItem: React.FC<ExploreGridItemProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.container, { aspectRatio: item.aspectRatio || 1 }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.imageUrl ?? '' }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <View style={styles.gradient} />

      {item.isVideo && (
        <View style={styles.playIcon}>
          <Play color="#FFF" size={24} fill="#FFF" />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.likes}>❤️ {item.likes}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1A1A1A',
    marginBottom: 8,
    position: 'relative',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)', // simplify gradient for TS
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -12,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
  },
  likes: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
});
