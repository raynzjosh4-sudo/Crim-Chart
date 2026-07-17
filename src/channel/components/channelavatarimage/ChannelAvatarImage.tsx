import { useStyles } from "@/core/hooks/useStyles";
import { colors } from '@/core/theme/colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
export interface ChannelAvatarImageProps {
  size?: number;
  borderWidth?: number;
  imageUrl?: string | null;
  name?: string;
  showStatusRing?: boolean;
  statusCount?: number;
  showActiveDot?: boolean;
  onImageTap?: () => void;
  onLongPress?: () => void;
  ringColor?: string;
  hasStatus?: boolean;
  isStatusRead?: boolean;
}
const getInitials = (name?: string) => {
  if (!name) return '#';
  const cleanName = name.trim();
  if (cleanName.length === 0) return '#';
  const words = cleanName.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return cleanName.substring(0, 2).toUpperCase();
};
const getColorsForInitials = (initials: string) => {
  const charCode = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const palettes = [['#FF512F', '#DD2476'], ['#4776E6', '#8E54E9'], ['#11998e', '#38ef7d'], ['#FF8008', '#FFC837'], ['#834d9b', '#d04ed6'], ['#00c6ff', '#0072ff'], ['#f12711', '#f5af19'], ['#654ea3', '#eaafc8']];
  return palettes[charCode % palettes.length];
};
import { colors as themeColors } from '@/core/theme/colors';
import { useCurrentTheme } from '@/core/store/useThemeStore';
import Svg, { Circle, Path } from 'react-native-svg';

export const ChannelAvatarImage: React.FC<ChannelAvatarImageProps> = ({
  size = 50,
  borderWidth = 2.0,
  imageUrl,
  name,
  showStatusRing = true,
  statusCount = 0,
  showActiveDot = true,
  onImageTap,
  onLongPress,
  ringColor = themeColors.primary,
  hasStatus = false,
  isStatusRead = false
}) => {
  const styles = useStyles(colors => ({
    ringContainer: {
      justifyContent: 'center',
      alignItems: 'center'
    },
    fallbackGradient: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center'
    },
    initialsText: {
      color: colors.text,
      fontWeight: '800',
      letterSpacing: 1
    },
    activeDot: {
      position: 'absolute',
      backgroundColor: themeColors.primary,
      borderColor: colors.background
    }
  }));
  const initials = getInitials(name);
  const bgColors = getColorsForInitials(initials);
  const [imageError, setImageError] = useState(false);
  const theme = useCurrentTheme();

  // If we don't have status, we don't render the ring at all
  const actualShowStatusRing = showStatusRing && hasStatus;
  
  const ringColorResolved = isStatusRead ? theme.colors.surfaceVariant : ringColor;
  
  const renderRing = () => {
    if (!actualShowStatusRing) return null;
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

  const content = <View style={{
    width: size,
    height: size
  }}>
      {renderRing()}
      <View style={[styles.ringContainer, {
        width: actualShowStatusRing ? size - 4 : size,
        height: actualShowStatusRing ? size - 4 : size,
        borderRadius: size / 2,
        position: 'absolute',
        top: actualShowStatusRing ? 2 : 0,
        left: actualShowStatusRing ? 2 : 0,
      }]}>
        <View style={{
        width: '100%',
        height: '100%',
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#1E1E2D'
      }}>
          {imageUrl && imageUrl.trim().length > 0 && !imageError ? <Image source={{
          uri: imageUrl.trim()
        }} style={{
          width: '100%',
          height: '100%'
        }} contentFit="cover" transition={300} onError={() => setImageError(true)} /> : <LinearGradient colors={bgColors} start={{
          x: 0,
          y: 0
        }} end={{
          x: 1,
          y: 1
        }} style={styles.fallbackGradient}>
              <Text style={[styles.initialsText, {
            fontSize: size * 0.4
          }]}>
                {initials}
              </Text>
            </LinearGradient>}
        </View>
      </View>

      {showActiveDot && <View style={[styles.activeDot, {
      width: size * 0.35,
      height: size * 0.35,
      borderRadius: size * 0.35 / 2,
      borderWidth: size * 0.05,
      bottom: size * 0.02,
      right: size * 0.02
    }]} />}
    </View>;
  return <TouchableOpacity onPress={onImageTap} onLongPress={onLongPress} activeOpacity={0.8}>
      {content}
    </TouchableOpacity>;
};