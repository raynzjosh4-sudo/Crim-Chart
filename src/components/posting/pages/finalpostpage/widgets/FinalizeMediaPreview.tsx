import React from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import { PlayCircle, Music } from 'lucide-react-native';
import { MediaItem, MediaType } from '@/components/posting/models/MediaItem';

interface FinalizeMediaPreviewProps {
  selectedMedia: MediaItem[];
}

export const FinalizeMediaPreview: React.FC<FinalizeMediaPreviewProps> = ({ selectedMedia }) => {
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={selectedMedia}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          return (
            <View style={styles.mediaContainer}>
              <Image 
                source={{ uri: item.thumbnailUrl || item.path }} 
                style={styles.image} 
              />
              
              {item.type === MediaType.video && (
                <View style={styles.centerOverlay}>
                  <PlayCircle color="#FFF" size={36} />
                </View>
              )}
              
              {item.type === MediaType.audio && (
                <View style={styles.bottomRightOverlay}>
                  <View style={styles.iconCircle}>
                    <Music color="#FFF" size={16} />
                  </View>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 240,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mediaContainer: {
    width: 180,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#333',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRightOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  iconCircle: {
    padding: 6,
    backgroundColor: 'rgba(0,0,0,0.54)',
    borderRadius: 16,
  },
});
