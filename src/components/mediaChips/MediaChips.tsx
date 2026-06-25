import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export interface AlbumData {
  id: string;
  title: string;
}

interface MediaChipsProps {
  activeTabIndex: number; // 0 = photos, 1 = videos, 2 = music
  selectedAlbum: string | null;
  onAlbumSelected: (albumId: string | null) => void;
}

export const MediaChips: React.FC<MediaChipsProps> = ({ activeTabIndex, selectedAlbum, onAlbumSelected }) => {
  const [albums, setAlbums] = useState<AlbumData[]>([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') return;

      // Fetch all device albums
      const fetchedAlbums = await MediaLibrary.getAlbumsAsync();
      
      const formatted: AlbumData[] = [
        { id: 'all', title: 'Recents' },
        ...fetchedAlbums.map(a => ({ id: a.id, title: a.title }))
      ];
      
      setAlbums(formatted);
    };

    fetchAlbums();
  }, [activeTabIndex]);

  if (albums.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {albums.map((album, index) => {
          const isSelected = selectedAlbum === album.id || (!selectedAlbum && album.id === 'all');
          return (
            <TouchableOpacity activeOpacity={1}
              key={album.id}
              style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
              onPress={() => onAlbumSelected(album.id === 'all' ? null : album.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isSelected ? styles.chipTextSelected : styles.chipTextUnselected]}>
                {album.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#FACD11', // primary color
  },
  chipUnselected: {
    backgroundColor: '#333333', // surfaceContainerHighest
  },
  chipText: {
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#000',
    fontWeight: '900',
  },
  chipTextUnselected: {
    color: '#FFF',
    fontWeight: '600',
  },
});
