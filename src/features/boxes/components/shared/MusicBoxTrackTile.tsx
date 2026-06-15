import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Play, ThumbsUp, ThumbsDown } from 'lucide-react-native';

export interface MusicBoxTrackTileProps {
  key?: string;
  song: {
    id: string;
    title: string;
    artist: string;
    thumbnailUrl: string;
    likes: number;
    dislikes: number;
    lyric?: string;
  };
}

export const MusicBoxTrackTile = ({ song }: MusicBoxTrackTileProps) => {
  const router = useRouter();

  return (
    <TouchableOpacity 
      style={styles.songRow}
      onPress={() => router.push('/now-playing')}
      activeOpacity={0.7}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: song.thumbnailUrl }} style={styles.songThumbnail} contentFit="cover" />
        <View style={styles.playOverlay}>
          <Play size={12} color="#FFF" fill="#FFF" />
        </View>
      </View>
      
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
      </View>

      <View style={styles.trackActions}>
        <TouchableOpacity style={styles.trackActionBtn}>
          <ThumbsUp size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.trackActionText}>{song.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.trackActionBtn}>
          <ThumbsDown size={14} color="rgba(255,255,255,0.6)" />
          <Text style={styles.trackActionText}>{song.dislikes}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  songThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    position: 'absolute',
  },
  playOverlay: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  songInfo: {
    flex: 1,
    marginRight: 8,
  },
  songTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  songArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 6,
  },
  trackActionText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
});
