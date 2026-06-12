import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { colors } from '@/core/theme/colors';
import ThemeShimmer from '@/components/ui/ThemeShimmer';

interface CrimchartUserAvatarImageProps {
  url?: string | null;
  thumbnailUrl?: string;
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  width?: number;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function CrimchartUserAvatarImage({
  url,
  thumbnailUrl,
  fit = 'cover',
  width,
  height,
  borderRadius,
  style,
}: CrimchartUserAvatarImageProps) {
  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    overflow: borderRadius !== undefined ? 'hidden' : undefined,
  };

  const Fallback = (
    <View
      style={[
        styles.fallback,
        { width, height, backgroundColor: 'rgba(255,255,255,0.05)' },
      ]}
    />
  );

  const Shimmer = (
    <ThemeShimmer width={width} height={height} borderRadius={borderRadius} />
  );

  if (!url) {
    return <View style={[containerStyle, style]}>{Fallback}</View>;
  }

  // expo-image handles both http URLs and local file:// paths
  return (
    <ExpoImage
      source={{ uri: url }}
      placeholder={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
      placeholderContentFit={fit}
      contentFit={fit}
      style={[{ width, height, borderRadius }, style as any]}
      transition={200}
      // Use the ThemeShimmer as loading indicator via a wrapper
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
