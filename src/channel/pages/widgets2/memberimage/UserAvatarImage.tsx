import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { CrimchartUserAvatorImage } from '@/components/CrimChartUserAvatorImage/CrimChartUserAvatorImage';

export interface UserAvatarImageProps {
  size?: number;
  borderWidth?: number;
  imageUrl?: string | null;
  showStatusRing?: boolean;
  statusCount?: number;
  showActiveDot?: boolean;
  useHexagon?: boolean;
  onImageTap?: () => void;
  ringColor?: string;
  name?: string;
  hasStatus?: boolean;
}

export const UserAvatarImage: React.FC<UserAvatarImageProps> = ({
  size = 50,
  borderWidth = 2.0,
  imageUrl,
  showStatusRing = true,
  statusCount = 0,
  showActiveDot = true,
  useHexagon = false,
  onImageTap,
  ringColor = '#E41E3F',
}) => {
  const content = (
    <View style={{ width: size, height: size }}>
      <View style={[
        styles.ringContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: showStatusRing ? borderWidth : 0,
          borderColor: showStatusRing ? ringColor : 'transparent',
          padding: showStatusRing ? 2 : 0,
        }
      ]}>
        <CrimchartUserAvatorImage 
          url={imageUrl || undefined} 
          width="100%" 
          height="100%" 
          borderRadius={size / 2} 
        />
      </View>

      {showActiveDot && (
        <View style={[
          styles.activeDot,
          {
            width: size * 0.26,
            height: size * 0.26,
            borderRadius: (size * 0.26) / 2,
            borderWidth: size * 0.045,
            bottom: showStatusRing ? -(size * 0.06) : size * 0.04,
            right: showStatusRing ? -(size * 0.06) : size * 0.04,
          }
        ]} />
      )}
    </View>
  );

  return (
    <TouchableOpacity onPress={onImageTap} activeOpacity={0.8}>
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ringContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    position: 'absolute',
    backgroundColor: '#E41E3F',
    borderColor: '#000',
  },
});
