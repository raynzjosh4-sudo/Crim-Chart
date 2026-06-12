import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { User } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface MemberImageProps {
  size: number;
  imageUrl?: string;
  showStatusRing?: boolean;
  statusCount?: number;
  ringColor?: string;
  onTap?: () => void;
}

export const MemberImage: React.FC<MemberImageProps> = ({
  size,
  imageUrl,
  showStatusRing = false,
  statusCount = 0,
  ringColor,
  onTap,
}) => {
  const borderWidth = 2;
  const padding = showStatusRing ? 3 : 0;

  const content = (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[
        styles.ring, 
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          borderColor: showStatusRing ? (ringColor || colors.primary) : 'transparent',
          borderWidth: showStatusRing ? borderWidth : 0,
        }
      ]}>
        <View style={[
          styles.imageContainer, 
          { 
            width: size - (padding * 2), 
            height: size - (padding * 2), 
            borderRadius: (size - (padding * 2)) / 2,
            margin: padding - (showStatusRing ? borderWidth : 0)
          }
        ]}>
          {imageUrl ? (
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.image}
              contentFit="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <User size={size * 0.5} color="rgba(255, 255, 255, 0.2)" />
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (onTap) {
    return (
      <TouchableOpacity onPress={onTap} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
