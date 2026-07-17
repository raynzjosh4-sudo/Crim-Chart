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

import Svg, { Circle, Path } from 'react-native-svg';

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

  const renderRing = () => {
    if (!showStatusRing) return null;
    const ringColorResolved = ringColor || colors.primary;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - borderWidth / 2;
    
    if (statusCount <= 1) {
      return (
        <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
          <Circle cx={cx} cy={cy} r={r} stroke={ringColorResolved} strokeWidth={borderWidth} fill="none" />
        </Svg>
      );
    }
    
    const desiredVisualGap = 2;
    const gapAngle = (borderWidth + desiredVisualGap) / r;
    
    if (gapAngle * statusCount >= 2 * Math.PI) {
      return (
        <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
          <Circle cx={cx} cy={cy} r={r} stroke={ringColorResolved} strokeWidth={borderWidth} fill="none" />
        </Svg>
      );
    }

    const arcLength = (2 * Math.PI - statusCount * gapAngle) / statusCount;
    const segments: React.ReactNode[] = [];

    for (let i = 0; i < statusCount; i++) {
      const startAngle = -Math.PI / 2 + i * (arcLength + gapAngle);
      const endAngle = startAngle + arcLength;
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = arcLength > Math.PI ? 1 : 0;

      segments.push(
        <React.Fragment key={i}>
          <Path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            stroke={ringColorResolved}
            strokeWidth={borderWidth}
            strokeLinecap="round"
            fill="none"
          />
        </React.Fragment>
      );
    }

    return (
      <Svg width={size} height={size} style={StyleSheet.absoluteFillObject}>
        {segments}
      </Svg>
    );
  };

  const content = (
    <View style={[styles.container, { width: size, height: size }]}>
      {renderRing()}
      <View style={[
        styles.imageContainer, 
        { 
          width: size - (padding * 2), 
          height: size - (padding * 2), 
          borderRadius: (size - (padding * 2)) / 2,
          position: 'absolute',
          top: padding,
          left: padding,
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
