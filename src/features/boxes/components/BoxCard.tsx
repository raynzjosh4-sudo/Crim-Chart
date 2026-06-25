import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Play, ShoppingBag, Trophy, FolderHeart, Music } from 'lucide-react-native';
import { Image } from 'expo-image';

export interface BoxModel {
  id: string;
  postId?: string;
  title: string;
  boxType: 'music' | 'movie' | 'store' | 'sports' | 'voting';
  coverImageUrl?: string;
  itemCount: number;
  isPublic?: boolean;
  allowSubmissions?: boolean;
  ageRestriction?: string;
  countryRestrictions?: string[];
  visibleToFollowedUsers?: boolean;
  owner_id?: string;
  raw?: any;
}

interface BoxCardProps {
  key?: React.Key;
  box: BoxModel;
  onPress: (box: BoxModel) => void;
}

export const BoxCard: React.FC<BoxCardProps> = ({ box, onPress }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderIcon = () => {
    switch (box.boxType) {
      case 'music': return <Music size={24} color="rgba(255,255,255,0.5)" />;
      case 'movie': return <Play size={24} color="rgba(255,255,255,0.5)" />;
      case 'store': return <ShoppingBag size={24} color="rgba(255,255,255,0.5)" />;
      case 'sports': return <Trophy size={24} color="rgba(255,255,255,0.5)" />;
      case 'voting': return <FolderHeart size={24} color="rgba(255,255,255,0.5)" />;
      default: return <FolderHeart size={24} color="rgba(255,255,255,0.5)" />;
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => onPress(box)}
      style={styles.cardContainer}
    >
      <View style={styles.coverContainer}>
        {/* Shimmer Background */}
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.shimmerBg, { opacity }]} />
        
        {/* Icon Fallback */}
        <View style={styles.iconFallback}>
          {renderIcon()}
        </View>

        {box.coverImageUrl ? (
          <Image 
            source={{ uri: box.coverImageUrl }} 
            style={[styles.coverImage, { opacity: isImageLoaded ? 1 : 0 }]} 
            contentFit="cover"
            onLoad={() => setIsImageLoaded(true)}
            transition={300}
          />
        ) : null}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.titleText} numberOfLines={1}>
          {box.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: 140,
    marginRight: 12,
  },
  coverContainer: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1A1A1A', // Base dark gray
  },
  shimmerBg: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  iconFallback: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },

  infoContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  titleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
});
