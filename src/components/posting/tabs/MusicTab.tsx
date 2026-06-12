import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Music } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import { MediaItem, MediaType, MediaSource } from '../models/MediaItem';

interface MusicTabProps {
  selectedItems: Record<string, MediaItem>;
  onToggleSelection: (id: string, item: MediaItem) => void;
  externalSelectedAlbum: string | null;
}

export const MusicTab: React.FC<MusicTabProps> = ({ selectedItems, onToggleSelection, externalSelectedAlbum }) => {
  const [musicList, setMusicList] = useState<MediaItem[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (!hasPermission) return;

    const loadMusic = async () => {
      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 50,
        sortBy: ['creationTime'],
        ...(externalSelectedAlbum ? { album: externalSelectedAlbum } : {}),
      });

      const mediaItems: MediaItem[] = assets.map((asset) => ({
        id: asset.id,
        path: asset.uri,
        type: MediaType.audio,
        title: asset.filename || 'Unknown Track',
        artist: 'Unknown Artist', 
        source: MediaSource.device,
        // expo-media-library doesn't extract audio covers by default,
        // but if populated by a future metadata pass, it will display.
        thumbnailUrl: undefined, 
      }));

      setMusicList(mediaItems);
    };

    loadMusic();
  }, [hasPermission, externalSelectedAlbum]);

  if (hasPermission === false) {
    return <View style={styles.center}><Text style={styles.text}>No access to media</Text></View>;
  }

  return (
    <FlatList
      data={musicList}
      keyExtractor={(item) => item.id}
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => {
        const isSelected = !!selectedItems[item.id];
        return (
          <TouchableOpacity
            style={[styles.itemContainer, isSelected && styles.itemContainerSelected]}
            activeOpacity={0.8}
            onPress={() => onToggleSelection(item.id, item)}
          >
            {item.thumbnailUrl ? (
              <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
            ) : (
              <View style={styles.iconPlaceholder}>
                <Music color="#FACD11" size={22} />
              </View>
            )}
            <View style={styles.infoContainer}>
              <Text style={styles.titleText}>{item.title}</Text>
              <Text style={styles.artistText}>{item.artist}</Text>
            </View>
            {isSelected && (
              <View style={styles.checkmarkContainer}>
                <View style={styles.checkmark} />
              </View>
            )}
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        hasPermission === true ? (
          <View style={styles.center}>
            <Text style={styles.text}>No audio files found on device.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemContainerSelected: {
    borderColor: '#FACD11',
    backgroundColor: 'rgba(250, 205, 17, 0.1)',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#333',
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(250, 205, 17, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(250, 205, 17, 0.2)',
  },
  infoContainer: {
    flex: 1,
  },
  titleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  checkmarkContainer: {
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
