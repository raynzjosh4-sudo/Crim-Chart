import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect, useState, useRef } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Music } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import { Audio } from 'expo-av';
import { MediaItem, MediaType, MediaSource } from '../models/MediaItem';
import { MusicListTile } from '../components/MusicListTile';
import { AudioInfoSheet } from '../components/AudioInfoSheet';
interface MusicTabProps {
  selectedItems: Record<string, MediaItem>;
  onToggleSelection: (id: string, item: MediaItem) => void;
  externalSelectedAlbum: string | null;
}
export const MusicTab: React.FC<MusicTabProps> = ({
  selectedItems,
  onToggleSelection,
  externalSelectedAlbum
}) => {
  const styles = useStyles(colors => ({
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    },
    text: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 16,
      textAlign: 'center'
    },
    itemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 8,
      backgroundColor: '#1E1E1E',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'transparent'
    },
    itemContainerSelected: {
      borderColor: '#FACD11',
      backgroundColor: 'rgba(250, 205, 17, 0.1)'
    },
    thumbnail: {
      width: 48,
      height: 48,
      borderRadius: 8,
      marginRight: 12,
      backgroundColor: '#333'
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
      borderColor: 'rgba(250, 205, 17, 0.2)'
    },
    infoContainer: {
      flex: 1
    },
    titleText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4
    },
    artistText: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 14
    },
    checkmarkContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FACD11',
      justifyContent: 'center',
      alignItems: 'center'
    },
    checkmark: {
      width: 10,
      height: 10,
      backgroundColor: colors.background,
      borderRadius: 5
    }
  }));
  const [musicList, setMusicList] = useState<MediaItem[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedAudioForInfo, setSelectedAudioForInfo] = useState<MediaItem | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);
  useEffect(() => {
    (async () => {
      const {
        status
      } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);
  useEffect(() => {
    if (!hasPermission) return;
    const loadMusic = async () => {
      const {
        assets
      } = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 50,
        sortBy: ['creationTime'],
        ...(externalSelectedAlbum ? {
          album: externalSelectedAlbum
        } : {})
      });
      const mediaItems: MediaItem[] = assets.map(asset => ({
        id: asset.id,
        path: asset.uri,
        type: MediaType.audio,
        title: asset.filename || 'Unknown Track',
        artist: 'Unknown Artist',
        source: MediaSource.device,
        // expo-media-library doesn't extract audio covers by default,
        // but if populated by a future metadata pass, it will display.
        thumbnailUrl: undefined
      }));
      setMusicList(mediaItems);
    };
    loadMusic();
  }, [hasPermission, externalSelectedAlbum]);
  if (hasPermission === false) {
    return <View style={styles.center}><Text style={styles.text}>No access to media</Text></View>;
  }
  const handlePlayPause = async (item: MediaItem) => {
    try {
      if (playingId === item.id) {
        // Stop current playback
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setPlayingId(null);
      } else {
        // Stop previous if playing
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        setPlayingId(item.id);
        const {
          sound
        } = await Audio.Sound.createAsync({
          uri: item.path
        }, {
          shouldPlay: true
        });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingId(null);
          }
        });
      }
    } catch (e) {
      console.error('Audio play error:', e);
      setPlayingId(null);
    }
  };
  return <>
      <FlatList data={musicList} keyExtractor={item => item.id} style={{
      flex: 1,
      backgroundColor: '#0D0D0D'
    }} contentContainerStyle={{
      paddingBottom: 16
    }} renderItem={({
      item
    }) => {
      const isSelected = !!selectedItems[item.id];
      // Use the stored item from selectedItems if available to show updated title/artist/thumbnail
      const displayItem = isSelected ? selectedItems[item.id] : item;
      return <MusicListTile title={displayItem.title || 'Unknown Track'} subtitle={`By ${displayItem.artist || 'Unknown Artist'}`} thumbnailUrl={displayItem.thumbnailUrl} isSelected={isSelected} isPlaying={playingId === item.id} onPress={() => {
        if (isSelected) {
          // Deselect if already selected
          onToggleSelection(item.id, displayItem);
        } else {
          // Open info sheet before selecting
          setSelectedAudioForInfo(displayItem);
        }
      }} onPlayPress={() => handlePlayPause(displayItem)} />;
    }} ListEmptyComponent={hasPermission === true ? <View style={styles.center}>
              <Text style={styles.text}>No audio files found on device.</Text>
            </View> : null} />
      <AudioInfoSheet visible={!!selectedAudioForInfo} onClose={() => setSelectedAudioForInfo(null)} mediaItem={selectedAudioForInfo} onConfirm={updatedItem => {
      onToggleSelection(updatedItem.id, updatedItem);
    }} />
    </>;
};