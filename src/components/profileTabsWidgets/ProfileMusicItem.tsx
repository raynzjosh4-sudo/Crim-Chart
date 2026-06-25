import React from 'react';
import { TouchableOpacity, Image, StyleSheet, View, Text } from 'react-native';

interface ProfileMusicItemProps {
  thumbnailUrl: string;
  title?: string;
  artist?: string;
  size: number | string;
  onPress?: () => void;
}

export const ProfileMusicItem: React.FC<ProfileMusicItemProps> = ({
  thumbnailUrl,
  title,
  artist,
  size,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { width: size, aspectRatio: 0.6 }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        <Image
          source={{ uri: thumbnailUrl || 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=Music' }}
          style={[styles.image, { width: '80%', aspectRatio: 1, borderRadius: 999 }]}
          resizeMode="cover"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Unknown Title'}
          </Text>
          <View style={styles.artistRow}>
            <Image 
              source={{ uri: thumbnailUrl || 'https://via.placeholder.com/150/1A1A1A/FFFFFF?text=A' }} 
              style={styles.artistIcon} 
            />
            <Text style={styles.artist} numberOfLines={1}>
              {artist || 'Unknown Artist'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.button} activeOpacity={0.7} onPress={onPress}>
          <Text style={styles.buttonText}>PLAY</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    marginTop: 4,
    backgroundColor: '#333',
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    backgroundColor: '#333',
  },
  artist: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  button: {
    width: '100%',
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    borderRadius: 0,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
