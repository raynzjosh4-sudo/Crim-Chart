import { useStyles } from "@/core/hooks/useStyles";
import React, { useRef } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MediaItem, MediaType } from './models/MediaItem';
interface CombinedVideoTrimmerProps {
  mediaItems: MediaItem[];
  globalProgress: number; // 0.0 to 1.0
  onSeekGlobal: (progress: number) => void;
}
export const CombinedVideoTrimmer: React.FC<CombinedVideoTrimmerProps> = ({
  mediaItems,
  globalProgress,
  onSeekGlobal
}) => {
  const styles = useStyles(colors => ({
    container: {
      height: 60,
      marginHorizontal: 16,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.24)',
      overflow: 'hidden'
    },
    trackWrapper: {
      flex: 1,
      position: 'relative'
    },
    track: {
      flex: 1,
      flexDirection: 'row'
    },
    thumbnailContainer: {
      flex: 1,
      borderWidth: 0.5,
      borderColor: 'rgba(255,255,255,0.1)'
    },
    thumbnail: {
      flex: 1,
      width: '100%',
      height: '100%'
    },
    placeholderThumb: {
      flex: 1,
      backgroundColor: '#333',
      alignItems: 'center',
      justifyContent: 'center'
    },
    placeholderText: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 10
    },
    cursor: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 3,
      backgroundColor: colors.text,
      borderRadius: 2,
      shadowColor: colors.background,
      shadowOffset: {
        width: 1,
        height: 0
      },
      shadowOpacity: 0.45,
      shadowRadius: 4,
      elevation: 4
    }
  }));
  const containerWidth = useSharedValue(0);
  const handleSeek = (x: number) => {
    if (containerWidth.value > 0) {
      const progress = Math.max(0, Math.min(1, x / containerWidth.value));
      onSeekGlobal(progress);
    }
  };
  const cursorStyle = useAnimatedStyle(() => {
    return {
      transform: [{
        translateX: globalProgress * containerWidth.value
      }]
    };
  });
  return <View style={styles.container} onLayout={e => {
    containerWidth.value = e.nativeEvent.layout.width;
  }}>
      <PanGestureHandler onGestureEvent={e => {
      handleSeek(e.nativeEvent.x);
    }}>
        <Animated.View style={styles.trackWrapper}>
          <View style={styles.track}>
            {mediaItems.map((item, index) => <View key={index} style={styles.thumbnailContainer}>
                {item.thumbnailUrl || item.type === MediaType.photo ? <Image source={{
              uri: item.thumbnailUrl || item.path
            }} style={styles.thumbnail} resizeMode="cover" /> : <View style={styles.placeholderThumb}>
                    <Text style={styles.placeholderText}>Movie</Text>
                  </View>}
              </View>)}
          </View>
          
          <Animated.View style={[styles.cursor, cursorStyle]} />
        </Animated.View>
      </PanGestureHandler>
    </View>;
};