import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, withDelay, Easing, interpolate } from 'react-native-reanimated';
import { Music } from 'lucide-react-native';
interface AudioStatusOverlayProps {
  title?: string;
  artist?: string;
  lyrics?: string;
  thumbnail?: string;
}
const {
  width,
  height
} = Dimensions.get('window');
export const AudioStatusOverlay: React.FC<AudioStatusOverlayProps> = ({
  title = 'Unknown Track',
  artist = 'Unknown Artist',
  lyrics,
  thumbnail
}) => {
  const styles = useStyles(colors => ({
    container: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      zIndex: 10
    },
    centerContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      maxWidth: 400
    },
    discContainer: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: '#111',
      borderWidth: 4,
      borderColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 10
      },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
      marginBottom: 32
    },
    discImage: {
      width: '100%',
      height: '100%',
      borderRadius: 100
    },
    discHole: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: colors.background,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)'
    },
    trackInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 30,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
    },
    titleText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: 'bold'
    },
    artistText: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 14
    },
    lyricsWindow: {
      height: 120,
      width: '100%',
      overflow: 'hidden',
      alignItems: 'center',
      ...Platform.select({
        web: {
          maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
        } as any
      })
    },
    lyricsText: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: 32,
      textShadowColor: 'rgba(0,0,0,0.8)',
      textShadowOffset: {
        width: 0,
        height: 2
      },
      textShadowRadius: 4
    }
  }));
  // Disc rotation
  const rotation = useSharedValue(0);

  // Lyrics scrolling
  const lyricsScroll = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, {
      duration: 10000,
      easing: Easing.linear
    }), -1, false);
    if (lyrics) {
      // Very simple slow scroll up for lyrics
      lyricsScroll.value = withRepeat(withSequence(withTiming(0, {
        duration: 0
      }), withTiming(-400, {
        duration: 15000,
        easing: Easing.linear
      })), -1, false);
    }
  }, [lyrics]);
  const discStyle = useAnimatedStyle(() => ({
    transform: [{
      rotateZ: `${rotation.value}deg`
    }]
  }));
  const lyricsStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: lyricsScroll.value
    }]
  }));
  return <View style={styles.container} pointerEvents="none">
      {/* Background blurred cover art handled by parent */}
      
      {/* Center content */}
      <View style={styles.centerContainer}>
        {/* Spinning Disc */}
        <Animated.View style={[styles.discContainer, discStyle]}>
          <Image source={thumbnail ? {
          uri: thumbnail
        } : require('@/../assets/images/icon.png')} style={styles.discImage} contentFit="cover" />
          <View style={styles.discHole} />
        </Animated.View>

        {/* Track Info */}
        <View style={styles.trackInfo}>
          <Music size={16} color="#FFB800" style={{
          marginRight: 8
        }} />
          <View>
            <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            <Text style={styles.artistText} numberOfLines={1}>{artist}</Text>
          </View>
        </View>

        {/* Lyrics Window */}
        {lyrics ? <View style={styles.lyricsWindow}>
            <Animated.View style={lyricsStyle}>
              <Text style={styles.lyricsText}>{lyrics}</Text>
            </Animated.View>
          </View> : null}
      </View>
    </View>;
};