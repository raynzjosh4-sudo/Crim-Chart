import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Play, Pause, Music } from 'lucide-react-native';

interface MusicListTileProps {
  title: string;
  subtitle: string;
  thumbnailUrl?: string;
  isSelected?: boolean;
  isPlaying?: boolean;
  onPress: () => void;
  onPlayPress?: () => void;
}

export const MusicListTile: React.FC<MusicListTileProps> = ({
  title,
  subtitle,
  thumbnailUrl,
  isSelected,
  isPlaying,
  onPress,
  onPlayPress
}) => {
  return (
    <TouchableOpacity 
      style={[styles.container, isSelected && styles.containerSelected]} 
      activeOpacity={0.8} 
      onPress={onPress}
    >
      {/* Left Thumbnail */}
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <View style={styles.iconPlaceholder}>
          <Music color="#FACD11" size={24} />
        </View>
      )}

      {/* Middle Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitleText} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Right Action (Play Button / Selection Checkmark) */}
      <View style={styles.rightAction}>
        {isSelected ? (
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmark} />
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.playButton} 
            activeOpacity={0.7} 
            onPress={onPlayPress || onPress}
          >
            {isPlaying ? (
              <Pause fill="#FFF" color="#FFF" size={16} />
            ) : (
              <Play fill="#FFF" color="#FFF" size={16} style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0D0D0D', // Dark background matching the image
  },
  containerSelected: {
    backgroundColor: 'rgba(250, 205, 17, 0.1)',
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 16, // squircle shape
    backgroundColor: '#333',
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(250, 205, 17, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(250, 205, 17, 0.2)',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  titleText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtitleText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },
  rightAction: {
    marginLeft: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#222226', // Dark gray circle
    justifyContent: 'center',
    alignItems: 'center',
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
