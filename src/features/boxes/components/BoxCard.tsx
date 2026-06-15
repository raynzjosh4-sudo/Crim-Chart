import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Play, ShoppingBag, Trophy, FolderHeart, Music } from 'lucide-react-native';

export interface BoxModel {
  id: string;
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
  // Determine icon based on box type
  const renderIcon = () => {
    switch (box.boxType) {
      case 'music': return <Music size={14} color="#FFF" />;
      case 'movie': return <Play size={14} color="#FFF" />;
      case 'store': return <ShoppingBag size={14} color="#FFF" />;
      case 'sports': return <Trophy size={14} color="#FFF" />;
      case 'voting': return <FolderHeart size={14} color="#FFF" />;
      default: return <FolderHeart size={14} color="#FFF" />;
    }
  };

  // Determine accent color
  const getAccentColor = () => {
    switch (box.boxType) {
      case 'music': return '#1DB954'; // Spotify Green
      case 'movie': return '#E50914'; // Netflix Red
      case 'store': return '#FF9900'; // Amazon Orange
      case 'sports': return '#00529B'; // Sports Blue
      case 'voting': return '#9C27B0'; // Purple
      default: return '#FACD11'; // Crimchart Yellow
    }
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={() => onPress(box)}
      style={styles.cardContainer}
    >
      {/* Cover Image or Gradient Placeholder */}
      <View style={[styles.coverContainer, { backgroundColor: getAccentColor() }]}>
        {box.coverImageUrl ? (
          <Image source={{ uri: box.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderOverlay}>
             {renderIcon()}
          </View>
        )}
      </View>

      {/* Info Row */}
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
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
