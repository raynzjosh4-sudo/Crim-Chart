import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Users, PlaySquare } from 'lucide-react-native';
import { colors } from '@/core/theme/colors';

interface ChannelAvatarProps {
  imageUrl?: string | null;
  leaderAvatarUrl?: string | null;
  size?: number;
  borderWidth?: number;
  borderColor?: string;
  isActive?: boolean;
}

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  imageUrl,
  leaderAvatarUrl,
  size = 58.0,
  borderWidth = 2.0,
  borderColor,
  isActive = true,
}) => {
  const primaryColor = colors.primary;
  const resolvedBorderColor = borderColor ?? primaryColor;

  // Proportional sizes for the triple-layer design
  const baseSize = size * 0.85;
  const badgeSize = size * 0.38;

  const renderCircle = (
    circleSize: number,
    url: string | null | undefined,
    circleBorderColor: string,
    circleBorderWidth: number,
    hasShadow: boolean = false
  ) => {
    return (
      <View
        style={[
          styles.circleContainer,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: circleBorderWidth,
            borderColor: circleBorderColor,
            backgroundColor: '#1E1E1E', // Placeholder background
          },
          hasShadow && styles.shadow,
        ]}
      >
        {url ? (
          <ExpoImage
            source={{ uri: url }}
            style={{ width: '100%', height: '100%', borderRadius: circleSize / 2 }}
            contentFit="cover"
            placeholder={'LGF5]+Yk^6#M@-5c,1Ex@@or[Q6.'}
          />
        ) : (
          <View style={styles.placeholder}>
            <Users size={circleSize * 0.4} color="rgba(255,255,255,0.24)" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ width: size, height: size }}>
      {/* LAYER 1: BACK AVATAR (MAIN USER/LEADER) */}
      <View style={[styles.layer, { top: 0, left: size * 0.15 }]}>
        {renderCircle(
          baseSize,
          leaderAvatarUrl,
          'rgba(250, 205, 17, 0.5)', // Equivalent to primaryColor.withOpacity(0.5)
          borderWidth
        )}
      </View>

      {/* LAYER 2: FRONT AVATAR (CHANNEL LOGO) */}
      <View style={[styles.layer, { bottom: 4, left: 0 }]}>
        {renderCircle(
          baseSize,
          imageUrl,
          resolvedBorderColor,
          borderWidth,
          true
        )}
      </View>

      {/* LAYER 3: APP ICON BADGE */}
      <View style={[styles.layer, { bottom: -2, left: baseSize * 0.45 }]}>
        <View style={[styles.badgeContainer, { width: badgeSize * 1.1, height: badgeSize * 1.1 }]}>
          <PlaySquare size={badgeSize * 0.7} color="#fff" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
  },
  circleContainer: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholder: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
  },
  badgeContainer: {
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
