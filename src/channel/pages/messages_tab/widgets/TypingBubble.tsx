import { useStyles } from "@/core/hooks/useStyles";
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { colors } from '@/core/theme/colors';
import { MessageModel } from '../models/MessageModel';
const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(Animated.sequence([Animated.delay(delay), Animated.timing(dot, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }), Animated.timing(dot, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      }), Animated.delay(1200 - 800 - delay)])).start();
    };
    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, [dot1, dot2, dot3]);
  const renderDot = (dot: Animated.Value) => {
    const translateY = dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -4]
    });
    const opacity = dot.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1]
    });
    return <Animated.View style={[styles.dot, {
      transform: [{
        translateY
      }],
      opacity
    }]} />;
  };
  return <View style={styles.dotsContainer}>
      {renderDot(dot1)}
      {renderDot(dot2)}
      {renderDot(dot3)}
    </View>;
};
interface TypingBubbleProps {
  sender: MessageModel;
}
export const TypingBubble: React.FC<TypingBubbleProps> = ({
  sender
}) => {
  const styles = useStyles(colors => ({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingVertical: 6,
      paddingHorizontal: 16
    },
    avatarContainer: {
      width: 32,
      height: 32,
      marginRight: 8,
      marginBottom: 4,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      overflow: 'hidden',
      backgroundColor: '#333'
    },
    avatar: {
      width: '100%',
      height: '100%'
    },
    bubble: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#2A2A2A',
      // surfaceContainerHighest
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
      shadowColor: colors.background,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 2
    },
    dotsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 12
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginHorizontal: 2
    }
  }));
  return <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <ExpoImage source={{
        uri: sender.user.avatarUrl
      }} style={styles.avatar} contentFit="cover" />
      </View>

      {/* Bubble */}
      <View style={styles.bubble}>
        <TypingDots />
      </View>
    </View>;
};