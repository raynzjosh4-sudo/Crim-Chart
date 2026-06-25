import React, { useState } from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Text } from 'react-native';
import { Play } from 'lucide-react-native';
import { Video, ResizeMode } from 'expo-av';

interface ProfileVideoItemProps {
  thumbnailUrl: string;
  durationLabel?: string;
  size: number | string;
  videoUrl?: string;
  onPress?: () => void;
}

export const ProfileVideoItem: React.FC<ProfileVideoItemProps> = ({
  thumbnailUrl,
  durationLabel,
  size,
  videoUrl,
  onPress,
}) => {
  const [isHoverPlaying, setIsHoverPlaying] = useState(false);

  return (
    <TouchableOpacity activeOpacity={1}
      style={[styles.container, { width: size, aspectRatio: 2 / 3 }]}
      onPress={onPress}
      onPressIn={() => setIsHoverPlaying(true)}
      onPressOut={() => setIsHoverPlaying(false)}
      delayPressIn={150}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: thumbnailUrl || 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=Video' }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      
      {isHoverPlaying && videoUrl && (
        <Video
          source={{ uri: videoUrl }}
          style={StyleSheet.absoluteFillObject}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
      )}

      {!isHoverPlaying && (
        <View style={styles.playOverlay}>
          <Play color="#FFF" size={18} fill="#FFF" />
        </View>
      )}

      {durationLabel && (
        <Text style={styles.duration}>{durationLabel}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#1A1A1A',
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  duration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
});
