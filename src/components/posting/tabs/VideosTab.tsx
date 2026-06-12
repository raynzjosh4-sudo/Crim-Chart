import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { Play } from 'lucide-react-native';
import { MediaItem, MediaType, MediaSource } from '../models/MediaItem';

interface VideosTabProps {
  selectedItems: Record<string, MediaItem>;
  onToggleSelection: (id: string, item: MediaItem) => void;
  externalSelectedAlbum: string | null;
}

export const VideosTab: React.FC<VideosTabProps> = ({ selectedItems, onToggleSelection, externalSelectedAlbum }) => {
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const loadVideos = async () => {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'video',
        first: 50,
        sortBy: ['creationTime'],
        ...(externalSelectedAlbum ? { album: externalSelectedAlbum } : {}),
      });

      const mediaItems: MediaItem[] = assets.map((asset) => ({
        id: asset.id,
        path: asset.uri,
        type: MediaType.video,
        thumbnailUrl: asset.uri,
        source: MediaSource.device,
        // Store formatted duration string in artist field as a workaround
        artist: asset.duration ? `${Math.floor(asset.duration / 60)}:${Math.floor(asset.duration % 60).toString().padStart(2, '0')}` : '0:00'
      }));

      setVideos(mediaItems);
    };

    loadVideos();
  }, [hasPermission, externalSelectedAlbum]);

  const renderItem = React.useCallback(({ item }: { item: MediaItem }) => {
    const isSelected = !!selectedItems[item.id];
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => onToggleSelection(item.id, item)}
      >
        <Image source={{ uri: item.thumbnailUrl }} style={styles.image} />
        <View style={styles.videoBadge}>
          <Play color="#FFF" size={16} fill="#FFF" />
        </View>
        {isSelected && (
          <View style={styles.selectedOverlay}>
            <View style={styles.checkmarkContainer}>
              <View style={styles.checkmark} />
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  }, [selectedItems, onToggleSelection]);

  if (hasPermission === false) {
    return <View style={styles.center}><Text style={styles.text}>No access to videos</Text></View>;
  }

  return (
    <FlatList
      data={videos}
      extraData={selectedItems}
      keyExtractor={(item) => item.id}
      numColumns={3}
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 2 }}
      renderItem={renderItem}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={5}
      removeClippedSubviews={true}
      ListEmptyComponent={
        hasPermission === true ? (
          <View style={styles.center}>
            <Text style={styles.text}>No videos found on device.</Text>
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
  itemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 2,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  videoBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    margin: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 2,
    borderColor: '#FACD11',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FACD11',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 10,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 5,
  }
});
