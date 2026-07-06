import { useStyles } from "@/core/hooks/useStyles";
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { BadgeCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { VideoPost } from '@/video/models/VideoPost';
interface VideoCardProps {
  video: VideoPost;
  height: number;
  index: number;
  allVideos: VideoPost[];
}
export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  height,
  index,
  allVideos
}) => {
  const styles = useStyles(colors => ({
    container: {
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#111',
      position: 'relative'
    },
    thumbnail: {
      width: '100%',
      height: '100%'
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      padding: 10,
      justifyContent: 'flex-end'
    },
    gradient: {
      ...StyleSheet.absoluteFillObject
    },
    info: {
      gap: 4
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    authorName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      flexShrink: 1
    },
    caption: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 10,
      fontWeight: '500'
    }
  }));
  const navigation = useNavigation() as any;
  const openFeed = () => {
    navigation.navigate('VideoFeedPage', {
      initialIndex: index,
      initialVideos: allVideos,
      showBack: true,
      initialTab: 'Channel'
    });
  };
  return <Pressable style={[styles.container, {
    height
  }]} onPress={openFeed}>
      <Image source={{
      uri: video.thumbnailUrl
    }} style={styles.thumbnail} contentFit="cover" />
      
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} style={styles.gradient} />
      
      <View style={styles.overlay}>
        <View style={styles.info}>
          <View style={styles.authorRow}>
            <Text style={styles.authorName} numberOfLines={1}>{video.authorName}</Text>
            <BadgeCheck size={14} color="#FACD11" />
          </View>
          {video.caption ? <Text style={styles.caption} numberOfLines={2}>{video.caption}</Text> : null}
        </View>
      </View>
    </Pressable>;
};