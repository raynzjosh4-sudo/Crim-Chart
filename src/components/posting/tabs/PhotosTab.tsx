import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { MediaItem, MediaType, MediaSource } from '../models/MediaItem';

interface PhotosTabProps {
  selectedItems: Record<string, MediaItem>;
  onToggleSelection: (id: string, item: MediaItem) => void;
  externalSelectedAlbum: string | null;
}

export const PhotosTab: React.FC<PhotosTabProps> = ({ selectedItems, onToggleSelection, externalSelectedAlbum }) => {
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const loadPhotos = async () => {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'photo',
        first: 50,
        sortBy: ['creationTime'],
        ...(externalSelectedAlbum ? { album: externalSelectedAlbum } : {}),
      });

      const mediaItems: MediaItem[] = assets.map((asset) => ({
        id: asset.id,
        path: asset.uri,
        type: MediaType.photo,
        thumbnailUrl: asset.uri,
        source: MediaSource.device,
      }));

      setPhotos(mediaItems);
    };

    loadPhotos();
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
    return <View style={styles.center}><Text style={styles.text}>No access to photos</Text></View>;
  }

  return (
    <FlatList
      data={photos}
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
        <View style={styles.center}>
          <Text style={styles.text}>
            {hasPermission === null ? 'Requesting permissions...' : 'No photos found.'}
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: '#FFF'
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
