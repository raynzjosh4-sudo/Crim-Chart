import { Image } from 'expo-image';
import { MoreVertical } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface LongVideoTileProps {
  thumbnailUrl: string;
  duration: string;
  title: string;
  channelName: string;
  channelAvatar: string;
  views: string;
  timeAgo: string;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

export const LongVideoTile = ({
  thumbnailUrl,
  duration,
  title,
  channelName,
  channelAvatar,
  views,
  timeAgo,
  onPress,
  onOptionsPress
}: LongVideoTileProps) => {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPress}>
      {/* Thumbnail Section */}
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: thumbnailUrl }} 
          style={styles.thumbnail} 
          contentFit="cover" 
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{duration}</Text>
        </View>
      </View>

      {/* Details Section */}
      <View style={styles.detailsContainer}>
        {/* Avatar */}
        <Image 
          source={{ uri: channelAvatar }} 
          style={styles.avatar} 
          contentFit="cover" 
        />
        
        {/* Text Details */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {channelName} • {views} • {timeAgo}
          </Text>
        </View>

        {/* Options Button */}
        <TouchableOpacity activeOpacity={1} style={styles.optionsBtn} onPress={onOptionsPress}>
          <MoreVertical size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#000',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#333',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 4,
  },
  subtitle: {
    color: '#AAAAAA',
    fontSize: 13,
    fontWeight: '400',
  },
  optionsBtn: {
    padding: 4,
  }
});
