import React, { useState } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { Image, ImageContentFit } from 'expo-image';
import { Image as ImageIcon } from 'lucide-react-native';
import { ThemeShimmer } from '../../features/channel/pages/widgets2/memberimage/UserAvatorShimmer';

interface CrimChartUserAvatorImageProps {
  url?: string;
  thumbnailUrl?: string;
  fit?: ImageContentFit;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: StyleProp<ImageStyle>;
}

export const CrimchartUserAvatorImage: React.FC<CrimChartUserAvatorImageProps> = ({
  url,
  thumbnailUrl,
  fit = 'cover',
  width = '100%',
  height = '100%',
  borderRadius,
  style,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!url || url.length === 0 || imageError) {
    return (
      <View style={[{ width, height, borderRadius }, styles.fallback, style as ViewStyle]}>
        <ImageIcon color="rgba(255,255,255,0.2)" size={24} />
      </View>
    );
  }

  return (
    <View style={[{ width, height, borderRadius, overflow: 'hidden' }, style as ViewStyle]}>
      <Image
        source={{ uri: url }}
        placeholder={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
        contentFit={fit}
        transition={300}
        style={{ width: '100%', height: '100%' }}
        onError={() => setImageError(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: '#1E1E2D',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
