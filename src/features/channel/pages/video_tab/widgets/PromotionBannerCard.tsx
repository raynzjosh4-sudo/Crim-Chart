import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MomentData } from '@/data/mockVideoData';

interface PromotionBannerCardProps {
  moment: MomentData;
}

export const PromotionBannerCard: React.FC<PromotionBannerCardProps> = ({ moment }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: moment.thumbnailUrl ?? moment.mediaUrl }} style={styles.image} contentFit="cover" />
      
      <LinearGradient 
        colors={['transparent', 'rgba(0,0,0,0.5)']}
        style={styles.gradient} 
      />

      <View style={styles.authorContainer}>
        <View style={styles.avatarBorder}>
          <Image source={{ uri: moment.authorAvatarUrl }} style={styles.avatar} />
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{moment.authorName}</Text>
          {moment.caption && (
            <Text style={styles.caption} numberOfLines={1}>{moment.caption}</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100, // Adjusting slightly for viewport matching
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 6,
    backgroundColor: '#111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
  },
  authorContainer: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    right: 12,
  },
  avatarBorder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  authorInfo: {
    marginLeft: 8,
    flex: 1,
  },
  authorName: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 9,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
