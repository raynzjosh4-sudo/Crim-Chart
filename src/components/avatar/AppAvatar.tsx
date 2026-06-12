import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { User } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';
import ThemeShimmer from '@/components/ui/ThemeShimmer';

interface AppAvatarProps {
  imageUrl?: string | null;
  url?: string | null;          // alias used by some callers
  size?: number;
  // Status ring (new names)
  hasStatus?: boolean;
  isStatusRead?: boolean;
  statusSegmentCount?: number;
  ringColor?: string;
  // Legacy prop aliases from Flutter port
  showStatusRing?: boolean;
  showActiveDot?: boolean;
  useHexagon?: boolean;
  onImageTap?: () => void;
  // Online indicator
  isOnline?: boolean;
  // Interactions
  onTap?: () => void;
  onLongPress?: () => void;
  // Visuals
  fallbackIcon?: React.ReactNode;
  style?: ViewStyle;
}

export default function AppAvatar({
  imageUrl,
  url,
  size = 40,
  hasStatus = false,
  showStatusRing,
  isStatusRead = false,
  statusSegmentCount = 0,
  ringColor,
  isOnline = false,
  showActiveDot,
  onTap,
  onImageTap,
  onLongPress,
  fallbackIcon,
  style,
}: AppAvatarProps) {
  const resolvedUrl = imageUrl ?? url ?? null;
  const resolvedHasStatus = hasStatus || showStatusRing || false;
  const resolvedIsOnline = isOnline || showActiveDot || false;
  const resolvedOnTap = onTap ?? onImageTap;
  const RING_THICKNESS = 2.5;
  const RING_SPACING = 4;
  const totalSize = resolvedHasStatus ? size + RING_THICKNESS * 2 + RING_SPACING : size;

  const ringColorResolved = isStatusRead
    ? 'rgba(150,150,150,0.5)'
    : ringColor || colors.primary;

  const onlineDotSize = size * 0.28;
  const onlineDotOffset = totalSize * 0.05;

  const Fallback = (
    <View style={[styles.fallback, { width: size, height: size }]}>
      {fallbackIcon ?? (
        <User
          color="rgba(255,255,255,0.4)"
          size={size * 0.5}
        />
      )}
    </View>
  );

  const renderRing = () => {
    if (!resolvedHasStatus) return null;
    const cx = totalSize / 2;
    const cy = totalSize / 2;
    const r = totalSize / 2 - RING_THICKNESS / 2;
    const circumference = 2 * Math.PI * r;

    if (statusSegmentCount <= 1) {
      // Single solid ring — use SVG circle
      return (
        <Svg
          width={totalSize}
          height={totalSize}
          style={StyleSheet.absoluteFillObject}
        >
          {isStatusRead ? (
            <Circle
              cx={cx}
              cy={cy}
              r={r}
              stroke={ringColorResolved}
              strokeWidth={RING_THICKNESS}
              fill="none"
            />
          ) : (
            <>
              {/* Gradient ring approximation via defs */}
              <Circle
                cx={cx}
                cy={cy}
                r={r}
                stroke={ringColorResolved}
                strokeWidth={RING_THICKNESS}
                fill="none"
                strokeOpacity={0.9}
              />
            </>
          )}
        </Svg>
      );
    }

    // Segmented ring
    const gapAngle = 0.12; // radians
    const arcLength =
      (2 * Math.PI - statusSegmentCount * gapAngle) / statusSegmentCount;
    const segments: React.ReactNode[] = [];

    for (let i = 0; i < statusSegmentCount; i++) {
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
            strokeWidth={RING_THICKNESS}
            strokeLinecap="round"
            fill="none"
          />
        </React.Fragment>
      );
    }

    return (
      <Svg
        width={totalSize}
        height={totalSize}
        style={StyleSheet.absoluteFillObject}
      >
        {segments}
      </Svg>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={resolvedOnTap ? 0.7 : 1}
      onPress={resolvedOnTap}
      onLongPress={onLongPress}
      disabled={!resolvedOnTap && !onLongPress}
      style={[{ width: totalSize, height: totalSize }, style]}
    >
      {/* Status Ring */}
      {renderRing()}

      {/* Avatar image */}
      <View
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: resolvedHasStatus ? RING_THICKNESS + RING_SPACING / 2 : 0,
            left: resolvedHasStatus ? RING_THICKNESS + RING_SPACING / 2 : 0,
          },
        ]}
      >
        {resolvedUrl ? (
          <ExpoImage
            source={{ uri: resolvedUrl }}
            contentFit="cover"
            style={{ width: size, height: size, borderRadius: size / 2 }}
            placeholder={'LGF5]+Yk^6#M@-5c,1Ex@@or[Q6.'}  
          />
        ) : (
          Fallback
        )}
      </View>

      {/* Online Indicator */}
      {resolvedIsOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: onlineDotSize,
              height: onlineDotSize,
              borderRadius: onlineDotSize / 2,
              right: onlineDotOffset,
              bottom: onlineDotOffset,
              borderColor: colors.background,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fallback: {
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'absolute',
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
});
